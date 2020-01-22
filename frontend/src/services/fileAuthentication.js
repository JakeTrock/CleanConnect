import axios from "axios"; //Will be used for http requests
import { apiUrl } from "../config.json"; // Url of the server
const apiEndpoint = apiUrl + "/file"; //hide later

export function getImage(token) {
  try {
    return axios.get(apiEndpoint + "/img/" + token, { responseType: "blob" });
  } catch (ex) {
    return null;
  }
}
export function getPdf(url) {
  try {
    return axios.get(apiEndpoint + "/pdf/" + url, { responseType: "blob" });
  } catch (ex) {
    return null;
  }
}
