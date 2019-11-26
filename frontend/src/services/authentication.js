import jwtDecode from "jwt-decode";
import axios from "axios"; //Will be used for http requests
import { toast } from "react-toastify";

import { apiUrl } from "../config.json"; // Url of the server

const apiEndpoint = apiUrl + "/user";
const tokenKey = "token";

axios.interceptors.response.use(
  function(response) {
    console.clear();
    if (response.data.status && response.data)
      toast.success(response.data.status);
    return response;
  },
  function(error) {
    console.clear();
    toast.error(error.response.statusText, { autoClose: 2500 });
    return Promise.reject(error);
  }
);
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

export default {
  login,
  getCurrentUser,
  logout
};
