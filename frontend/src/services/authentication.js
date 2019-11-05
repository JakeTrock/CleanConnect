import jwtDecode from "jwt-decode";
import http from "./httpService"; //Will be used for http requests
import { apiUrl } from "../config.json"; // Url of the server

const apiEndpoint = apiUrl + "/user";
const tokenKey = "token";

http.setJwt(getJwt());

export async function login(email, password) {
  //const { data: jwt } = await http.post(apiEndpoint+"/login", { email, password });
  //localStorage.setItem(tokenKey, jwt);
}

export function getJwt() { //Session is stored in localhost
  return localStorage.getItem(tokenKey);
}

