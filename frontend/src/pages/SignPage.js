// SignPage.js
import React, { useEffect, useState } from "react";
import { BaseLayout } from "../BaseLayout";
import axios from "axios";

export const SignPage = () => {
  const [contractText, setContractText] = useState("Loading contract...");

  useEffect(() => {
    const fetchContract = async () => {
      const userId = localStorage.getItem("user_id");
      const helperId = localStorage.getItem("helper_id");

      try {
        const response = await axios.post("http://localhost:8000/generate/contract", {
          user_id: userId,
          helper_id: helperId,
        });

        if (response.status === 200) {
          setContractText(response.data.contract);
          localStorage.setItem("contract", response.data.contract);
        } else {
          setContractText("Failed to load contract.");
          console.error("Failed to generate contract.");
        }
      } catch (error) {
        setContractText("Error loading contract.");
        console.error("Error fetching contract:", error);
      }
    };

    fetchContract();
  }, []);

  const handleSign = async () => {
    try {
      const response = await axios.get("http://localhost:8000/readyToSign");
      if (response.status === 200) {
        const url = response.data.url;
        const redirectUrl = `${url}&redirect_uri=http://localhost:3000/midsign`;
        window.location.href = redirectUrl;
      } else {
        console.error("Failed to get the signing URL.");
      }
    } catch (error) {
      console.error("Error during sign request:", error);
    }
  };

  return (
    <BaseLayout currentStage={5}>
      <div className="max-w-2/3 mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-2">Review and Sign</h2>
        <h3 className="text-xl font-semibold italic mb-4">This contract has been created from our standard template. Details created with the help of AI.</h3>
        <p className="mb-6 pl-6 whitespace-pre-wrap">{contractText}</p>
        <button
          onClick={handleSign}
          className="bg-green-500 text-white px-4 py-2 rounded-md"
          disabled={contractText === "Loading contract..." || contractText === "Error loading contract."}
        >
          Sign Contract
        </button>
      </div>
    </BaseLayout>
  );
};
