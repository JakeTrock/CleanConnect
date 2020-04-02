import jwtDecode from "jwt-decode";
import axios from "axios"; //Will be used for http requests

import "./interceptor";

const apiEndpoint = process.env.REACT_APP_API_URL + "/user";
const tokenKey = "token";

export async function login(email, password) {
  const { data: jwt } = await axios.post(apiEndpoint + "/login", {
    email,
    password
  });
  localStorage.setItem(tokenKey, jwt.token); //get expiration date
}

export async function register(
  name,
  email,
  password,
  password2,
  tier,
  payment_method_nonce
) {
  await axios.post(apiEndpoint + "/register", {
    name,
    email,
    password,
    password2,
    tier,
    payment_method_nonce
  });
}

export function logout() {
  localStorage.removeItem(tokenKey);
}

export function getCurrentUser(noDecode) {
  //Session is stored in localhost, getting session off of that
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
  //confirming user wants to change account
  const headers = {
    "Content-Type": "application/json",
    Authorization: getCurrentUser(true)
  };
  return axios.post(apiEndpoint + "/changeinfo", "", {
    headers: headers
  });
}

export async function validateChange(token) {
  //validating change form
  const headers = {
    "Content-Type": "application/json",
    Authorization: getCurrentUser(true)
  };
  return axios.post(apiEndpoint + "/isValid/" + token, "", {
    headers: headers
  });
}

export async function completeChange(token, name, email, password, password2) {
  //submitting change form
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
  //initial step of deleting account
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
export function anonTags(token) {
  //showDead
  try {
    const headers = {
      "Content-Type": "application/json"
    };
    return axios.get(apiEndpoint + "/dash/" + token, "", {
      headers: headers
    });
  } catch (ex) {
    return null;
  }
}
export function getClientToken() {
  //getting token for payment system
  try {
    return axios.get(apiEndpoint + "/getClientToken/");
  } catch (ex) {
    return null;
  }
}
export function getAuthClientToken() {
  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: getCurrentUser(true)
    };
    return axios.get(apiEndpoint + "/getAuthClientToken/", {
      headers: headers
    });
  } catch (ex) {
    return null;
  }
}

export function confirm(token) {
  //confirming change (edit account, delete account, etc.)
  try {
    return axios.get(apiEndpoint + "/confirmation/" + token);
  } catch (ex) {
    return null;
  }
}
