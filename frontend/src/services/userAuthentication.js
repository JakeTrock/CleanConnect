import jwtDecode from "jwt-decode";
import axios from "axios"; //Will be used for http requests

import "./interceptor";

const apiEndpoint = process.env.REACT_APP_API_URL + "/user";
const tokenKey = "token";
const headers = {
  "Content-Type": "application/json",
  Authorization: getCurrentUser(true),
};
export async function login(email, password) {
  const { data: jwt } = await axios.post(apiEndpoint + "/login", {
    email,
    password,
  });
  localStorage.setItem(tokenKey, jwt.token); //get expiration date
}

export async function register(
  name,
  email,
  password,
  password2,
  tier,
  payment_method_nonce,
  phone
) {
  await axios.post(apiEndpoint + "/register", {
    name,
    email,
    password,
    password2,
    tier,
    payment_method_nonce,
    phone,
  });
}

export function logout() {
  localStorage.removeItem(tokenKey);
  window.location.reload(true);
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
  return axios.post(apiEndpoint + "/changeinfo", "", {
    headers: headers,
  });
}

export async function validateChange(token) {
  //validating change form
  const headers = {
    "Content-Type": "application/json",
    Authorization: getCurrentUser(true),
  };
  return axios.post(apiEndpoint + "/isValid/" + token, "", {
    headers: headers,
  });
}
export async function anonIsValid(token) {
  return axios.post(apiEndpoint + "/anonIsValid/" + token);
}

export async function completeChange(
  token,
  name,
  email,
  phone,
  tier,
  payNonce
) {
  //submitting change form
  return axios.post(
    apiEndpoint + "/change/" + token,
    {
      name,
      email,
      phone,
      payNonce,
      tier,
    },
    {
      headers: headers,
    }
  );
}

export function deleteInfo() {
  //initial step of deleting account
  try {
    return axios.delete(apiEndpoint + "/deleteinfo", {
      headers: headers,
    });
  } catch (ex) {
    return null;
  }
}
/*export function anonTags(token) {
  //showDead
  try {
    const headers = {
      "Content-Type": "application/json",
    };
    return axios.get(apiEndpoint + "/dash/" + token, "", {
      headers: headers,
    });
  } catch (ex) {
    return null;
  }
}*/
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
    return axios.get(apiEndpoint + "/getAuthClientToken/", {
      headers: headers,
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

export function forgotPassword(parameters, token) {
  const email = parameters.email;
  if (token) {
    const password1 = parameters.password;
    const { phone, password2 } = parameters;
    return axios.post(apiEndpoint + "/resetPass/" + token, {
      email,
      phone,
      password1,
      password2,
    });
  } else {
    return axios.post(apiEndpoint + "/resetPass/", { email });
  }
}
