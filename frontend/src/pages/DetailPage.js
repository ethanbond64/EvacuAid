import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BaseLayout } from "../BaseLayout";
import { typeDescriptions } from "./MapPage";
import { Virtuoso } from "react-virtuoso";
import axios from "axios";

export const DetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const userId = localStorage.getItem("user_id");
  const helperId = localStorage.getItem("helper_id");
  const isHelperMode = localStorage.getItem("helper_mode") === "true";

  const targetUserId = isHelperMode ? userId : helperId;

  const [userDetails, setUserDetails] = useState({});
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [contractStatus, setContractStatus] = useState("");

  const signingComplete = new URLSearchParams(location.search).get("event") === "signing_complete";

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/get/users/${targetUserId}`);
        setUserDetails(response.data);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, [targetUserId]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/getMessages/${userId}/${helperId}`);
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);

    return () => clearInterval(interval);
  }, [userId, helperId]);

  useEffect(() => {
    if (isHelperMode) {
      const pollContractStatus = async () => {
        try {
          const response = await axios.get(`http://localhost:8000/getContract/${userId}/${helperId}`);
          // eslint-disable-next-line
          if (response.status == 200) {
            setContractStatus(
              <div className="flex items-center gap-4">
                <span className="text-green-500 font-bold">The other user has created an agreement. Check your email to sign</span>
              </div>
            );
          } else {
            setContractStatus(
              <span className="text-red-500 font-bold">The other user has not yet initiated an agreement.</span>
            );
          }
        } catch (error) {
          setContractStatus(
            <span className="text-red-500 font-bold">The other user has not yet initiated an agreement.</span>
          );
        }
      };

      pollContractStatus();
      const interval = setInterval(pollContractStatus, 4000);

      return () => clearInterval(interval);
    }
  }, [isHelperMode, userId, helperId]);

  const sendMessage = async () => {
    if (newMessage.trim() !== "") {
      try {
        const senderId = isHelperMode ? helperId : userId;
        await axios.post(`http://localhost:8000/sendMessage/${senderId}/${targetUserId}`, {
          content: newMessage,
        });

        setNewMessage("");

        const response = await axios.get(`http://localhost:8000/getMessages/${userId}/${helperId}`);
        setMessages(response.data);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <BaseLayout currentStage={4}>
      <div className="flex flex-row gap-6">
        {/* Left Section - Helper Details */}
        <div className="w-2/3 bg-white p-6 rounded-lg shadow-md">
          <img
            src={userDetails.image ? `http://localhost:8000/getImage/${userDetails.image}` : "/fire.jpg"}
            alt="User Profile"
            className="w-full h-64 object-cover rounded mb-4"
          />
          <h2 className="text-2xl font-bold mb-2">{userDetails.name}</h2>
          <p className="text-sm text-gray-600 mb-1">
            {typeDescriptions[userDetails.specificNeeds?.[0]]}
          </p>
          <p className="text-gray-800 mb-4">
            {userDetails.additionalDetails || "This user has not added any additional details."}
          </p>
          {isHelperMode && !signingComplete ? (
            <div className="mt-4">{contractStatus}</div>
          ) : (
            signingComplete ?
            ( <div className="text-center mt-6">
                <p className="text-green-500 font-bold">
                  You have signed an agreement, waiting on the other party.
                </p>
              </div>
          ) : 
            (
            <button
              className="bg-green-500 text-white px-4 py-2 mt-4 rounded-md float-right"
              onClick={() => navigate("/sign")}
            >
              Create Agreement
            </button>
          ))}
        </div>

        {/* Right Section - Messaging Interface */}
        <div className="w-1/3 bg-gray-100 p-4 rounded-lg shadow-md flex flex-col">
          <h3 className="text-lg font-bold mb-4">Chat with {userDetails.name}</h3>
          <div className="flex-grow bg-white p-3 rounded shadow-inner overflow-y-scroll">
            <Virtuoso
              style={{ height: "100%" }}
              data={messages}
              itemContent={(index, msg) => (msg &&
                <div
                  className={`flex mb-2 ${
                    // eslint-disable-next-line
                    (isHelperMode && msg.sender == helperId) || (!isHelperMode && msg.sender == userId)
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`p-2 max-w-3/4 rounded-lg text-sm ${
                      // eslint-disable-next-line
                      (isHelperMode && msg.sender == helperId) || (!isHelperMode && msg.sender == userId)
                        ? "bg-blue-500 text-white ml-6"
                        : "bg-gray-200 text-black mr-6"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              )}
            />
          </div>
          <div className="flex mt-4 gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-grow p-2 border rounded"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};
