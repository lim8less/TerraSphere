// export interface PredictionInput {
//   rainfall: number;
//   slope: number;
//   soilType: string;
//   vegetation: string;
//   elevation: number;
//   location: {
//     state: string;
//     district: string;
//   };
// }

// export interface PredictionResult {
//   riskLevel: 'Low' | 'Moderate' | 'High' | 'Very High';
//   confidence: number;
//   recommendations: string[];
// }

// src/types.ts
// src/types.tsx

export interface LocationInput {
  state: string;
  district: string;
}

export interface PredictionInput {
  city: string;
  date: string; // YYYY-MM-DD format
}

export interface PredictionResult {
  rainfall: number;
  elevation: number;
  soilType: string;
  slope: string;
  vegetation: string;
  riskLevel: string;
  landslideChance: number;
}


// Add Shelter interface
export interface Shelter {
  id: string;
  name: string;
  capacity: number;
  latitude: number;
  longitude: number;
  state: string;
  district: string;
  address: string;
  contactNumber: string;
  isActive: boolean;
}