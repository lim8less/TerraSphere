
import axios from 'axios';
import type { PredictionInput, PredictionResult } from '../types';

const API_URL = 'http://localhost:8000'; 

export async function predictLandslideRisk(input: PredictionInput): Promise<PredictionResult> {
  try {
    const response = await axios.post(`${API_URL}/predict`, input);
    return response.data;
  } catch (error) {
    console.error('Error predicting landslide risk:', error);
    throw new Error('Failed to predict landslide risk. Please try again.');
  }
}