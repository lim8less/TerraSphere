import React, { useState, useEffect } from 'react';
import { Map as MapIcon, Plus, Phone } from 'lucide-react';
import type { Shelter } from '../types';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { LeafletMouseEvent } from 'leaflet';

// Fix for Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function ShelterMap() {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newShelter, setNewShelter] = useState<Partial<Shelter>>({});
  
  // Load shelters from localStorage on page load
  useEffect(() => {
    const storedShelters = localStorage.getItem("shelters");
    if (storedShelters) {
      setShelters(JSON.parse(storedShelters));
    }
  }, []);

  // Save shelters to localStorage
  const saveShelters = (shelters: Shelter[]) => {
    localStorage.setItem("shelters", JSON.stringify(shelters));
    setShelters(shelters);
  };

  // Function to get district & state from coordinates using OpenStreetMap API
  const fetchLocationDetails = async (lat: number, lon: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
      const data = await response.json();
      const state = data.address.state || "";
      const district = data.address.county || "";
      return { state, district };
    } catch (error) {
      console.error("Error fetching location details:", error);
      return { state: "", district: "" };
    }
  };

  function LocationMarker() {
    useMapEvents({
      click: async (e: LeafletMouseEvent) => {
        if (isAdding) {
          const { lat, lng } = e.latlng;
          const { state, district } = await fetchLocationDetails(lat, lng);
          
          setNewShelter({ latitude: lat, longitude: lng, state, district });
          setIsAdding(false); // Disable add mode after selecting location
        }
      },
    });
    return null;
  }

  // Add new shelter after confirming details
  const handleAddShelter = () => {
    if (!newShelter.latitude || !newShelter.longitude) {
      alert("Click on the map to set location first.");
      return;
    }

    const newShelterData: Shelter = {
      id: Date.now().toString(),
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

    const updatedShelters = [...shelters, newShelterData];
    saveShelters(updatedShelters);
    setNewShelter({});
  };

  return (
    <div className="h-screen flex">
      
      {/* Sidebar */}
      <div className="w-1/4 bg-white p-4 shadow-lg overflow-y-auto">
        <h2 className="text-xl font-semibold flex items-center">
          <MapIcon className="w-5 h-5 mr-2" />
          Emergency Shelters
        </h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors mt-4"
        >
          <Plus className="w-5 h-5" />
        </button>

        {/* Input form when adding a shelter */}
        {newShelter.latitude && newShelter.longitude && (
          <div className="mt-4 p-4 border rounded-lg bg-gray-50">
            <input
              type="text"
              placeholder="Shelter Name"
              value={newShelter.name || ""}
              onChange={(e) => setNewShelter({ ...newShelter, name: e.target.value })}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
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
            <button onClick={handleAddShelter} className="bg-green-600 text-white p-2 w-full mt-3 rounded">
              Confirm & Add Shelter
            </button>
          </div>
        )}

        <div className="space-y-4 mt-6">
          {shelters.map(shelter => (
            <div key={shelter.id} className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
              <h3 className="font-medium text-lg">{shelter.name}</h3>
              <p className="text-gray-600 text-sm">{shelter.district}, {shelter.state}</p>
              <div className="mt-2 flex items-center text-gray-500 text-sm">
                <Phone className="w-4 h-4 mr-1" />
                {shelter.contactNumber}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${shelter.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {shelter.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="w-3/4 relative">
        <MapContainer center={[20.5937, 78.9629]} zoom={5} className="h-full w-full">
          <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {shelters.map(shelter => (
            <Marker key={shelter.id} position={[shelter.latitude, shelter.longitude]}>
              <Popup>
                <h3>{shelter.name}</h3>
                <p>{shelter.address}</p>
                <p>Capacity: {shelter.capacity}</p>
                <p>Contact: {shelter.contactNumber}</p>
              </Popup>
            </Marker>
          ))}
          <LocationMarker />
        </MapContainer>
      </div>
    </div>
  );
}
