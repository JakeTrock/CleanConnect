import jwtDecode from "jwt-decode";
import axios from "axios"; //Will be used for http requests

import { apiUrl } from "../config.json"; // Url of the server
import "./interceptor";

const apiEndpoint = apiUrl + "/user";
const tokenKey = "token";

export async function login(email, password) {
  const { data: jwt } = await axios.post(apiEndpoint + "/login", {
    email,
    password
  });
  localStorage.setItem(tokenKey, jwt.token); //get expiration date
}

export async function register(name, email, password, password2) {
  await axios.post(apiEndpoint + "/register", {
    name,
    email,
    password,
    password2
  });
}

export function logout() {
  localStorage.removeItem(tokenKey);
}

export function getCurrentUser(noDecode) {
  //Session is stored in localhost
  try {
    const jwt = localStorage.getItem(tokenKey); //searches local storage for jwt key
    if (jwtDecode(jwt).exp * 1000 < Date.now()) {
      //if passed expiration, delete
      logout();
      return null;
    }
    if (noDecode) return jwt;
    else return jwtDecode(jwt);
  } catch (ex) {
    return null;
  }
}

export function changeInfo() {
  const headers = {
    "Content-Type": "application/json",
    Authorization: getCurrentUser(true)
  };
  return axios.post(apiEndpoint + "/changeinfo", "", {
    headers: headers
  });
}

export async function validateChange(token) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: getCurrentUser(true)
  };
  return axios.post(apiEndpoint + "/isValid/" + token, "", {
    headers: headers
  });
}

export async function completeChange(token, name, email, password, password2) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: getCurrentUser(true)
  };
  return axios.post(
    apiEndpoint + "/change/" + token,
    {
      name,
      email,
      password,
      password2
    },
    {
      headers: headers
    }
  );
}

export function deleteInfo() {
  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: getCurrentUser(true)
    };
    return axios.delete(apiEndpoint + "/deleteinfo", {
      headers: headers
    });
  } catch (ex) {
    return null;
  }
}

export default {
  login,
  getCurrentUser,
  logout,
  changeInfo,
  validateChange,
  completeChange,
  deleteInfo
};
