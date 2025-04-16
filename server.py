from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import json
import uvicorn
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import PyPDF2
import io
import re

# Download required NLTK data
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')

# Initialize NLP components
lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))
tfidf = TfidfVectorizer()

def preprocess_text(text):
    # Tokenize and convert to lowercase
    tokens = word_tokenize(text.lower())
    # Remove stopwords and lemmatize
    tokens = [lemmatizer.lemmatize(token) for token in tokens if token not in stop_words and token.isalnum()]
    return ' '.join(tokens)

def extract_text_from_pdf(pdf_file):
    pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_file))
    text = ''
    for page in pdf_reader.pages:
        text += page.extract_text()
    return text

def calculate_skill_match(resume_text, required_skills):
    resume_tokens = set(preprocess_text(resume_text).split())
    total_skills = len(required_skills)
    total_score = 0
    
    for skill in required_skills:
        # Process each skill separately
        skill_tokens = set(preprocess_text(skill).split())
        if not skill_tokens:
            continue
            
        # Calculate token match ratio
        matched_tokens = sum(1 for token in skill_tokens if token in resume_tokens)
        token_ratio = matched_tokens / len(skill_tokens)
        
        # Apply a stricter scoring system that rewards perfect matches more
        if token_ratio == 1.0:
            total_score += 1.2  # Perfect match gets full score
        elif token_ratio >= 0.8:
            total_score += 1  # Strong match
        elif token_ratio >= 0.6:
            total_score += 0.7  # Moderate match
        elif token_ratio >= 0.4:
            total_score += 0.5  # Weak match
        elif token_ratio > 0:
            total_score += 0.2  # Very weak match
            
    # Normalize the score to ensure 100% is possible
    return min(1.0, total_score / total_skills) if total_skills else 0

def calculate_experience_score(resume_text):
    # Extract years of experience using regex
    experience_pattern = r'\b(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?experience\b'
    matches = re.findall(experience_pattern, resume_text.lower())
    if matches:
        years = max(int(year) for year in matches)
        # Normalize experience score (0-1)
        return min(years / 10, 1)  # Cap at 10 years
    return 0

def calculate_education_score(resume_text):
    education_keywords = ['phd', 'master', 'bachelor', 'mba', 'degree']
    education_text = preprocess_text(resume_text)
    score = sum(1 for keyword in education_keywords if keyword in education_text)
    return min(score / len(education_keywords), 1)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
async def analyze_resumes(
    resumes: List[UploadFile] = File(...),
    jobRole: str = Form(...),
    skills: str = Form(...)
):
    try:
        # Parse skills from JSON string
        required_skills = json.loads(skills)
        
        # Process each resume and calculate scores
        results = []
        for resume in resumes:
            # Read and extract text from PDF
            content = await resume.read()
            resume_text = extract_text_from_pdf(content)
            
            # Calculate various scores
            skill_score = calculate_skill_match(resume_text, required_skills)
            exp_score = calculate_experience_score(resume_text)
            edu_score = calculate_education_score(resume_text)
            
            # Calculate weighted final score with adjusted weights to allow 100%
            final_score = (
                skill_score * 0.8 +    # Skills are most important
                exp_score * 0.15 +     # Experience is second
                edu_score * 0.05        # Education is third
            ) * 100  # Convert to percentage
            
            # Find matching skills
            resume_tokens = set(preprocess_text(resume_text).split())
            matching_skills = [
                skill for skill in required_skills
                if any(token in preprocess_text(skill).split() 
                       for token in resume_tokens)
            ]
            
            results.append({
                "fileName": resume.filename,
                "matchScore": round(final_score, 2),
                "matchingSkills": matching_skills,
                "details": {
                    "skillScore": round(skill_score * 100, 2),
                    "experienceScore": round(exp_score * 100, 2),
                    "educationScore": round(edu_score * 100, 2)
                }
            })
        
        # Sort results by match score in descending order
        results.sort(key=lambda x: x["matchScore"], reverse=True)
        return results
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)