import axios from "axios"; //Will be used for http requests
const apiEndpoint = process.env.REACT_APP_API_URL + "/file"; //hide later

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
