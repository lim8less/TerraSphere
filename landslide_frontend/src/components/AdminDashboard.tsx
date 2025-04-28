import React, { useState, useEffect, useRef } from 'react';
import { Shield, Plus, Map as MapIcon, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { app } from '../firebase';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Shelter {
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

export default function AdminDashboard() {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [isAddingForm, setIsAddingForm] = useState(false);
  const [isMapMode, setIsMapMode] = useState(false);
  const [newShelter, setNewShelter] = useState<Partial<Shelter>>({
    name: '',
    capacity: 100,
    latitude: 0,
    longitude: 0,
    state: '',
    district: '',
    address: '',
    contactNumber: '',
    isActive: true
  });
  const [loading, setLoading] = useState(true);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  
  const navigate = useNavigate();
  const auth = getAuth(app);
  const db = getFirestore(app);

  // Fetch shelters from Firestore
  useEffect(() => {
    const fetchShelters = async () => {
      try {
        const sheltersCollection = collection(db, 'shelters');
        const sheltersSnapshot = await getDocs(sheltersCollection);
        const sheltersList = sheltersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Shelter));
        
        setShelters(sheltersList);
      } catch (error) {
        console.error("Error fetching shelters:", error);
        toast.error("Failed to load shelters");
      } finally {
        setLoading(false);
      }
    };

    fetchShelters();
  }, [db]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully");
      navigate("/admin/login");
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  // Function to get district & state from coordinates using OpenStreetMap API
  const fetchLocationDetails = async (lat: number, lon: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
      const data = await response.json();
      const state = data.address?.state || "";
      const district = data.address?.county || data.address?.city || "";
      const address = data.display_name || "";
      return { state, district, address };
    } catch (error) {
      console.error("Error fetching location details:", error);
      return { state: "", district: "", address: "" };
    }
  };

  // Add new shelter to Firestore
  const handleAddShelter = async () => {
    if (!newShelter.name || !newShelter.latitude || !newShelter.longitude) {
      toast.error("Please provide a shelter name and location");
      return;
    }

    try {
      setLoading(true);
      
      // Add to Firestore
      const sheltersCollection = collection(db, 'shelters');
      const docRef = await addDoc(sheltersCollection, {
        ...newShelter,
        capacity: Number(newShelter.capacity),
        isActive: true
      });

      // Add to state with the new ID
      const addedShelter = {
        id: docRef.id,
        ...newShelter,
        capacity: Number(newShelter.capacity),
        isActive: true
      } as Shelter;
      
      setShelters([...shelters, addedShelter]);
      
      // Reset form
      setNewShelter({
        name: '',
        capacity: 100,
        latitude: 0,
        longitude: 0,
        state: '',
        district: '',
        address: '',
        contactNumber: '',
        isActive: true
      });
      
      setIsAddingForm(false);
      setIsMapMode(false);
      setShowNamePrompt(false);
      toast.success("Shelter added successfully");
    } catch (error) {
      console.error("Error adding shelter:", error);
      toast.error("Failed to add shelter");
    } finally {
      setLoading(false);
    }
  };

  // Toggle shelter status
  const toggleShelterStatus = async (id: string, currentStatus: boolean) => {
    try {
      const shelterRef = doc(db, 'shelters', id);
      await updateDoc(shelterRef, {
        isActive: !currentStatus
      });

      // Update local state
      setShelters(shelters.map(shelter => 
        shelter.id === id ? {...shelter, isActive: !currentStatus} : shelter
      ));
      
      toast.success(`Shelter ${currentStatus ? 'deactivated' : 'activated'}`);
    } catch (error) {
      console.error("Error updating shelter status:", error);
      toast.error("Failed to update shelter status");
    }
  };

  // Delete shelter
  const deleteShelter = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this shelter?")) {
      try {
        await deleteDoc(doc(db, 'shelters', id));
        setShelters(shelters.filter(shelter => shelter.id !== id));
        toast.success("Shelter deleted successfully");
      } catch (error) {
        console.error("Error deleting shelter:", error);
        toast.error("Failed to delete shelter");
      }
    }
  };

  // Map Click Handler Component
  const MapClickHandler = () => {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        
        // Get location details
        const { state, district, address } = await fetchLocationDetails(lat, lng);
        
        // Update newShelter with location info
        setNewShelter({
          ...newShelter,
          latitude: lat,
          longitude: lng,
          state,
          district,
          address
        });
        
        // Show name prompt
        setShowNamePrompt(true);
      }
    });
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Shield className="h-8 w-8 mr-3" />
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center">
            <button
              onClick={() => navigate("/shelters")}
              className="flex items-center bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-lg mr-4"
            >
              <MapIcon className="mr-2 h-5 w-5" />
              View Map
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
            >
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Emergency Shelters Management</h2>
            <button
              onClick={() => {
                setIsMapMode(true);
                setIsAddingForm(false);
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
              disabled={isMapMode || isAddingForm}
            >
              <Plus className="mr-2 h-5 w-5" />
              Add New Shelter
            </button>
          </div>

          {/* Map for Adding Shelter */}
          {isMapMode && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h3 className="text-lg font-medium mb-4">Click on the map to place a new shelter</h3>
              
              <div style={{ height: "500px", width: "100%"}}>
                <MapContainer 
                  center={[20.5937, 78.9629]} // India center coordinates
                  zoom={5} 
                  style={{ height: "100%", width: "100%", zIndex: 0 }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapClickHandler />
                  
                  {/* Show existing shelters on map */}
                  {shelters.map(shelter => (
                    <Marker 
                      key={shelter.id}
                      position={[shelter.latitude, shelter.longitude]}
                    />
                  ))}
                  
                  {/* Show new marker if coordinates are set */}
                 {/* Show new marker if coordinates are set */}
{newShelter.latitude !== undefined && newShelter.longitude !== undefined &&
  newShelter.latitude !== 0 && newShelter.longitude !== 0 && (
    <Marker position={[newShelter.latitude ?? 0, newShelter.longitude ?? 0]} />
)}

                </MapContainer>
              </div>
              
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setIsMapMode(false);
                    setShowNamePrompt(false);
                    setNewShelter({
                      name: '',
                      capacity: 100,
                      latitude: 0,
                      longitude: 0,
                      state: '',
                      district: '',
                      address: '',
                      contactNumber: '',
                      isActive: true
                    });
                  }}
                  className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Name Prompt Modal */}
          {showNamePrompt && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                <h3 className="text-lg font-medium mb-4">Enter Shelter Details</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shelter Name*
                  </label>
                  <input
                    type="text"
                    value={newShelter.name || ''}
                    onChange={(e) => setNewShelter({ ...newShelter, name: e.target.value })}
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    value={newShelter.capacity || ''}
                    onChange={(e) => setNewShelter({ ...newShelter, capacity: Number(e.target.value) })}
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    value={newShelter.contactNumber || ''}
                    onChange={(e) => setNewShelter({ ...newShelter, contactNumber: e.target.value })}
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="mt-6 flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setShowNamePrompt(false);
                    }}
                    className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddShelter}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    Save Shelter
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Shelters List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Capacity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {shelters.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          No shelters found. Add one to get started.
                        </td>
                      </tr>
                    ) : (
                      shelters.map((shelter) => (
                        <tr key={shelter.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{shelter.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{shelter.district}, {shelter.state}</div>
                            <div className="text-xs text-gray-500">{shelter.address}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{shelter.capacity}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {shelter.contactNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${shelter.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {shelter.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button 
                              onClick={() => toggleShelterStatus(shelter.id, shelter.isActive)}
                              className={`mr-2 px-3 py-1 rounded 
                                ${shelter.isActive 
                                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                                  : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                            >
                              {shelter.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button 
                              onClick={() => deleteShelter(shelter.id)}
                              className="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}