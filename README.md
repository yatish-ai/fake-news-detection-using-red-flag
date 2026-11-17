# ClearAI — Real-Time Fake News Detection System 🛡️🤖

**ClearAI** is a real-time fake news detection application that predicts whether a news article is **REAL** or **FAKE**. It combines a machine-learning classifier with a separate red-flag analysis to help users examine potentially misleading editorial patterns. It can also analyze article URLs and display trending headlines.

The project includes a React frontend, FastAPI backend, automated tests, Docker support, and GitHub Actions CI/CD workflows.

---

## 🚀 Key Features
1. **AI-Powered Analysis**: Evaluates news titles and body texts with a trained machine learning model. The repository's training results report **92.03% accuracy**.
2. **Dynamic Vocabulary Contributions**: Colors and displays words that contributed to the model's decision (green for Real indicators, red for Fake indicators).
3. **NewsAPI Live Trending Feed**: Fetches headlines when a NewsAPI key is configured. Users can select a headline to analyze it.
4. **URL Scraping**: Extracts an article's title and content using BeautifulSoup4 for analysis.
5. **Local Storage History**: Persists recent queries locally in the browser.
6. **Responsive Dark UI**: A mobile-friendly dashboard with animated cards and progress indicators.
7. **Red-Flag Analysis**: Separately checks for sensational wording, clickbait phrases, excessive punctuation or capitalization, absolute claims, and missing visible source attribution. This is a heuristic screening aid, not proof that a story is false.

---

## 🛠️ Tech Stack
- **Frontend**: React + Vite, Tailwind CSS, Lucide Icons
- **Backend**: FastAPI, Uvicorn, BeautifulSoup4
- **Machine Learning**: Scikit-Learn, Passive-Aggressive Classifier, TF-IDF Vectorizer (up to 5,000 features), Joblib
- **DevOps**: Docker, Docker Compose, GitHub Actions CI/CD
- **Testing**: PyTest, HTTPX (TestClient)

---

## 📂 Project Structure
```
realtime-fake-news-detection/
├── .github/workflows/
│   └── deploy.yml          # GitHub Actions CI/CD configuration
├── backend/
│   ├── app/
│   │   ├── main.py         # FastAPI main logic
│   │   └── schemas.py      # Request/Response validation schemas
│   ├── tests/
│   │   └── test_main.py    # Unit tests for endpoints
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── Dockerfile
├── model/
│   ├── train_model.py
│   ├── model.pkl
│   └── vectorizer.pkl
├── docker-compose.yml
├── .gitignore
├── .env.example
├── LICENSE
└── README.md
```

---

## ⚙️ Local Development Setup

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Train the ML Model
Run the following from the repository root:
```bash
python -m venv venv

# Activate the environment
# Windows:
venv\\Scripts\\activate
# macOS/Linux:
source venv/bin/activate

pip install pandas scikit-learn joblib numpy
python model/train_model.py
```
The training script downloads the dataset, trains the classifier, reports performance metrics, and saves the model and vectorizer under `model/`.

### 2. Run the FastAPI Backend
```bash
cd backend
# Optional: add NEWS_API_KEY to a .env file
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

### 3. Run the React Frontend
```bash
cd frontend
# Optional: set VITE_API_URL=http://localhost:8000 in a .env file
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🐳 Docker Deployment
Build and run the application using:
```bash
docker-compose up --build
```
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:8000/docs`

---

## 🌐 Production Deployment

### Deployed Public URLs
- **ClearAI Frontend**: https://frontend-sable-sigma-hvuoml3d3.vercel.app/
- **Backend API**: https://fake-news-detection-using-red-flag.onrender.com

### Backend Environment Variable
For live NewsAPI headlines, configure `NEWS_API_KEY` in the backend hosting provider's environment settings. If it is not configured, the application may use its fallback news data.

### Frontend Environment Variable
Set `VITE_API_URL` to:
```
https://fake-news-detection-using-red-flag.onrender.com
```
Then redeploy the frontend.

### GitHub Actions Secrets
Add required secrets under **Settings → Secrets and variables → Actions** in the repository. Do not commit API keys or other credentials to source control.

---

## 🔄 Automated CI/CD Pipeline
The workflow in `.github/workflows/deploy.yml` runs checks for the backend, frontend, and Docker builds on configured pushes and pull requests.

---

## 🎓 College Viva & Presentation Guide

### Q1: Why did you choose a Passive-Aggressive Classifier?
It is a margin-based linear classifier that supports incremental updates. It is passive when a prediction satisfies the required margin and aggressive when it needs to update its weights. This makes it suitable for text-classification tasks where efficient training is useful.

### Q2: What is TF-IDF?
TF-IDF stands for Term Frequency–Inverse Document Frequency. It represents how important a term is to a document relative to the corpus, reducing the influence of words that occur very frequently across documents.

### Q3: Why is the model footprint small?
The vectorizer limits the vocabulary to 5,000 features, which constrains the feature space and helps keep the model compact.

### Q4: How is the confidence score calculated?
The Passive-Aggressive classifier provides a raw margin score through `decision_function`. The application applies a sigmoid transformation to display a value on a 0–1 scale. This displayed score should not be interpreted as a calibrated probability unless calibration has been separately performed.

---

## 🚩 Red-Flag Analysis
ClearAI returns a separate red-flag analysis alongside the REAL/FAKE prediction. It checks the supplied headline and article text for potentially concerning editorial patterns, including sensational wording, clickbait phrases, excessive punctuation or capitalization, absolute claims, and missing visible source attribution.

The response includes a 0–100 heuristic indicator score, a Low/Moderate/High level, individual flags with severity and matched evidence, and a disclaimer. The score is rule-based; it is **not** a probability that the article is fake. A red flag is not proof that a story is false, and no detected flags do not prove that it is true. The checks do not independently verify factual claims or publisher reputation.
