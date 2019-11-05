import jwtDecode from "jwt-decode";
import axios from "axios"; //Will be used for http requests
import { apiUrl } from "../config.json"; // Url of the server

const apiEndpoint = apiUrl + "/user";
const tokenKey = "token";
axios.defaults.headers.common["x-auth-token"] = getJwt();

export async function login(email, password) {
  const { data: jwt } = await axios.post(apiEndpoint+"/login", { email, password });
  console.log(jwt)
  localStorage.setItem(tokenKey, jwt);
}

export function getJwt() { //Session is stored in localhost
  return localStorage.getItem(tokenKey);
}

