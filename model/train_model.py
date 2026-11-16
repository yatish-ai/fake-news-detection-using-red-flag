import os
import urllib.request
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import PassiveAggressiveClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib

# Paths
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(os.path.dirname(MODEL_DIR), "dataset")
DATASET_PATH = os.path.join(DATASET_DIR, "fake_or_real_news.csv")
MODEL_PATH = os.path.join(MODEL_DIR, "model.pkl")
VECTORIZER_PATH = os.path.join(MODEL_DIR, "vectorizer.pkl")

# Dataset URL (standard public dataset)
DATASET_URL = "https://raw.githubusercontent.com/lutzhamel/fake-news/master/data/fake_or_real_news.csv"

def download_dataset():
    if not os.path.exists(DATASET_DIR):
        os.makedirs(DATASET_DIR)
        print(f"Created directory: {DATASET_DIR}")
        
    if not os.path.exists(DATASET_PATH):
        print(f"Downloading dataset from {DATASET_URL}...")
        try:
            urllib.request.urlretrieve(DATASET_URL, DATASET_PATH)
            print("Download completed successfully!")
        except Exception as e:
            print(f"Error downloading dataset: {e}")
            raise e
    else:
        print("Dataset already exists locally.")

def train():
    # 1. Download/Load Data
    download_dataset()
    print("Loading data...")
    df = pd.read_csv(DATASET_PATH)
    
    print(f"Dataset shape: {df.shape}")
    print("Dataset columns:", df.columns.tolist())
    
    # 2. Preprocess
    # Combine title and text to improve context and accuracy
    print("Preparing features...")
    df['total_text'] = df['title'].fillna('') + " " + df['text'].fillna('')
    
    X = df['total_text']
    y = df['label'] # 'REAL' or 'FAKE'
    
    # 3. Train-Test Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    print(f"Training samples: {len(X_train)}, Testing samples: {len(X_test)}")
    
    # 4. Feature Extraction (TF-IDF Vectorizer)
    # limit max_features to 5000 to keep the saved model file very small (<3MB) and fast to load
    print("Vectorizing text with TF-IDF...")
    vectorizer = TfidfVectorizer(stop_words='english', max_df=0.7, max_features=5000)
    
    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)
    
    # 5. Model Training (PassiveAggressiveClassifier)
    # Highly effective for text classification (especially news), fast, online learning support
    print("Training PassiveAggressiveClassifier...")
    pac = PassiveAggressiveClassifier(max_iter=50, random_state=42)
    pac.fit(X_train_tfidf, y_train)
    
    # 6. Evaluation
    y_pred = pac.predict(X_test_tfidf)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\nModel Evaluation:")
    print(f"Accuracy: {accuracy * 100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Check if target accuracy is met
    if accuracy >= 0.90:
        print("Accuracy target (90%+) met! Saving models...")
        # 7. Save files
        joblib.dump(pac, MODEL_PATH)
        joblib.dump(vectorizer, VECTORIZER_PATH)
        print(f"Model saved to: {MODEL_PATH}")
        print(f"Vectorizer saved to: {VECTORIZER_PATH}")
        
        # Verify file sizes
        model_sz = os.path.getsize(MODEL_PATH) / (1024 * 1024)
        vec_sz = os.path.getsize(VECTORIZER_PATH) / (1024 * 1024)
        print(f"Model File Size: {model_sz:.2f} MB")
        print(f"Vectorizer File Size: {vec_sz:.2f} MB")
    else:
        raise ValueError(f"Accuracy was {accuracy * 100:.2f}%, which is lower than target 90%.")

if __name__ == "__main__":
    train()
