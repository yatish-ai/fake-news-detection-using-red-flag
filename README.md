# Real-Time Fake News Detection System 🛡️🤖

A complete, production-ready DevOps + AI Full Stack application designed for college project submission. This system predicts whether a news article is **REAL** or **FAKE** in real time, visualizes the exact vocabulary tokens that influenced the classifier, fetches trending live headlines, and parses web article URLs.

The project is lightweight, built to deploy instantly on free tiers, and completely dockerized with automated testing and GitHub Actions CI/CD workflows.

---

## 🚀 Key Features
1. **AI-Powered Analysis**: Evaluates news titles and body texts with a trained machine learning model, achieving **92.03% accuracy**.
2. **Dynamic Vocabulary Contributions**: Colors and displays the exact words that contributed to the model's decision (Green for Real indicators, Red for Fake indicators).
3. **NewsAPI Live Trending Feed**: Automatically fetches real-time headlines. Users can click "Analyze This News" to auto-populate and run predictions on live global news.
4. **URL scraping**: Paste any article link, and the backend dynamically extracts the title and content using BeautifulSoup4 for immediate checking.
5. **Local Storage History**: Persists the last 20 queries locally in the browser so users can reload past analyses.
6. **Sleek Glassmorphic Dark UI**: Fully responsive mobile-friendly dashboard styled with Tailwind CSS, animated cards, and progress meters.

---

## 🛠️ Tech Stack
- **Frontend**: React + Vite, Tailwind CSS, Lucide Icons
- **Backend**: FastAPI, Uvicorn, BeautifulSoup4
- **Machine Learning**: Scikit-Learn, Passive-Aggressive Classifier, TF-IDF Vectorizer (limited to 5,000 features for a ultra-small `<250KB` memory footprint), Joblib
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
│   ├── Dockerfile          # Production backend Docker image
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/     # Layout elements (Navbar, Footer)
│   │   ├── pages/          # Pages (Home, Detector, About)
│   │   ├── App.jsx         # Navigation manager
│   │   ├── index.css       # Tailwind stylesheet
│   │   └── main.jsx        # React entrypoint
│   ├── index.html          # HTML shell
│   ├── tailwind.config.js  # Tailwind design system
│   ├── postcss.config.js   # CSS compile plugins
│   ├── package.json        # Node dependencies
│   └── Dockerfile          # Production frontend Nginx image
├── model/
│   ├── train_model.py      # ML training pipeline script
│   ├── model.pkl           # Saved trained classifier
│   └── vectorizer.pkl      # Saved TF-IDF vectorizer
├── docker-compose.yml      # Orchestrates local multi-container run
├── .gitignore              # Ignores large datasets and env folders
├── .env.example            # Environment variables template
├── LICENSE                 # MIT License details
└── README.md               # Documentation (This file)
```

---

## ⚙️ Local Development Setup

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Train the ML Model
We train the model locally once to output compact pickle files. Run the following in the root directory:
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install libraries and run model training
pip install pandas scikit-learn joblib numpy
python model/train_model.py
```
*Note: The script automatically downloads the `fake_or_real_news.csv` dataset (~30MB) from GitHub, cleans it, trains the classifier, outputs performance metrics, and saves `model.pkl` and `vectorizer.pkl` to the `model/` folder.*

### 2. Run the FastAPI Backend
```bash
cd backend
# Create a .env file containing your News API key (optional, falls back to mock news if unset)
# NEWS_API_KEY=your_key_here

# Install dependencies and start server
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- API Docs: `http://localhost:8000/docs` (Swagger UI)
- Health Check: `http://localhost:8000/health`

### 3. Run the React Frontend
```bash
cd frontend
# Create a .env file containing the backend URL
# VITE_API_URL=http://localhost:8000

# Install dependencies and start dev server
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🐳 Docker Deployment (Local Containerized)
Build and run the entire application stacked together inside isolated containers with one command:
```bash
# Build and run containers
docker-compose up --build
```
- Open **Frontend**: `http://localhost:5173`
- Open **Backend API**: `http://localhost:8000/docs`

---

## 🌐 Production Deployment Guide

### 1. Deployed Public URLs
*(Provide your active URLs here after deployment)*
- **Frontend URL**: `https://frontend-sable-sigma-hvuoml3d3.vercel.app/`
- **Backend API URL**: `https://fake-news-detection-using-red-flag.onrender.com`

---

### 🔑 Environment Variables Setup

#### 1. Backend (FastAPI on Render / Railway)
To add your News API Key in Render:
1. Navigate to your Web Service dashboard on [Render](https://render.com).
2. Go to **Settings** -> **Environment Variables**.
3. Add a new variable:
   - **Key**: `NEWS_API_KEY`
   - **Value**: `YOUR_REAL_NEWS_API_KEY` (Get a free key at [newsapi.org](https://newsapi.org/))
4. Click **Save Changes**. Render will automatically redeploy the service with the new variable.

#### 2. Frontend (React on Vercel)
To link the Vercel frontend to the Render API:
1. Navigate to your project on [Vercel](https://vercel.com).
2. Go to **Project Settings** -> **Environment Variables**.
3. Add a new variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://fake-news-detection-using-red-flag.onrender.com` (Ensure no trailing slash)
4. Click **Save**. Trigger a redeployment for the variables to bind.

#### 3. Docker Containers (`docker-compose.yml` / CLI)
To pass variables to Docker containers, reference them in the `docker-compose.yml` or supply them directly:
- In `docker-compose.yml`:
  ```yaml
  backend:
    environment:
      - NEWS_API_KEY=${NEWS_API_KEY}
  frontend:
    build:
      args:
        - VITE_API_URL=http://localhost:8000
  ```
- Or run using environment variables:
  ```bash
  NEWS_API_KEY=your_key_here docker-compose up --build
  ```

#### 4. GitHub Actions CI/CD
To run builds with variables in GitHub:
1. Go to your repository on GitHub.
2. Click **Settings** -> **Secrets and variables** -> **Actions**.
3. Under **Repository Secrets**, click **New repository secret** to add secure variables like `NEWS_API_KEY`.
4. To test configurations, add **Variables** like `VITE_API_URL`.

---

## 🔄 Automated CI/CD Pipeline (GitHub Actions)
The file `.github/workflows/deploy.yml` controls the automated DevOps lifecycle on every branch push or pull request to `main`:
1. **Backend Jobs**: Installs dependencies, trains a lightweight verification model, and executes `pytest` tests to ensure `/predict` and `/health` work safely.
2. **Frontend Jobs**: Installs npm dependencies and compiles production assets with Vite to verify zero script errors.
3. **Docker Jobs**: Pulls the code and checks that BOTH frontend and backend images build successfully without dependency failures.

---

## 🛠️ Step-by-Step Git Commands to Publish
Configure Git, link to your GitHub, and push the codebase:
```bash
# 1. Initialize git
git init

# 2. Add files (excludes dataset/ and venv/ folders via .gitignore)
git add .

# 3. Create initial commit
git commit -m "Initial commit - Fake News Detection DevOps Project"

# 4. Create branch main
git branch -M main

# 5. Connect to your created GitHub Repository
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/realtime-fake-news-detection.git

# 6. Push code to main
git push -u origin main
```

---

## 🎓 College Viva & Presentation Guide

### Q1: Why did you choose a Passive-Aggressive Classifier?
**Answer**: It is a margins-based linear classifier. Unlike models like Random Forest or SVM, which require training on the entire dataset at once, the Passive-Aggressive classifier updates its weight vector incrementally. It is **Passive** (keeps weights identical) if a new instance is classified correctly with a margin, and **Aggressive** (makes minimal adjustments) if the prediction is incorrect. This is highly suitable for real-time text streams and news feeds where data distributions change quickly.

### Q2: What is TF-IDF?
**Answer**: Term Frequency-Inverse Document Frequency. It measures how important a word is to a document relative to the entire dataset corpus. It increases proportionally to the number of times a word appears in the document but is offset by the frequency of the word in the corpus (to filter common words like 'the', 'is', 'and').

### Q3: Why is the model footprint so small?
**Answer**: We restricted the TF-IDF Vectorizer's `max_features` parameter to **5,000**. This filters out rare words and noises, capping the matrix dimension. The resulting model file is only ~40KB and the vectorizer is ~180KB, ensuring fast loads and minimal memory allocation on free hosting plans.

### Q4: How is the confidence score calculated?
**Answer**: The Passive-Aggressive model outputs a raw margin distance score (via `decision_function`). We pass this score through a **Sigmoid Activation Function** ($P(y=1|x) = \frac{1}{1 + e^{-x}}$) to scale it into a probability between 0 and 1, which represents the classification confidence.

## Red Flag Analysis (Added Feature)

The detector now returns a separate `red_flag_analysis` object alongside the existing REAL/FAKE prediction. It checks the supplied headline and article text for potentially concerning editorial patterns, including sensational wording, clickbait phrases, excessive punctuation or capitalization, absolute claims, and missing visible source attribution.

The response includes a 0–100 heuristic indicator score, Low/Moderate/High level, individual flags with severity and matched evidence, and a disclaimer. This is a rule-based screening aid, not a trained fact-checking model: a red flag is not proof that a story is false, and no detected flags do not prove that it is true. The current checks analyze the text supplied to the API and do not independently verify claims or publisher reputation.
