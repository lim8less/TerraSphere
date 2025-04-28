# TerraSphere: Maharashtra Landslide Detection System

A state-of-the-art full-stack application for predicting and analyzing landslide risks in Maharashtra, India. TerraSphere combines machine learning models with AI-powered chatbot to provide comprehensive risk assessments and safety information.

## Features

- **Landslide Risk Prediction**: Advanced prediction of landslide risks based on various environmental factors
- **AI-Powered Chatbot**: Intelligent information system about landslide risks in specific locations
- **Real-time Analysis**: Dynamic analysis of current conditions to assess landslide probabilities
- **User Authentication**: Secure login and registration system
- **Interactive Dashboard**: Visual representation of risk data and predictions

## Tech Stack

### Backend
- FastAPI (Python web framework)
- Scikit-learn (Machine Learning)
- Google Gemini AI (Chatbot)
- LangChain (Structured responses)
- Joblib (Model serialization)

### Frontend
- React.js
- Firebase (Authentication)
- Material-UI (UI components)
- Chart.js (Data visualization)

## Project Structure

```
TerraSphere/
├── landslide_backend/          # Backend API server
│   ├── main.py                # FastAPI application
│   ├── requirements.txt       # Python dependencies
│   └── .env                  # Environment variables
├── landslide_frontend/        # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/           # Page components
│   │   ├── firebase.tsx     # Firebase configuration
│   │   └── App.tsx          # Main application
│   └── .env                 # Frontend environment variables
└── README.md                # Project documentation
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd landslide_backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file with the following variables:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   ```

5. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd landslide_frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with Firebase configuration:
   ```
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## API Endpoints

### Backend API

- `POST /predict`: Predict landslide risk for a given location and date
- `POST /gemini-chat`: Interact with the AI chatbot
- `POST /generate-response`: Get location-specific landslide information

## Environment Variables

Both frontend and backend require specific environment variables to be set up. Refer to the `.env.example` files in each directory for the required variables.

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Security

- API keys and sensitive information are stored in `.env` files
- `.env` files are excluded from version control
- Firebase authentication is used for user management

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Data provided by Maharashtra State Government
- Machine learning models trained on historical landslide data
- Google Gemini AI for natural language processing capabilities 