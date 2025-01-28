import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BaseLayout } from "../BaseLayout";

export const InboxPage = () => {
  const { userId } = useParams();
  const [conversations, setConversations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch(`http://localhost:8000/getMessageUsers/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setConversations(data);
        } else {
          console.error("Failed to fetch conversations");
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };

    localStorage.setItem("helper_id", userId);
    localStorage.setItem("helper_mode", true);

    fetchConversations();

    // Poll every 3 seconds to keep the inbox updated
    const interval = setInterval(fetchConversations, 3000);

    return () => clearInterval(interval);
  }, [userId]);

  return (
    <BaseLayout currentStage={4}>
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Inbox</h2>
        {conversations.length === 0 ? (
          <p className="text-gray-500 text-center">You have no messages yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {conversations.map((user) => (
              <div
                key={user.id}
                className="flex items-center bg-gray-100 p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-200"
                onClick={() => {
                  localStorage.setItem("user_id", user.id);
                  navigate(`/detail`);
                }}
              >
                <img
                  src={user.image ? `http://localhost:8000/getImage/${user.image}` : "/user.jpg"}
                  alt={user.name}
                  className="w-16 h-16 object-cover rounded-full mr-4"
                />
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{user.name}</h3>
                  <p className="text-sm text-gray-600">
                    Needs: {user.specificNeeds.join(", ")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </BaseLayout>
  );
};
