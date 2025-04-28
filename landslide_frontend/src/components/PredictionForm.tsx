import React, { useState, useEffect } from "react";
import { AlertTriangle, Map, Shield, AlertCircle } from "lucide-react";
import ReactMarkdown from 'react-markdown';

// Define TypeScript interfaces
interface PredictionInput {
  date: string;
  city: string;
  subRegion?: string;
}

interface PredictionResult {
  rainfall: number;
  elevation: number;
  soilType: string;
  slope: string;
  vegetation: string;
  riskLevel: string;
  landslideChance: number;
}

// API service functions
const API_BASE_URL = "http://localhost:8000";

async function predictLandslideRisk(input: PredictionInput): Promise<PredictionResult> {
  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get prediction: ${errorText}`);
  }

  return response.json();
}

const MAHARASHTRA_CITIES = [
  "Mumbai",
  "Pune",
  "Raigad",
  "Nagpur",
  "Nashik",
  "Aurangabad",
  "Kolhapur",
  "Thane",
  "Latur",
  "Dhule",
  "Ratnagiri",
  "Satara",
  "Jalgaon",
  "Solapur",
  "Amravati",
];

const CITY_SUBREGIONS: { [key: string]: string[] } = {
  Mumbai: ["Powai", "Borivali", "Mulund", "Ghatkopar"],
  Pune: ["Malin", "Lonavala", "Bhor", "Khadakwasla"],
  Nagpur: ["Katol", "Ramtek", "Kamptee", "Hingna"],
  Nashik: ["Trimbakeshwar", "Igatpuri", "Sinnar", "Dindori"],
  Kolhapur: ["Shahuwadi", "Panhala", "Gaganbawada", "Kagal"],
  Raigad: ["Mahad", "Poladpur", "Roha", "Alibag"],
  Ratnagiri: ["Khed", "Chiplun", "Dapoli", "Ratnagiri"],
  Satara: ["Mahabaleshwar", "Panchgani", "Wai"],
  Jalgaon: ["Bhusawal", "Chopda"],
  Latur: ["Ausa", "Udgir"],
  Aurangabad: ["Paithan", "Sillod", "Kannad", "Phulambri"],
  Thane: ["Murbad", "Shahapur", "Bhiwandi", "Vasai"],
  Dhule: ["Shirpur", "Sakri", "Sindkheda", "Nandurbar"],
  Solapur: ["Karmala", "Madha", "Barshi", "Pandharpur"],
  Amravati: ["Warud", "Chandur", "Daryapur", "Morshi"]
};


export default function PredictionForm() {
  const [input, setInput] = useState<PredictionInput>({
    date: "",
    city: "",
    subRegion: "",
  });

  const [result, setResult] = useState<PredictionResult | null>(null);
  const [riskAreas, setRiskAreas] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formComplete, setFormComplete] = useState<boolean>(false);

  useEffect(() => {
    setFormComplete(input.city !== "" && input.date !== "" && input.subRegion !== "");
  }, [input]);

  const fetchRiskAreas = async (location: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/generate-response`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ location }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setRiskAreas(data.response);
    } catch (err) {
      console.error("Error fetching landslide areas:", err);
      setRiskAreas("Error fetching data. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      const combinedCityRegion = `${input.city}-${input.subRegion}`;
  
      const prediction = await predictLandslideRisk({
        city: combinedCityRegion,
        date: input.date,
      });
  
      setResult(prediction);
  
      await fetchRiskAreas(input.city);
  
      setTimeout(() => {
        document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      console.error("Prediction Error:", err);
      setError("Failed to get prediction. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  };
  

  // Generate risk level badge with appropriate color
  const getRiskBadge = (riskLevel: string) => {
    const colorMap: { [key: string]: string } = {
      'Very High': 'bg-red-600',
      'High': 'bg-orange-500',
      'Moderate': 'bg-yellow-500',
      'Low': 'bg-green-500'
    };

    const color = colorMap[riskLevel] || 'bg-gray-500';

    return (
      <span className={`${color} text-white px-3 py-1 rounded-full text-sm font-medium`}>
        {riskLevel}
      </span>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Landslide Risk Assessment</h1>
        <p className="text-gray-600">Predict landslide risks in Maharashtra regions based on location and date</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={input.date}
                onChange={(e) => setInput({ ...input, date: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
          <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <select
              value={input.city}
              onChange={(e) => setInput({ ...input, city: e.target.value, subRegion: "" })} // Reset sub-region when city changes
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white py-2 px-3"
              required
            >
              <option value="">Select city</option>
              {Object.keys(CITY_SUBREGIONS).map((city) => (
              <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

        {input.city && (
          <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">Sub-Region</label>
            <select
              value={input.subRegion}
              onChange={(e) => setInput({ ...input, subRegion: e.target.value })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white py-2 px-3"
              required
            >
              <option value="">Select sub-region</option>
              {CITY_SUBREGIONS[input.city].map((region) => (
                <option key={region} value={`${region}`}>
                  {region}
                </option>
              ))}
            </select>
          </div>
        )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 p-4 rounded-lg text-red-700 border border-red-200 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-red-500" /> {error}
          </div>
        )}

        <div className="flex justify-center">
          <button
            type="submit"
            className={`px-8 py-4 ${formComplete ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400"} text-white font-medium rounded-lg transition-colors shadow-md flex items-center gap-2`}
            disabled={loading || !formComplete}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing Data...
              </>
            ) : (
              <>
                <Map className="h-5 w-5" />
                Generate Risk Assessment
              </>
            )}
          </button>
        </div>
      </form>

      {/* Display Risk Assessment Results */}
      {result && (
        <div id="results-section" className="mt-12 bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
          <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
              Landslide Risk Assessment Results for {input.subRegion} ({input.city})
            </h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Risk Summary Section */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h4 className="text-lg font-medium text-gray-800 mb-4">Risk Summary</h4>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Risk Level:</span>
                    {getRiskBadge(result.riskLevel)}
                  </div>

                  <div>
                    <span className="text-gray-600">Landslide Chance:</span>
                    <div className="mt-2 relative h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`absolute top-0 left-0 h-full ${result.landslideChance > 70 ? 'bg-red-500' :
                            result.landslideChance > 50 ? 'bg-orange-500' :
                              result.landslideChance > 30 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                        style={{ width: `${result.landslideChance}%` }}
                      ></div>
                    </div>
                    <span className="block mt-1 text-right text-sm">{result.landslideChance}%</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Monthly Rainfall:</span>
                    <span className="font-medium">{result.rainfall.toFixed(2)} mm</span>
                  </div>
                </div>
              </div>

              {/* Terrain Details Section */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h4 className="text-lg font-medium text-gray-800 mb-4">Terrain Analysis</h4>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Elevation:</span>
                    <span className="font-medium">{result.elevation} meters</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Soil Type:</span>
                    <span className="font-medium">{result.soilType}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Slope:</span>
                    <span className="font-medium">{result.slope}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Vegetation:</span>
                    <span className="font-medium">{result.vegetation}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

{/* Display Landslide Information */}
{riskAreas && (
  <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
    <div className="bg-amber-50 px-6 py-4 border-b border-amber-200">
      <h3 className="text-xl font-semibold text-gray-900 flex items-center">
        <Shield className="h-5 w-5 mr-2 text-amber-500" />
        Landslide Risk Information for {input.city}
      </h3>
    </div>

    <div className="p-6 prose max-w-none text-gray-700 space-y-4">
      <ReactMarkdown>{riskAreas}</ReactMarkdown>
    </div>

    <div className="bg-blue-50 p-4 border-t border-blue-100">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 mt-0.5 mr-2 text-blue-500" />
        <p className="text-sm text-blue-700">
          This information is generated based on model predictions and historical data.
          Always consult local disaster management authorities for verified updates.
        </p>
      </div>
    </div>
  </div>
)}
    </div>
  );
}