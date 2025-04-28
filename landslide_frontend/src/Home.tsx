import React from 'react';
import { Mountain, Shield, AlertTriangle, Info, Home as HomeIcon, Tent } from 'lucide-react';
import PredictionForm from './components/PredictionForm';
import { Link } from 'react-router-dom';
import Chatbot from './components/Chatbot'; // Import the Chatbot component
import ShelterPreview from './components/ShelterPreview';
import ShelterMap from './components/ShelterMap';

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      {/* Hero Section */}
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
            <Shield className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced Risk Assessment</h3>
            <p className="text-gray-600">Multi-factor analysis considering rainfall, terrain, and geological conditions</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
            <AlertTriangle className="h-12 w-12 text-orange-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Early Warning System</h3>
            <p className="text-gray-600">Get detailed recommendations based on risk assessment results</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
            <Info className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Guidance</h3>
            <p className="text-gray-600">Scientifically backed recommendations for risk mitigation</p>
          </div>
        </div>
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Landslide Risk Assessment Portal</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our advanced AI-powered system analyzes geological, meteorological, and environmental parameters to predict
            landslide risk with high accuracy. Your safety is our priority.
          </p>
          <div className="mt-6 flex justify-center space-x-4">
            <div className="bg-blue-100 rounded-lg px-4 py-2 flex items-center">
              <AlertTriangle className="h-5 w-5 text-blue-700 mr-2" />
              <span className="text-blue-800 font-medium">25+ Risk Factors Analyzed</span>
            </div>
            <div className="bg-green-100 rounded-lg px-4 py-2 flex items-center">
              <Shield className="h-5 w-5 text-green-700 mr-2" />
              <span className="text-green-800 font-medium">92% Prediction Accuracy</span>
            </div>
          </div>
        </div>

        {/* Information Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border-l-4 border-blue-600">
          <div className="flex items-start">
            <Info className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Why This Assessment Matters</h3>
              <p className="text-gray-600">
                Landslides are among the most destructive natural disasters in mountainous regions of India, causing
                significant loss of life and property. By providing accurate data below, you can receive personalized
                risk assessments and critical safety recommendations for your specific location.
              </p>
            </div>
          </div>
        </div>
        {/* Main Form Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-0"
              style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1621507744592-a3acb21c631d?auto=format&fit=crop&q=80&w=1000")',
              }}
            />
            <div className="lg:col-span-3">
              <PredictionForm />
            </div>
          </div>
        </div>
   {/* Emergency Shelters Preview */}
   {/* <ShelterPreview /> */}
        {/* Additional Information */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-semibold mb-4">
            About This Tool
          </h3>
          <p className="text-blue-100 leading-relaxed">
            This prediction system uses environmental and geological parameters to assess landslide risk in various regions of India.
            The tool considers factors such as rainfall, slope angle, soil type, vegetation cover, and elevation to provide risk assessments.
            Please note that this is a preliminary assessment tool and should be used in conjunction with official warnings and guidance from local authorities.
          </p>
        </div>
      </main>
      
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
      
      {/* Add the Chatbot component */}
      <Chatbot />
    </div>
  );
}

export default Home;
