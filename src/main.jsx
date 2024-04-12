import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { createContext } from "react";
import firebase from "firebase/compat/app";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC0t5DcGer22QtbEFq9R6dZIx5VbVkf0Es",
  authDomain: "devfinds-ravi8130.firebaseapp.com",
  projectId: "devfinds-ravi8130",
  storageBucket: "devfinds-ravi8130.appspot.com",
  messagingSenderId: "543732814564",
  appId: "1:543732814564:web:c4350eb59325fff2aed2f1",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const server =import.meta.env.SERVER || "http://localhost:4000/api/v1/";

export const Context = createContext({ isAuthenticated: false });

const Appwraper = () => {
  const [isAuthenticated, setAuth] = useState(false);
  const [loader, setLoader] = useState(false);
  const [user, setUser] = useState({});
  const [fetch, setfetch] = useState(false);
  return (
    <Context.Provider
      value={{
        isAuthenticated,
        setAuth,
        loader,
        setLoader,
        user,
        setUser,
        fetch,
        setfetch,
      }}
    >
      <App />
    </Context.Provider>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Appwraper />
  </React.StrictMode>
);
