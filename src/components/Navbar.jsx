import React from "react";
import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Medical Validation OCR
            </h1>
          </div>
          
          <div className="flex space-x-8">
            <Link
              to="/upload"
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive("/upload")
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              }`}
            >
              Upload & Extract
            </Link>
            
            <Link
              to="/verify"
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive("/verify")
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              }`}
            >
              Verify
            </Link>
            
            <Link
              to="/compare"
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive("/compare")
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              }`}
            >
              Compare
            </Link>
            
            <Link
              to="/rules"
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive("/rules")
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              }`}
            >
              View Rules
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
