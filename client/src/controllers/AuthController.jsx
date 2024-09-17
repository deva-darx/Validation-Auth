import axios from "axios";
import { Navigate } from "react-router-dom";

export const signup = async (data) => {
  try {
    const res = await axios.post("http://localhost:5000/signup", data, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    throw error.response.data.message;
  }
};

export const login = async (data) => {
  try {
    const res = await axios.post("http://localhost:5000/login", data);
    return res.data.message;
  } catch (error) {
    throw error.response.data.message;
  }
};

export const getDashboard = async () => {
  try {
    return "Welcome to your dashboard!";
  } catch (error) {
    throw "Error fetching dashboard data";
  }
};

export const logout = async () => {
  try {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    Navigate("/login");
  } catch (error) {
    throw "Error logging out";
  }
};
