import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

export const MidSignHelperPage = () => {
  const location = useLocation();

  useEffect(() => {
    // Extract the access_token from the URL fragment (after the # symbol)
    const fragment = location.hash;
    const accessToken = fragment.split("=")[1] || "Token not found";

    const sendSignRequest = async () => {
      try {
        const user_id = localStorage.getItem("user_id");
        const helper_id = localStorage.getItem("helper_id");
        const response = await axios.post(`http://localhost:8000//getContractUrl/${user_id}/${helper_id}`, {
            access_token: accessToken,
        });    

        if (response.status === 200 && response.data.url) {
          window.location.href = response.data.url;
        } else {
          console.error("Failed to get redirection URL from server.");
        }
      } catch (error) {
        console.error("Error sending sign request:", error);
      }
    };

    sendSignRequest();
  }, [location.hash]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white w-1/2 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Processing...</h2>
        <p className="text-lg">Please wait while we finalize the signing process.</p>
      </div>
    </div>
  );
};
