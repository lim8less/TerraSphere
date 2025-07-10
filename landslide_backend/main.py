from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import joblib
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Landslide Prediction & Chatbot API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load models and encoders
try:
    rf_first_stage = joblib.load("landslide_first_stage.pkl")
    rf_second_stage = joblib.load("landslide_second_stage.pkl")
    label_encoders = joblib.load("label_encoders.pkl")
except Exception as e:
    print(f"Error loading model: {e}")
    raise

# Configure Gemini
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is not set")
genai.configure(api_key=API_KEY)
gemini_model = genai.GenerativeModel(model_name="gemini-2.5-flash")  # or gemini-1.0-pro

def map_risk_level(risk_score):
    if risk_score > 80:
        return 'Very High'
    elif risk_score > 60:
        return 'High'
    elif risk_score > 40:
        return 'Moderate'
    else:
        return 'Low'

class PredictionInput(BaseModel):
    city: str
    date: str  # YYYY-MM-DD format

class PredictionResult(BaseModel):
    rainfall: float
    elevation: float
    soilType: str
    slope: str
    vegetation: str
    riskLevel: str
    landslideChance: float

class ChatInput(BaseModel):
    prompt: str

class LocationQuery(BaseModel):
    location: str

@app.post("/predict", response_model=PredictionResult)
async def predict(input_data: PredictionInput):
    try:
        date_obj = datetime.datetime.strptime(input_data.date, "%Y-%m-%d")
        month = date_obj.strftime("%B")
        
        city_encoded = label_encoders["City"].transform([input_data.city])[0]
        month_encoded = label_encoders["Month"].transform([month])[0]
        input_features = [[city_encoded, month_encoded]]
        
        predicted_values = rf_first_stage.predict(input_features)[0]
        predicted_rainfall, predicted_elevation, predicted_soil_type, predicted_slope, predicted_vegetation = predicted_values
        
        second_stage_input = [[predicted_rainfall, predicted_elevation, predicted_soil_type, predicted_slope, predicted_vegetation]]
        risk_predictions = rf_second_stage.predict(second_stage_input)[0]
        risk_level = map_risk_level(risk_predictions[0])
        landslide_chance = round(min(max(risk_predictions[1], 5), 95), 2)
        
        predicted_soil_type = label_encoders["SoilType"].inverse_transform([int(predicted_soil_type)])[0]
        predicted_slope = label_encoders["Slope"].inverse_transform([int(predicted_slope)])[0]
        predicted_vegetation = label_encoders["Vegetation"].inverse_transform([int(predicted_vegetation)])[0]
        
        return {
            "rainfall": predicted_rainfall,
            "elevation": predicted_elevation,
            "soilType": predicted_soil_type,
            "slope": predicted_slope,
            "vegetation": predicted_vegetation,
            "riskLevel": risk_level,
            "landslideChance": landslide_chance
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/gemini-chat")
async def gemini_chat(input_data: ChatInput):
    try:
        if not input_data.prompt:
            return {"reply": "Please provide a question."}
        response = gemini_model.generate_content(input_data.prompt)
        return {"reply": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chatbot error: {str(e)}")

@app.post("/generate-response")
async def generate_response(query: LocationQuery):
    try:
        if not query.location:
            raise HTTPException(status_code=400, detail="No location provided")

        prompt = f"""
        Provide concise information about landslide risks in {query.location}, Maharashtra.

        - Mention key factors (like soil, slope, rainfall) making this region prone.
        - List past major landslide incidents (if any).
        - Give 2-3 practical safety tips for residents.
        - Suggest 1-2 preventive measures.

        Avoid greetings or extra explanations. Keep it brief and factual.
        """
        response = gemini_model.generate_content(prompt)
        return {"response": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Landslide Prediction & Chatbot API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
