import React from "react";
import { useNavigate } from "react-router-dom";
import { BaseLayout } from "../BaseLayout";


export const LoginPage = () => {
  const navigate = useNavigate();

  const events = [
    { id: 1, title: "Wildfire Relief", location: "Los Angeles, California", image: "fire.jpg" },
    { id: 2, title: "Flood Assistance", location: "Asheville, North Carolina", image: "flood.jpg" },
    { id: 3, title: "Hurricane Recovery", location: "Tampa Bay, Florida", image: "hurricane.jpg" },
    { id: 4, title: "Tornado Aid", location: "Greenfield, Iowa", image: "tornado.jpg" }
  ];

  return (
    <BaseLayout currentStage={1}>
      <div className="grid grid-cols-2 gap-6">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white p-4 rounded-lg shadow-lg flex flex-col"
          >
            <h3 className="text-xl font-bold text-gray-800 text-left">{event.title}</h3>
            <p className="text-sm text-gray-600 text-left">{event.location}</p>
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-40 object-cover rounded-md my-4"
            />
            <div className="flex justify-between w-full mt-4">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md w-[48%]"
                onClick={() =>{
                  localStorage.setItem("helper_mode", false);
                  navigate("/form", { state: { location: event.location } });
                }}
              >
                I Need Help
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-md w-[48%]"
                onClick={() =>{
                  localStorage.setItem("helper_mode", true);
                  navigate("/form", { state: { location: event.location } });
                }}
              >
                I&apos;m a Volunteer
              </button>
            </div>
          </div>
        ))}
      </div>
    </BaseLayout>
  );
};