// MapPage.js
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BaseLayout } from "../BaseLayout";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

export const typeDescriptions = {
  pet: "Can watch pets",
  house: "Has room for guests",
  car: "Has space in a garage",
};

export const MapPage = () => {
  const [helpers, setHelpers] = useState([]);
  const mapRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHelpers = async () => {
      try {
        const response = await axios.get("http://localhost:8000/get/users");
        setHelpers(response.data.filter((helper) => helper.is_helper));

        if (!mapRef.current) {
          // Initialize the map
          const map = L.map("map-container").setView([34.078159, -118.260097], 13); // Centered on Echo Park, California

          // Add OpenStreetMap tiles
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
          }).addTo(map);

          // Add markers for each helper
          response.data.forEach((helper) => {
            const markerIcon = L.icon({
              iconUrl: `/${helper.specificNeeds[0]}.svg`, // Use the helper's image
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
            });

            const marker = L.marker([helper.lat, helper.lng], { icon: markerIcon })
              .addTo(map)
              .bindPopup(helper.name);

            marker.on("click", () => {
              localStorage.setItem("helper_id", helper.id); // Save the helper ID in localStorage
              navigate("/detail");
            });
          });

          // Save map instance for later use
          mapRef.current = map;
        }
      } catch (error) {
        console.error("Error fetching helpers:", error);
      }
    };

    fetchHelpers();
  }, [navigate]);

  return (
    <BaseLayout currentStage={3}>
      <div id="map-container" className="h-96 bg-gray-300 mb-4 rounded"></div>
      <div className="grid grid-cols-4 gap-4">
        {helpers.map((helper) => (
          <div
            key={helper.id}
            className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center cursor-pointer"
            onClick={() => {
              localStorage.setItem("helper_id", helper.id); // Save the helper ID in localStorage
              navigate("/detail");
            }}
          >
            <img
              src={`http://localhost:8000/getImage/${helper.image}`}
              alt={helper.name}
              className="w-full h-32 object-cover rounded mb-2"
            />
            <h3 className="text-lg font-bold text-gray-800 mb-1">{helper.name}</h3>
            <p className="text-sm text-gray-600">{typeDescriptions[helper.specificNeeds[0]]}</p>
          </div>
        ))}
      </div>
    </BaseLayout>
  );
};
