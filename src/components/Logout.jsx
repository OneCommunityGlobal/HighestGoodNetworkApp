import React from "react";
import { Redirect } from "react-router-dom";

// to do : remove hard coded string
export const Logout = () => {
  localStorage.removeItem("token");
  return <Redirect to="/login" auth={false} />;
};
