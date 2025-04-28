import React from 'react';
import { Link } from 'react-router-dom';
import { Map as MapIcon, ArrowRight, Phone, Plus } from 'lucide-react';
import type { Shelter } from '../types';

const DEMO_SHELTERS: Shelter[] = [
  {
    id: '1',
    name: 'Uttarakhand Emergency Shelter',
    capacity: 500,
    latitude: 30.3165,
    longitude: 78.0322,
    state: 'Uttarakhand',
    district: 'Dehradun',
    address: '123 Safety Road, Dehradun',
    contactNumber: '+91-1234567890',
    isActive: true,
  },
  {
    id: '2',
    name: 'Himachal Relief Center',
    capacity: 300,
    latitude: 31.1048,
    longitude: 77.1734,
    state: 'Himachal Pradesh',
    district: 'Shimla',
    address: '456 Shelter Street, Shimla',
    contactNumber: '+91-9876543210',
    isActive: true,
  },
];

// Accepts isAdmin prop to check if user is an admin
export default function ShelterPreview({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mt-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <MapIcon className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-semibold ml-2">Nearby Emergency Shelters</h2>
        </div>

        <div className="flex items-center space-x-4">
          {/* Show "Add Shelter" button only for admins */}
          {isAdmin && (
            <Link
              to="/admin/add-shelter"
              className="flex items-center text-green-600 hover:text-green-800 transition-colors"
            >
              <Plus className="h-5 w-5 mr-1" />
              Add Shelter
            </Link>
          )}

          <Link
            to="/shelters"
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            View All
            <ArrowRight className="h-5 w-5 ml-1" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DEMO_SHELTERS.map(shelter => (
          <div
            key={shelter.id}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg text-gray-900">{shelter.name}</h3>
                <p className="text-gray-600 text-sm">{shelter.district}, {shelter.state}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                shelter.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {shelter.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="mt-3 flex items-center text-gray-500 text-sm">
              <Phone className="w-4 h-4 mr-1" />
              {shelter.contactNumber}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Capacity: {shelter.capacity} people
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link
          to="/shelters"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          View Full Map
          <MapIcon className="ml-2 -mr-1 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
