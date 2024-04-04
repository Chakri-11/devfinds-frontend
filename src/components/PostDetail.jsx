import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import moment from "moment";
import { FaUserCircle, FaShare } from "react-icons/fa";
import { CiHeart } from "react-icons/ci";
import { GoComment } from "react-icons/go";
import { Transition } from "@headlessui/react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { FcLike } from "react-icons/fc";
import { Context } from "../main";
import ImageViewer from "react-simple-image-viewer";
import SkePostdetail from "./SkePostdetail";
import ReactPlayer from "react-player";

const socket = io("https://devfinds-backend.onrender.com/", {
  reconnection: true,
});

const PostDetail = () => {
  const { user } = useContext(Context);
  const [post, setPost] = useState(null);
  const [comment, setCommentInput] = useState("");
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [commentio, setCommentio] = useState([]);
  const { postId } = useParams();
  const [currentImage, setCurrentImage] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [tof, setTof] = useState("");
  const [imG, setimg] = useState("");

  const cid = user._id; // Convert the id to string format
  console.log(cid);
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(
          `https://devfinds-backend.onrender.com/api/v1/posts/post/${postId}`,
          {
            withCredentials: true,
          }
        );
        console.log(response);
        setPost(response.data.post);
        setCommentio(response.data.post.comments);
        setimg(response.data.post.user.image); // Set comments from fetched data
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };
    fetchPost();
  }, [postId]);
  const fetchUserName = async (userId) => {
    try {
      const response = await axios.get(
        `https://devfinds-backend.onrender.com/api/v1/user/${userId}`
      );
      return response.data.name;
    } catch (error) {
      console.error("Error fetching user name:", error);
      return "Unknown User"; // Default name if fetching fails
    }
  };
  const toggleComment = () => {
    setIsCommentOpen((prev) => !prev);
  };
  const openImageViewer = (index) => {
    setCurrentImage(index);
    setIsViewerOpen(true);
  };

  const closeImageViewer = () => {
    setCurrentImage(0);
    setIsViewerOpen(false);
  };

  useEffect(() => {
    // Listen for new-comment event from server
    socket.on("new-comment", (newComment) => {
      setCommentio((prevComments) => [...prevComments, newComment]);
    });
    socket.on("add-like", (updatedPost) => {
      setPost(updatedPost);
    });

    // Listen for remove-like event from server
    socket.on("remove-like", (updatedPost) => {
      setPost(updatedPost);
    });
    // Clean up socket event listener
    return () => {
      socket.off("new-comment");
      socket.off("add-like");
      socket.off("remove-like");
    };
  }, []);
  const handleLike = async () => {
    try {
      const response = await axios.put(
        `https://devfinds-backend.onrender.com/api/v1/posts/like/post/${postId}`,
        {},
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        // No need to emit an event here since the server will handle it
      }
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Failed to like post");
    }
  };

  const handleUnlike = async () => {
    try {
      const response = await axios.put(
        `https://devfinds-backend.onrender.com/api/v1/posts/unlike/post/${postId}`,
        {},
        {
          withCredentials: true,
        }
      );

    } catch (error) {
      console.error("Error unliking post:", error);
      toast.error("Failed to unlike post");
    }
  };
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `https://devfinds-backend.onrender.com/api/v1/posts/comment/post/${postId}`,
        { comment },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Comment posted successfully");
        setCommentInput(""); // Clear the comment input field
        // Emit new-comment event to server
        socket.emit(
          "new-comment",
          response.data.post.comments[response.data.post.comments.length - 1]
        );
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Failed to post comment");
    }
  };

  const commentsToDisplay =
    commentio.length > 0
      ? commentio
      : post && post.comments
      ? post.comments
      : [];

  if (!post) {
    return <SkePostdetail />;
  }
  const getPostFileName = (url) => {
    const segments = url.split("/");
    const lastSegment = segments[segments.length - 1];
    const fileName = decodeURIComponent(lastSegment.split("?")[0]);
    return fileName;
  };
  const timeFromNow = moment(post.createdAt).fromNow();
  const isLikedByCurrentUser = post.likes.includes(cid);
  console.log(commentsToDisplay);
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex-grow">
        <div className="flex items-center justify-center min-h-svh bg-gray-100 ">
          <div className="max-w-3xl w-full p-8 bg-white rounded-2xl shadow-lg md:h-auto sm:h-svh">
            <div className="flex items-center mb-7">
              {imG ? (
                <img
                  src={imG}
                  alt={post.user.name}
                  className="h-14 w-14 mr-2 rounded-full object-cover"
                />
              ) : (
                <FaUserCircle className="h-14 w-14 mr-2" />
              )}
              <div>
                <Link
                  to={`/userprofile/${post.user._id}`}
                  className="text-black font-semibold cursor-pointer"
                >
                  {post.user.name}
                </Link>
                <p className="text-gray-500">Posted {timeFromNow}</p>
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-4 text-black">{post.title}</h1>
            <p className="text-gray-600 mb-4 ">{post.description}</p>
            {post.tof === "pic" && post.image && (
              <div className="aspect-auto w-full mb-4 border border-solid rounded-lg border-gray-400  md:overflow-hidden">
                <div className="">
                  <img
                    src={post.image}
                    alt="Post Image"
                    className="object-cover  mx-auto rounded-lg object-center"
                    width={400}
                    height={225}
                    onClick={() => openImageViewer(0)}
                  />
                </div>
              </div>
            )}
            {post.tof === "vid" && post.image && (
              <ReactPlayer
                url={post.image}
                controls={true}
                width="100%"
                height="auto"
                className="mb-4"
                playing={true} // Auto play the video
                loop={true} // Loop the video
                muted={true} // Mute the video
                pip={true} // Picture-in-Picture mode
                config={{
                  youtube: {
                    playerVars: { showinfo: 1 }, // YouTube player options
                  },
                }}
              />
            )}
            {(post.tof === "pdf" || post.tof === "doc") && post.image && (
              <a
                href={post.image} // Assuming post.image contains the URL
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
              >
                <img
                  src="https://static-00.iconduck.com/assets.00/folder-icon-512x410-jvths5l6.png"
                  alt="Folder Icon"
                  className="w-6 h-6"
                />
                <span>{getPostFileName(post.image)}</span>
              </a>
            )}
            {isViewerOpen && (
              <ImageViewer
                src={[post.image]}
                currentIndex={currentImage}
                disableScroll={false}
                closeOnClickOutside={true}
                onClose={closeImageViewer}
              />
            )}
            <div className="border-t border-gray-300 pt-4 flex items-center justify-between">
              <div className="flex items-center">
                {isLikedByCurrentUser ? (
                  // Render unlike button
                  <FcLike
                    onClick={handleUnlike}
                    size={24}
                    className="cursor-pointer mr-2 text-red-500"
                  />
                ) : (
                  // Render like button
                  <CiHeart
                    onClick={handleLike}
                    size={24}
                    className="cursor-pointer mr-2 text-gray-500"
                  />
                )}
                <p className="text-gray-600">{post.likes.length} Likes</p>
              </div>
              <div className="flex items-center">
                <GoComment
                  size={24}
                  className="text-blue-500 cursor-pointer mr-2 bg-white"
                  onClick={toggleComment}
                />
                <p className="text-black">{post.comments.length} Comments</p>
              </div>
              <FaShare size={24} className="text-blue-500 cursor-pointer" />
            </div>

            {/* Comment Box */}
            <Transition
              show={isCommentOpen}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4 text-black">
                  Comments
                </h2>
                <form onSubmit={handleCommentSubmit}>
                  <div className="flex mb-4">
                    <input
                      required
                      type="text"
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setCommentInput(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-l-md w-full focus:outline-none focus:ring focus:border-blue-300 text-black bg-white"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                    >
                      Comment
                    </button>
                  </div>
                </form>
                {/* Display Comments */}
                <div>
                  {commentsToDisplay.reverse().map((comment) => (
                    <div key={comment._id} className="flex items-start mb-6">
                      <div className="flex-shrink-0">
                        {comment.postedBy.image ? (
                          <img
                            src={comment.postedBy.image}
                            alt={comment.postedBy.name}
                            className="h-10 w-10 mr-4 rounded-full object-cover"
                          />
                        ) : (
                          <FaUserCircle className="h-10 w-10 mr-4" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <p className="text-black font-semibold mb-1">
                          {comment.postedBy.name}
                        </p>
                        <p className="text-gray-500 text-sm mb-1">
                          {moment(comment.createdAt).fromNow()}
                        </p>
                        <p className="text-gray-700">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
      <div className="h-20 md:h-0"></div>
    </div>
  );
};

export default PostDetail;
