import jwtDecode from "jwt-decode";
import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpoint = apiUrl + "/user";
const tokenKey = "token";

http.setJwt(getJwt());

export async function login(email, password) {
  //const { data: jwt } = await http.post(apiEndpoint+"/login", { email, password });
  //localStorage.setItem(tokenKey, jwt);
}

export function getJwt() {
  return localStorage.getItem(tokenKey);
}

