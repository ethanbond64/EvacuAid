import React from "react";

export const SuccessPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100">
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <h2 className="text-3xl font-bold text-green-600 mb-4">Action Succeeded</h2>
        <p className="text-lg text-gray-800">Your action was successfully completed.</p>
      </div>
    </div>
  );
};