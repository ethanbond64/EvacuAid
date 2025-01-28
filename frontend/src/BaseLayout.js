import React from "react";
import { useNavigate } from "react-router-dom";

export const BaseLayout = ({ children, currentStage }) => {
  const navigate = useNavigate();

  const stages = [
    { number: 1, label: "Welcome", path: "/" },
    { number: 2, label: "Register", path: "/form" },
    { number: 3, label: "Matching", path: "/map" },
    { number: 4, label: "Details", path: "/detail" },
    { number: 5, label: "Sign", path: "/sign" },
  ];

  const isHelperMode = localStorage.getItem("helper_mode") === "true";
  const roleBadge = isHelperMode ? "Volunteer" : "In Need";

  return (
    <div className="min-h-screen bg-blue-500 flex flex-col items-center justify-center">
      <div className="relative bg-white w-2/3 p-12 rounded-3xl shadow-lg flex flex-col my-20">
        {/* User Info */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {<span
            className={`px-2 py-1 text-xs font-bold rounded-full ${
              isHelperMode ? "bg-green-500 text-white" : "bg-red-500 text-white"
            }`}
          >
            {roleBadge}
          </span>}
        </div>

        {/* Header */}
        <header className="text-center mb-6">
          <img
            src="/logo512.png"
            alt="Logo"
            className="mx-auto my-0 h-48 w-auto"
          />
          <h2 className="text-lg font-bold text-green-900">Community Disaster Relief</h2>
        </header>

        {/* Stages */}
        <div className="flex justify-center mb-6 space-x-4">
          {stages.map((stage) => (
            <div
              key={stage.number}
              className={`px-4 py-2 rounded-full text-sm font-bold cursor-pointer ${
                currentStage === stage.number
                  ? "bg-green-700 text-white"
                  : currentStage > stage.number
                  ? "bg-gray-400 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
              onClick={() => currentStage > stage.number && navigate(stage.path)}
            >
              {stage.number}. {stage.label}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <main className="flex-grow">{children}</main>

        {/* Footer */}
        <footer className="text-center mt-6 text-sm text-gray-600">
          <p>&copy; 2025 EvacuAid</p>
        </footer>
      </div>
    </div>
  );
};
