import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import moment from "moment";
import { FaUserCircle, FaCheck } from "react-icons/fa"; // Add this import for the user icon
import { Context } from "../main";
import { MdModeComment } from "react-icons/md";
import { FcLike } from "react-icons/fc";
import { ImCross } from "react-icons/im";
import Skenoti from "./Skenoti";
import { Link, Navigate } from "react-router-dom";
import { FaArrowCircleRight } from "react-icons/fa";
function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]); // Add state for friend requests
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(Context);
  const [accepted, setAccepted] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [req, setreq] = useState([]);
  const [posting, setposting] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch notifications
        const notificationsResponse = await axios.get(
          "https://devfinds-backend.onrender.com/api/v1/notifications",
          { withCredentials: true }
        );

        // Fetch friend requests
        const friendRequestsResponse = await axios.get(
          "https://devfinds-backend.onrender.com/api/v1/users/receiverequest",
          { withCredentials: true }
        );

        // Set state for notifications and friend requests
        setNotifications(notificationsResponse.data.notifications);
        console.log(notificationsResponse.data.notifications);
        setFriendRequests(friendRequestsResponse.data.friendRequests);

        const friendRequestIds = friendRequestsResponse.data.friendRequests.map(
          (request) => request._id
        );
        setreq(friendRequestIds);
        const gg = notificationsResponse.data.notifications.map(
          (reqi) => reqi.postId
        );
        setposting(gg);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error fetching data. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array to run the effect only once

  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await axios.post(
        "https://devfinds-backend.onrender.com/api/v1/users/acceptrequest",
        {
          requestBy: requestId,
          status: "Accepted",
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Remove the accepted request from friendRequests state
        setFriendRequests((prevRequests) =>
          prevRequests.filter((request) => request._id !== requestId)
        );
        setAccepted(true);
      }
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const response = await axios.post(
        "https://devfinds-backend.onrender.com/api/v1/users/acceptrequest",
        {
          requestBy: requestId,
          status: "Rejected",
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Remove the rejected request from friendRequests state
        setFriendRequests((prevRequests) =>
          prevRequests.filter((request) => request._id !== requestId)
        );
        setRejected(true);
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };
  console.log(req);
  let mg = req[0];
  if (loading) {
    return <Skenoti />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full md:w-full lg:w-full">
        <div className="bg-gray-100 p-4 border-b">
          <h2 className="text-lg font-semibold text-black">Notifications</h2>
          <p className="text-gray-700">
            You have {notifications.length + friendRequests.length} unread
            Notifications
          </p>
        </div>
        <div className="p-4">
          {/* Display friend requests */}
          {friendRequests?.map((request, index) => (
            <div
              key={index}
              className="flex flex-col items-center mb-4 border-t border-b py-4"
            >
              <div className="rounded-full bg-blue-500 text-white flex items-center justify-center w-10 h-10 mb-3">
                {/* Add user icon */}
                {request.image ? (
                  <img
                    src={request.image}
                    alt="User"
                    className="w-full h-full rounded-full"
                  />
                ) : (
                  <FaUserCircle size={40} />
                )}
              </div>
              <div className="w-full">
                <div className="flex items-center justify-center mb-2">
                  <p className="text-lg text-black ">
                    <Link to={`/userprofile/${req[index]}`}>
                      <span className="hover:underline cursor-pointer font-semibold">
                        {request.name}
                      </span>
                    </Link>{" "}
                    sent you a friend request.
                  </p>
                </div>
                <div className="flex items-center justify-center">
                  <button
                    className="flex items-center justify-center bg-slate-600 text-green-500 rounded-lg p-2 cursor-pointer hover:bg-slate-700 hover:text-white mr-2"
                    onClick={() => handleAcceptRequest(request._id)}
                  >
                    <FaCheck size={24} />
                    <span className="ml-2">Accept</span>
                  </button>
                  <button
                    className="flex items-center justify-center bg-transparent text-red-500 rounded-lg p-2 cursor-pointer hover:bg-red-100 hover:text-red-700 ml-2"
                    onClick={() => handleRejectRequest(request._id)}
                  >
                    <ImCross size={24} />
                    <span className="ml-2">Reject</span>
                  </button>
                </div>
                {accepted && (
                  <div className="friend-request-animation-green text-green-500 animate-slide-in-green">
                    <p>{`${request.name} and you are friends now`}</p>
                  </div>
                )}
                {/* Animation for rejecting friend request */}
                {rejected && (
                  <div className="friend-request-animation-red text-red-500 animate-slide-in-red">
                    <p>Friend Request deleted</p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Display notifications */}
          {notifications?.map((notification, index) => (
            <Link to={`/posts/${posting[index]}`}>
              <div
                key={index}
                className="flex items-center mb-4 border-t border-b py-4"
              >
                <div className="rounded-full bg-blue-500 text-white flex items-center justify-center w-10 h-10 mr-3">
                  {/* Add image component here */}
                  {notification.image ? (
                    <img
                      src={notification.image}
                      alt="User"
                      className="w-full h-full rounded-full"
                    />
                  ) : (
                    <FaUserCircle size={40} />
                  )}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center">
                    {notification.type === "like" && (
                      <FcLike className="mr-2" />
                    )}
                    {notification.type === "comment" && (
                      <MdModeComment className="mr-2" />
                    )}
                    <p className="text-sm text-gray-700">
                      {notification.message}
                    </p>
                    <FaArrowCircleRight size={35} className="text-black hover:text-gray-400 ml-24"/>
                  </div>
                  <p className="text-xs text-gray-500">
                    {moment(notification.createdAt).fromNow()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Notifications;
