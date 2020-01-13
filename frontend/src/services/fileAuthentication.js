import axios from "axios"; //Will be used for http requests
import { apiUrl } from "../config.json"; // Url of the server
import * as user from "./userAuthentication";
const apiEndpoint = apiUrl + "/file"; //hide later

export function getImage(token) {
  try {
    return axios.get(apiEndpoint + "/img/" + token, { responseType: "blob" });
  } catch (ex) {
    return null;
  }
}
