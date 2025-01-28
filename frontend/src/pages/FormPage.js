import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BaseLayout } from "../BaseLayout";

export const typeDescriptionsReverse = {
  "A place to stay": "house",
  "A place to store a vehicle": "car",
  "A place to store valuables": "house",
  "Help watching a pet": "pet",
  "Other": "house",
};

export const FormPage = () => {
  const navigate = useNavigate();
  const locationState = useLocation().state || {};
  const isHelperMode = localStorage.getItem("helper_mode") === "true";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: locationState.location || "",
    specificNeeds: [],
    additionalDetails: "",
    lat: 0.0,
    lng: 0.0,
    files: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSpecificNeedsChange = (e) => {
    const { value } = e.target;
    setFormData((prevData) => {
      const newNeeds = prevData.specificNeeds.includes(value)
        ? prevData.specificNeeds.filter((need) => need !== value)
        : [...prevData.specificNeeds, value];
      return { ...prevData, specificNeeds: newNeeds };
    });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, files: e.target.files });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("location", formData.location);

    let specificNeeds = formData.specificNeeds.map((need) => {
      return isHelperMode ? typeDescriptionsReverse[need] : need;
    });

    // check if specificNeeds is type list
    console.log("LOOk");
    console.log(specificNeeds);
    if (!Array.isArray(specificNeeds)) {
      specificNeeds = [specificNeeds];
    }
    
    formDataToSend.append("specificNeeds", specificNeeds);
    formDataToSend.append("additionalDetails", formData.additionalDetails);
    formDataToSend.append("is_helper", localStorage.getItem("helper_mode"));

    if (isHelperMode) {
      formDataToSend.append("lat", formData.lat);
      formDataToSend.append("lng", formData.lng);
    }

    if (formData.files) {
      Array.from(formData.files).forEach((file) => {
        formDataToSend.append("files", file);
      });
    }

    try {
      const response = await fetch("http://localhost:8000/create/user", {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        const responseData = await response.json();

        // Store the user ID in localStorage
        if (isHelperMode) {
          localStorage.setItem("helper_id", responseData.id);
          navigate(`/inbox/${responseData.id}`);
        } else {
          localStorage.setItem("user_id", responseData.id);
          navigate("/map");
        }
      } else {
        console.error("Failed to submit the form");
      }
    } catch (error) {
      console.error("Error submitting the form:", error);
    }
  };

  return (
    <BaseLayout currentStage={2}>
      <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-bold mb-4">Your Details</h2>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2">Name</label>
          <input
            className="w-full p-2 border rounded mb-4"
            type="text"
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
          />
          <label className="block mb-2">Email</label>
          <input
            className="w-full p-2 border rounded mb-4"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
          />
          <label className="block mb-2">Location</label>
          <input
            className="w-full p-2 border rounded mb-4"
            type="text"
            name="location"
            placeholder="Enter your location"
            value={formData.location}
            onChange={handleChange}
          />
          {isHelperMode && (
            <>
              <label className="block mb-2">Latitude</label>
              <input
                className="w-full p-2 border rounded mb-4"
                type="text"
                name="lat"
                placeholder="Enter latitude"
                value={formData.lat}
                onChange={handleChange}
              />
              <label className="block mb-2">Longitude</label>
              <input
                className="w-full p-2 border rounded mb-4"
                type="text"
                name="lng"
                placeholder="Enter longitude"
                value={formData.lng}
                onChange={handleChange}
              />
            </>
          )}
          <label className="block mb-2">Specific Needs</label>
          <div className="mb-4">
            {["A place to stay", "A place to store a vehicle", "A place to store valuables", "Help watching a pet", "Other"].map((need) => (
              <div key={need} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id={need}
                  value={need}
                  checked={formData.specificNeeds.includes(need)}
                  onChange={handleSpecificNeedsChange}
                  className="mr-2"
                />
                <label htmlFor={need} className="text-gray-800">
                  {need}
                </label>
              </div>
            ))}
          </div>
          <label className="block mb-2">Additional Details</label>
          <textarea
            className="w-full p-2 border rounded mb-4"
            name="additionalDetails"
            placeholder="Add any additional details"
            value={formData.additionalDetails}
            onChange={handleChange}
          ></textarea>
          <label className="block mb-2">Upload Pictures</label>
          <input
            className="w-full p-2 border rounded mb-4"
            type="file"
            multiple
            onChange={handleFileChange}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
            type="submit"
          >
            Submit
          </button>
        </form>
      </div>
    </BaseLayout>
  );
};