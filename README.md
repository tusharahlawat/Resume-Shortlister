# Resume Shortlister

A powerful application that analyzes resumes against job requirements using Natural Language Processing and Machine Learning techniques to help recruiters shortlist the most suitable candidates.

## Features

- Upload multiple resumes in PDF format
- Define required skills and job roles
- Automatic skill matching and scoring
- Experience and education evaluation
- Detailed scoring breakdown for each resume

## Tech Stack

### Backend
- FastAPI (Python)
- NLTK (Natural Language Processing)
- scikit-learn (Machine Learning)
- PyPDF2 (PDF Processing)

### Frontend
- React + Vite

## Installation

### Prerequisites
- Python 3.8 or higher
- Node.js 14 or higher
- npm or yarn

### Backend Setup
1. Clone the repository
2. Navigate to the project directory
3. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```
4. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Start the backend server:
   ```bash
   python -m uvicorn server:app --reload --port 5000
   ```

### Frontend Setup
1. Install Node.js dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

## Usage
1. Access the application at `http://localhost:3000`
2. Upload PDF resumes
3. Enter job requirements and required skills
4. Click "Analyze" to get detailed scoring and analysis

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License.

### Prerequisites
- Node.js (Latest LTS version)
- Python 3.8+
- pip (Python package manager)

### Backend Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Start the FastAPI server:
```bash
python server.py
```
The backend server will run on http://localhost:5000

### Frontend Setup

1. Install Node.js dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```
The frontend application will be available at http://localhost:3000

## Usage

1. Start both the backend and frontend servers as described in the installation section
2. Access the application through your web browser at http://localhost:3000
3. Enter the job role and required skills
4. Upload the candidate resumes in PDF format
5. Submit for analysis
6. View the detailed results and shortlisted candidates

## API Endpoints

### POST /analyze
Analyzes uploaded resumes against specified job requirements.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Parameters:
  - resumes: List of PDF files
  - jobRole: String
  - skills: JSON string array of required skills

**Response:**
```json
[
  {
    "fileName": "resume.pdf",
    "matchScore": 85.5,
    "matchingSkills": ["python", "react"],
    "details": {
      "skillScore": 90.0,
      "experienceScore": 80.0,
      "educationScore": 85.0
    }
  }
]
```

## License

MIT License