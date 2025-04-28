import React, { useState, useEffect } from 'react';
import { Map as MapIcon, Plus, Phone, Navigation } from 'lucide-react';
import type { Shelter } from './types';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { LeafletMouseEvent } from 'leaflet';
import { Mountain, Shield, AlertTriangle, Info, Home as HomeIcon, Tent } from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc
} from 'firebase/firestore';
import { app } from './firebase'; // Adjust this import to match your firebase setup

// Fix for Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Function to get directions using Google Maps
const getDirectionsToShelter = (shelterLat: number, shelterLng: number) => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        
        // Create Google Maps directions URL
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${shelterLat},${shelterLng}&travelmode=driving`;
        
        // Open in a new tab
        window.open(googleMapsUrl, '_blank');
      },
      (error) => {
        console.error("Error getting user location:", error);
        alert("Unable to get your current location. Please allow location access.");
        
        // Fallback: just open directions to the shelter without origin
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${shelterLat},${shelterLng}&travelmode=driving`;
        window.open(googleMapsUrl, '_blank');
      }
    );
  } else {
    alert("Geolocation is not supported by your browser.");
    
    // Fallback: just open the shelter location on the map
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${shelterLat},${shelterLng}`;
    window.open(googleMapsUrl, '_blank');
  }
};

export default function ShelterMap() {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newShelter, setNewShelter] = useState<Partial<Shelter>>({});
  const [loading, setLoading] = useState(true);
  const db = getFirestore(app);

  // Load shelters from Firestore on page load
  useEffect(() => {
    const fetchShelters = async () => {
      try {
        setLoading(true);
        const sheltersCollection = collection(db, 'shelters');
        const sheltersSnapshot = await getDocs(sheltersCollection);
        const sheltersList = sheltersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Shelter));
        
        setShelters(sheltersList);
      } catch (error) {
        console.error("Error fetching shelters:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShelters();
  }, [db]);

  // Function to get district & state from coordinates using OpenStreetMap API
  const fetchLocationDetails = async (lat: number, lon: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
      const data = await response.json();
      const state = data.address.state || "";
      const district = data.address.county || data.address.city || "";
      const fullAddress = data.display_name || "";
      return { state, district, address: fullAddress };
    } catch (error) {
      console.error("Error fetching location details:", error);
      return { state: "", district: "", address: "" };
    }
  };

  function LocationMarker() {
    useMapEvents({
      click: async (e: LeafletMouseEvent) => {
        if (isAdding) {
          const { lat, lng } = e.latlng;
          const { state, district, address } = await fetchLocationDetails(lat, lng);

          setNewShelter({ 
            latitude: lat, 
            longitude: lng, 
            state, 
            district,
            address
          });
          setIsAdding(false); // Disable add mode after selecting location
        }
      },
    });
    return null;
  }

  // Add new shelter to Firestore
  const handleAddShelter = async () => {
    if (!newShelter.latitude || !newShelter.longitude) {
      alert("Click on the map to set location first.");
      return;
    }

    try {
      const shelterData = {
        name: newShelter.name || "New Shelter",
        capacity: newShelter.capacity || 100,
        latitude: newShelter.latitude,
        longitude: newShelter.longitude,
        state: newShelter.state || "Unknown",
        district: newShelter.district || "Unknown",
        address: newShelter.address || "No address provided",
        contactNumber: newShelter.contactNumber || "No contact",
        isActive: true,
      };

      // Add the shelter to Firestore
      const sheltersCollection = collection(db, 'shelters');
      const docRef = await addDoc(sheltersCollection, shelterData);
      
      // Add the new shelter to the state with the Firestore ID
      const newShelterWithId = { id: docRef.id, ...shelterData } as Shelter;
      setShelters([...shelters, newShelterWithId]);
      
      // Reset new shelter form
      setNewShelter({});
    } catch (error) {
      console.error("Error adding shelter:", error);
      alert("Failed to add shelter. Please try again.");
    }
  };

  // Define custom marker icon with different color for user location
  const userLocationIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <div
        className="relative bg-cover bg-center h-[400px]"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2000")',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50">
          <header className="relative z-10">
            <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                {/* Left-aligned Title */}
                <div className="flex items-center">
                  <Mountain className="h-10 w-10 text-white" />
                  <h1 className="ml-3 text-3xl font-bold text-white">
                    India Landslide Prediction System
                  </h1>
                </div>

                {/* Right-aligned Navigation with Icons */}
                <nav className="ml-auto">
                  <ul className="flex space-x-6 text-white text-lg font-medium">
                    <li className="flex items-center space-x-2">
                      <HomeIcon className="h-6 w-6 text-white" />
                      <Link to="/" className="hover:text-gray-300">Home</Link>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Tent className="h-6 w-6 text-white" />
                      <Link to="/shelters" className="hover:text-gray-300">Shelters</Link>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </header>

          <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-extrabold text-white mb-4">
              Predict and Prevent Landslide Risks
            </h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Using advanced geological data and machine learning to help protect communities in landslide-prone regions
            </p>
          </div>
        </div>
      </div>
      
      <div className="h-screen flex p-6">
        {/* Sidebar */}
        <div className="w-1/4 bg-white p-4 shadow-lg overflow-y-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center">
              <MapIcon className="w-5 h-5 mr-2" />
              Emergency Shelters
            </h2>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Input form when adding a shelter */}
          {newShelter.latitude && newShelter.longitude && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-medium mb-2">New Shelter Details</h3>
              <input
                type="text"
                placeholder="Shelter Name"
                value={newShelter.name || ""}
                onChange={(e) => setNewShelter({ ...newShelter, name: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <input
                type="number"
                placeholder="Capacity"
                value={newShelter.capacity || ""}
                onChange={(e) => setNewShelter({ ...newShelter, capacity: Number(e.target.value) })}
                className="w-full p-2 border rounded mt-2"
              />
              <input
                type="text"
                placeholder="Address"
                value={newShelter.address || ""}
                onChange={(e) => setNewShelter({ ...newShelter, address: e.target.value })}
                className="w-full p-2 border rounded mt-2"
              />
              <input
                type="text"
                placeholder="Contact Number"
                value={newShelter.contactNumber || ""}
                onChange={(e) => setNewShelter({ ...newShelter, contactNumber: e.target.value })}
                className="w-full p-2 border rounded mt-2"
              />
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button 
                  onClick={() => setNewShelter({})} 
                  className="bg-gray-400 text-white p-2 rounded"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddShelter} 
                  className="bg-green-600 text-white p-2 rounded"
                >
                  Add Shelter
                </button>
              </div>
            </div>
          )}

          {/* Shelter list */}
          <div className="space-y-4 mt-6">
            {!loading && shelters.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No shelters available. Add a shelter to get started.
              </div>
            )}
            
            {!loading && shelters.map(shelter => (
              <div key={shelter.id} className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                <h3 className="font-medium text-lg">{shelter.name}</h3>
                <p className="text-gray-600 text-sm">{shelter.district}, {shelter.state}</p>
                <p className="text-gray-600 text-sm mt-1">{shelter.address}</p>
                <div className="mt-2 flex items-center text-gray-500 text-sm">
                  <Phone className="w-4 h-4 mr-1" />
                  {shelter.contactNumber || "No contact"}
                </div>
                <div className="mt-2 text-gray-600 text-sm">
                  Capacity: {shelter.capacity} people
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${shelter.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {shelter.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button 
                    onClick={() => getDirectionsToShelter(shelter.latitude, shelter.longitude)}
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <Navigation className="w-4 h-4 mr-1" />
                    Directions
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="w-3/4 relative">
          {isAdding && (
            <div className="absolute top-4 right-4 z-10 bg-white p-3 rounded-lg shadow-md">
              <p className="text-sm font-medium flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1 text-yellow-500" />
                Click on the map to place a shelter
              </p>
            </div>
          )}
          
          <MapContainer center={[20.5937, 78.9629]} zoom={5} className="h-full w-full">
            <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {shelters.map(shelter => (
              <Marker key={shelter.id} position={[shelter.latitude, shelter.longitude]}>
                <Popup>
                  <div className="p-1">
                    <h3 className="font-medium text-lg">{shelter.name}</h3>
                    <p className="text-gray-600 text-sm">{shelter.address}</p>
                    <p className="text-gray-600 text-sm">Capacity: {shelter.capacity}</p>
                    <p className="text-gray-600 text-sm">Contact: {shelter.contactNumber || "N/A"}</p>
                    <button 
                      onClick={() => getDirectionsToShelter(shelter.latitude, shelter.longitude)}
                      className="mt-2 w-full bg-blue-600 text-white px-3 py-1 rounded-md flex items-center justify-center hover:bg-blue-700 transition-colors"
                    >
                      <Navigation className="w-4 h-4 mr-1" />
                      Get Directions
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
            <LocationMarker />
          </MapContainer>
        </div>
      </div>


      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-6 w-6 text-blue-400" />
                <h3 className="text-xl font-bold">India Landslide Prediction System</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Our mission is to provide accessible, accurate landslide risk assessments to vulnerable communities
                across India. Through advanced AI and geological expertise, we aim to save lives and protect property.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4"></h3>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-start">
                  <svg className="h-5 w-5 mr-2 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Ghansoli</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 mr-2 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>info@example.org</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 mr-2 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>+91 1234567890</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            <p>&copy; 2025 India Landslide Prediction System - Advanced Landslide Risk Assessment System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}