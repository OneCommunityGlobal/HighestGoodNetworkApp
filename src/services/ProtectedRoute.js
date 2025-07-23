import React, { useState, useEffect } from "react";
import { Route, Redirect } from "react-router-dom";
import * as loginHelpers from "../components/helpers/loginHelpers.jsx";
import { toast } from "react-toastify";

/**
 * A wrapper for <Route> that redirects to the home page if the user isn't authenticated.
 * @param {Object} props - Component props
 * @param {React.Component} props.component - The component to render if authenticated
 * @returns {JSX.Element} Protected route component
 */
const ProtectedRoute = ({ component: Component, ...rest }) => {
  const [authStatus, setAuthStatus] = useState({
    isChecking: true,
    isAuthenticated: false
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await loginHelpers.getFacebookAuthStatus();
        console.log("Auth status:", response);

        const isAuthenticated = 
          response.status === "success" && 
          response.data?.status === "connected";

        setAuthStatus({
          isChecking: false,
          isAuthenticated
        });

      } catch (error) {
        console.error("Error checking authentication:", error);
        setAuthStatus({
          isChecking: false,
          isAuthenticated: false
        });
      }
    };

    checkAuth();
  }, []);

  return (
    <Route
      {...rest}
      render={props => {
        if (authStatus.isChecking) {
          return <div className="loading-auth">Checking authentication...</div>;
        }

        if (authStatus.isAuthenticated) {
          return <Component {...props} />;
        }

        toast.error("Please connect with Facebook to access this page");
        return (
          <Redirect
            to={{
              pathname: "/",
              state: { from: props.location, authRequired: true }
            }}
          />
        );
      }}
    />
  );
};

export default ProtectedRoute;