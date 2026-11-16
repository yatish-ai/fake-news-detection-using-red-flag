from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class NewsRequest(BaseModel):
    title: str = Field(..., description="The title of the news article", min_length=2)
    text: str = Field(..., description="The body content of the news article", min_length=10)

    model_config = {
        "json_schema_extra": {
            "example": {
                "title": "Unbelievable Discovery on Mars!",
                "text": "Scientists have recently discovered an ancient city on Mars constructed entirely of glowing green crystals, according to local rumors."
            }
        }
    }

class KeywordScore(BaseModel):
    word: str
    score: float

class RedFlagItem(BaseModel):
    category: str
    severity: str
    message: str
    evidence: str

class RedFlagAnalysis(BaseModel):
    score: int = Field(..., ge=0, le=100)
    level: str
    summary: str
    flags: List[RedFlagItem]
    disclaimer: str

class PredictionResponse(BaseModel):
    prediction: str = Field(..., description="Classification result: 'REAL' or 'FAKE'")
    confidence: float = Field(..., description="Confidence score as a percentage between 0 and 100")
    explanation: str = Field(..., description="A short textual explanation of why the model reached this decision")
    key_terms: List[KeywordScore] = Field(..., description="Significant words in the text that influenced the prediction and their importance scores")
    red_flag_analysis: RedFlagAnalysis = Field(..., description="Heuristic analysis of potentially suspicious article characteristics")

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool

# NewsAPI Schemas
class ArticleSource(BaseModel):
    id: Optional[str] = None
    name: str

class NewsArticle(BaseModel):
    title: str
    description: Optional[str] = None
    url: str
    urlToImage: Optional[str] = None
    publishedAt: str
    source: ArticleSource
    content: Optional[str] = None

class LatestNewsResponse(BaseModel):
    status: str
    totalResults: int
    articles: List[NewsArticle]

# URL Scraping Schemas
class UrlRequest(BaseModel):
    url: str = Field(..., description="The HTTP/HTTPS URL of the news article to check")

class ScrapedNewsResponse(BaseModel):
    title: str
    text: str
    success: bool
    message: Optional[str] = None
