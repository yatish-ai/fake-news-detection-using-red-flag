import os
import sys
import numpy as np
import joblib
import urllib.request
import re
import json
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from bs4 import BeautifulSoup
from typing import List, Dict, Any, Optional

from app.llm_service import analyze_article as llm_analyze_article

from app.schemas import (
    NewsRequest, 
    PredictionResponse, 
    HealthResponse, 
    KeywordScore, 
    UrlRequest, 
    ScrapedNewsResponse, 
    LatestNewsResponse, 
    NewsArticle,
    RedFlagItem,
    RedFlagAnalysis
)

# Paths to the model files
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(os.path.dirname(BASE_DIR), "model")
MODEL_PATH = os.path.join(MODEL_DIR, "model.pkl")
VECTORIZER_PATH = os.path.join(MODEL_DIR, "vectorizer.pkl")

# Environment Variables
NEWS_API_KEY = os.getenv("NEWS_API_KEY", "your_news_api_key_here")

# Initialize FastAPI App
app = FastAPI(
    title="Real-Time Fake News Detector API",
    description="FastAPI Backend for detecting fake news using a PassiveAggressive ML model.",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for model and vectorizer
model = None
vectorizer = None
model_classes = ["FAKE", "REAL"] # Default order

def load_ml_model():
    global model, vectorizer, model_classes
    # Try multiple paths for deployment flexibility
    paths_to_try = [
        (MODEL_PATH, VECTORIZER_PATH),
        (os.path.join(BASE_DIR, "model", "model.pkl"), os.path.join(BASE_DIR, "model", "vectorizer.pkl")),
        ("/model/model.pkl", "/model/vectorizer.pkl"),
        ("/app/model/model.pkl", "/app/model/vectorizer.pkl"),
        (os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "model", "model.pkl"),
         os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "model", "vectorizer.pkl"))
    ]
    
    for m_p, v_p in paths_to_try:
        if os.path.exists(m_p) and os.path.exists(v_p):
            try:
                model = joblib.load(m_p)
                vectorizer = joblib.load(v_p)
                if hasattr(model, "classes_"):
                    model_classes = list(model.classes_)
                print(f"ML model and vectorizer loaded successfully from: {m_p}")
                return
            except Exception as e:
                print(f"Error loading model from {m_p}: {e}")
    
    print("Warning: ML model files not found. App will run in fallback demonstration mode.")


def analyze_red_flags(title: str, text: str) -> RedFlagAnalysis:
    """Identify editorial warning signs; these heuristics do not establish truth or falsity."""
    combined = f"{title} {text}"
    flags = []

    def add(category: str, severity: str, message: str, evidence: str):
        flags.append(RedFlagItem(category=category, severity=severity, message=message, evidence=evidence[:180]))

    headline = title.strip()
    if re.search(r"\b(shocking|unbelievable|爆|miracle|secret|you won't believe|must see|exposed|breaking)\b", headline, re.I):
        match = re.search(r"\b(shocking|unbelievable|miracle|secret|you won't believe|must see|exposed|breaking)\b", headline, re.I)
        add("Sensational headline", "medium", "The headline uses emotionally charged or attention-grabbing wording.", match.group(0))

    if re.search(r"\b(what happens next|click here|you won't believe|this is why|doctors hate|one simple trick)\b", combined, re.I):
        match = re.search(r"\b(what happens next|click here|you won't believe|this is why|doctors hate|one simple trick)\b", combined, re.I)
        add("Clickbait language", "medium", "A phrase commonly used to create curiosity rather than describe the claim clearly.", match.group(0))

    if re.search(r"!{2,}|\?{2,}", headline) or (headline.count("!") + headline.count("?") >= 3):
        add("Excessive punctuation", "low", "Repeated or excessive punctuation may be used to amplify emotion.", headline)

    letters = [c for c in headline if c.isalpha()]
    if len(letters) >= 12 and sum(c.isupper() for c in letters) / len(letters) >= 0.65:
        add("Excessive capitalization", "low", "Most alphabetic characters in the headline are uppercase.", headline)

    absolute_patterns = [r"\b(100% proven|guaranteed|undeniable proof|everyone agrees|no doubt)\b", r"\b(always|never)\b"]
    for pattern in absolute_patterns:
        match = re.search(pattern, combined, re.I)
        if match:
            add("Absolute or overconfident claim", "medium", "The article uses absolute wording that should be checked against evidence.", match.group(0))
            break

    if not re.search(r"https?://|\b(according to|reported by|study|research|official|statement|data from|source:)\b", text, re.I):
        add("No clear supporting source in text", "medium", "The supplied text does not contain an obvious citation, link, or attribution. This may simply be omitted from the excerpt.", "No source attribution detected in the supplied text")

    weights = {"low": 8, "medium": 16, "high": 25}
    score = min(100, sum(weights[f.severity] for f in flags))
    level = "High" if score >= 50 else "Moderate" if score >= 24 else "Low"
    if not flags:
        summary = "No obvious red-flag patterns were detected by these text-based checks. This does not verify the article's accuracy."
    else:
        summary = f"Detected {len(flags)} potential warning sign(s). Review the evidence and verify the claims with independent, reliable sources."

    return RedFlagAnalysis(
        score=score,
        level=level,
        summary=summary,
        flags=flags,
        disclaimer="Red flags are indicators for further review, not proof that an article is fake. This analysis checks supplied text only; it does not independently verify claims or assess the publisher unless source data is provided."
    )

@app.on_event("startup")
async def startup_event():
    load_ml_model()

@app.get("/health", response_model=HealthResponse)
def health_check():
    """Health check endpoint for deployment monitoring."""
    return {
        "status": "healthy",
        "model_loaded": (model is not None and vectorizer is not None)
    }

@app.post("/predict", response_model=PredictionResponse)
def predict_news(payload: NewsRequest):
    """
    Predicts whether the input news article is REAL or FAKE.
    Includes model confidence and feature importance (contributing keywords).
    """
    global model, vectorizer, model_classes
    
    # 1. Fallback / Demo Mode if model is not loaded (e.g. initial setup)
    if model is None or vectorizer is None:
        # Load again in case they were generated post-startup
        load_ml_model()
        if model is None or vectorizer is None:
            # Semi-random deterministic response for demo if training failed
            text_len = len(payload.text)
            is_fake = "unbelievable" in payload.text.lower() or "secret" in payload.text.lower() or "miracle" in payload.text.lower() or text_len % 2 == 0
            prediction = "FAKE" if is_fake else "REAL"
            confidence = 88.5 if is_fake else 92.4
            
            explanation = "DEMO MODE (Model not loaded): Text contains sensational vocabulary associated with clickbait." if is_fake else "DEMO MODE (Model not loaded): Writing style conforms to standard journalistic patterns."
            
            # Mock keywords
            key_terms = [
                KeywordScore(word="secret", score=0.85 if is_fake else -0.12),
                KeywordScore(word="unbelievable", score=0.92 if is_fake else -0.05),
                KeywordScore(word="miracle", score=0.74 if is_fake else 0.05),
                KeywordScore(word="news", score=-0.15 if is_fake else 0.45)
            ]
            return PredictionResponse(
                prediction=prediction,
                confidence=confidence,
                explanation=explanation,
                key_terms=key_terms,
                red_flag_analysis=analyze_red_flags(payload.title, payload.text)
            )

    # 2. Main Inference
    try:
        # Combine title and text exactly like in training
        combined_text = payload.title + " " + payload.text
        
        # Transform the input text
        tfidf_vector = vectorizer.transform([combined_text])
        
        # Predict class
        prediction = model.predict(tfidf_vector)[0]
        
        # Calculate confidence using sigmoid on decision_function
        decision_score = model.decision_function(tfidf_vector)[0]
        
        # Mapping decision score to probability via sigmoid
        # prob represents the probability of the class with label index 1 (usually REAL)
        prob = 1 / (1 + np.exp(-decision_score))
        
        # If prediction matches class 1, confidence is prob. Else, 1 - prob.
        class_1_label = model_classes[1] if len(model_classes) > 1 else "REAL"
        
        if prediction == class_1_label:
            confidence = prob * 100
        else:
            confidence = (1 - prob) * 100
            
        # Ensure confidence is in range [50, 100] for display
        confidence = max(50.0, min(100.0, confidence))
        confidence = round(float(confidence), 2)
        
        # 3. Dynamic Keyword Influence Analysis
        # Get feature names and model coefficients
        feature_names = vectorizer.get_feature_names_out()
        coefficients = model.coef_[0]
        
        # Find non-zero indices in the TF-IDF representation of the input
        coo = tfidf_vector.tocoo()
        
        influence_list = []
        for col_idx, tfidf_val in zip(coo.col, coo.data):
            word = feature_names[col_idx]
            coef = coefficients[col_idx]
            # score = tfidf * coefficient
            # If positive, it pulls toward class 1 (REAL). If negative, toward class 0 (FAKE).
            score = tfidf_val * coef
            influence_list.append((word, score))
            
        # Sort terms by absolute influence
        influence_list.sort(key=lambda x: abs(x[1]), reverse=True)
        
        # Format the top contributing terms (up to 6)
        key_terms = []
        for word, score in influence_list[:6]:
            key_terms.append(KeywordScore(word=word, score=round(float(score), 4)))
            
        # 4. Generate dynamic explanations based on prediction and confidence
        if prediction == "FAKE":
            if confidence > 85:
                explanation = "High confidence of misinformation. The text pattern, syntactic structures, and vocabulary heavily align with known false narratives and sensational clickbait."
            else:
                explanation = "Moderate warning of inaccuracy. The article exhibits biased phrasing and unverified assertions typical of unreliable sources."
        else:
            if confidence > 85:
                explanation = "High probability of authenticity. The vocabulary, structured reporting, and formal sentence structure closely mimic factual press releases and mainstream journalism."
            else:
                explanation = "Likely reliable, but review advised. While the text is structured cleanly, some phrasing and buzzwords resemble partisan commentary."

        return PredictionResponse(
            prediction=prediction,
            confidence=confidence,
            explanation=explanation,
            key_terms=key_terms,
            red_flag_analysis=analyze_red_flags(payload.title, payload.text)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {str(e)}"
        )

@app.get("/latest-news", response_model=LatestNewsResponse)
def get_latest_news():
    """
    Fetches the latest trending news headlines from NewsAPI.
    Falls back to curated mock news if the API key is not configured, missing, or fails.
    """
    global NEWS_API_KEY
    
    # Check if API Key is not configured
    if not NEWS_API_KEY or NEWS_API_KEY == "your_news_api_key_here" or NEWS_API_KEY.strip() == "":
        print("NewsAPI Key is placeholder or empty. Returning mock data.")
        return get_mock_news()
        
    try:
        url = f"https://newsapi.org/v2/top-headlines?country=us&apiKey={NEWS_API_KEY}"
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
            if data.get("status") == "ok":
                filtered_articles = []
                for art in data.get("articles", []):
                    # Filter out deleted articles
                    if art.get("title") and art.get("title") != "[Removed]":
                        filtered_articles.append(art)
                
                return {
                    "status": "ok",
                    "totalResults": len(filtered_articles),
                    "articles": filtered_articles
                }
            else:
                print(f"NewsAPI error response: {data}")
                return get_mock_news()
    except Exception as e:
        print(f"Exception fetching from NewsAPI: {e}. Falling back to mock news.")
        return get_mock_news()

@app.post("/scrape-url", response_model=ScrapedNewsResponse)
def scrape_url(payload: UrlRequest):
    """
    Fetches a web page by URL, parses it, and extracts the article title and body text.
    Uses BeautifulSoup4 for HTML parsing.
    """
    url = payload.url
    # basic regex validation for http/https URLs
    if not (url.startswith("http://") or url.startswith("https://")):
        return {
            "title": "",
            "text": "",
            "success": False,
            "message": "Invalid URL format. URL must start with http:// or https://"
        }
        
    try:
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
            }
        )
        with urllib.request.urlopen(req, timeout=7) as response:
            html = response.read()
            soup = BeautifulSoup(html, "html.parser")
            
            # 1. Extract title
            title = ""
            og_title = soup.find("meta", property="og:title")
            if og_title and og_title.get("content"):
                title = og_title["content"]
            else:
                title = soup.title.string if soup.title else ""
            
            # 2. Extract text body
            # Remove scripts, styles, and headers to prevent noise
            for script_or_style in soup(["script", "style", "nav", "footer", "header"]):
                script_or_style.decompose()
                
            paragraphs = soup.find_all("p")
            text_parts = []
            for p in paragraphs:
                text_content = p.get_text().strip()
                # Only keep paragraphs that represent actual sentences / prose
                if len(text_content) > 30:
                    text_parts.append(text_content)
                    
            text = " ".join(text_parts)
            
            # 3. Clean spacing
            title = title.strip() if title else ""
            text = re.sub(r'\s+', ' ', text).strip()
            
            if not title and not text:
                return {
                    "title": "",
                    "text": "",
                    "success": False,
                    "message": "Unable to extract content. Page might be behind a paywall or script-heavy."
                }
                
            # Truncate text to avoid model overflow / huge payload
            if len(text) > 4000:
                text = text[:4000] + "..."
                
            return {
                "title": title,
                "text": text,
                "success": True
            }
            
    except Exception as e:
        return {
            "title": "",
            "text": "",
            "success": False,
            "message": f"Failed to retrieve or parse URL: {str(e)}"
        }

def get_mock_news():
    """Curated mock news headlines with descriptive contents and Unsplash cover images."""
    return {
        "status": "ok",
        "totalResults": 4,
        "articles": [
            {
                "title": "NASA Mars Rover Finds Evidence of Ancient Lake Bed in Jezero Crater",
                "description": "Scientists confirm that the Perseverance rover has uncovered rock layers that prove liquid water once flowed on Mars for millions of years.",
                "url": "https://www.nasa.gov",
                "urlToImage": "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=600&auto=format&fit=crop",
                "publishedAt": "2026-05-26T00:00:00Z",
                "source": {"id": "nasa", "name": "NASA Science"},
                "content": "NASA's Perseverance rover has found groundbreaking evidence of an ancient lake bed in the Jezero Crater, proving that Mars was once home to liquid water."
            },
            {
                "title": "Crypto Pioneer Announces Launch of First Quantum-Encrypted Token",
                "description": "A new blockchain startup claims to have built a coin that is 100% immune to decoding by quantum computers using lattice-based cryptography.",
                "url": "https://www.bloomberg.com",
                "urlToImage": "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&auto=format&fit=crop",
                "publishedAt": "2026-05-25T14:30:00Z",
                "source": {"id": "bloomberg", "name": "Bloomberg Finance"},
                "content": "A group of cryptography developers has announced the launch of the first quantum-resistant blockchain token, designed to protect digital assets from future quantum computers."
            },
            {
                "title": "Unbelievable Breakthrough: Secret Herb Cures Common Cold in 24 Hours",
                "description": "An exclusive report reveals that a rare mountain herb found in the Andes completely eradicates the rhinovirus in less than one day, but big pharma is hiding it.",
                "url": "https://www.healthnews.com",
                "urlToImage": "https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=600&auto=format&fit=crop",
                "publishedAt": "2026-05-25T15:45:00Z",
                "source": {"id": "healthnews", "name": "Healthy Living Daily"},
                "content": "A secret report claims that a rare mountain herb found in the Andes completely cures the common cold in 24 hours. The discovery has sparked controversy."
            },
            {
                "title": "Global Summit Announces New Clean Energy Pact Targeting Net-Zero by 2040",
                "description": "Leaders from 45 nations have signed a landmark agreement committing to accelerate clean energy transitions and phase out coal power by 2040.",
                "url": "https://www.reuters.com",
                "urlToImage": "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&auto=format&fit=crop",
                "publishedAt": "2026-05-25T10:15:00Z",
                "source": {"id": "reuters", "name": "Reuters"},
                "content": "At the Clean Energy Summit in Geneva, 45 nations signed a new treaty committing to advance their target for net-zero carbon emissions to 2040."
            }
        ]
    }



@app.post("/analyze-context")
def analyze_context(payload: NewsRequest):
    """Run LLM contextual analysis separately from the existing ML prediction."""
    try:
        return llm_analyze_article(payload.title, payload.text)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Contextual analysis failed.")
