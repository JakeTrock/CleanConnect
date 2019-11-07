import jwtDecode from "jwt-decode";
import axios from "axios"; //Will be used for http requests
import { apiUrl } from "../config.json"; // Url of the server

const apiEndpoint = apiUrl + "/user";
const tokenKey = "token";

axios.defaults.headers.common["x-auth-token"] = getJwt();

export async function login(email, password) {
  const { data: jwt } = await axios.post(apiEndpoint+"/login", { email, password });
  localStorage.setItem(tokenKey, jwt.token); //get expiration date 
}

export function getJwt() { //Session is stored in localhost
  const jwt=localStorage.getItem(tokenKey);
  if(jwtDecode(jwt).exp*1000<Date.now()){
    console.log("This will need to be dealt with soon")
    //localStorage.removeItem(tokenKey)
    return null
  }
  return localStorage.getItem(tokenKey);
}

export function getCurrentUser() {
  try {
    const jwt = localStorage.getItem(tokenKey);
    return jwtDecode(jwt);
  } catch (ex) {
    return null;
  }
}

export default {
  login,
  getCurrentUser,
  getJwt
};
