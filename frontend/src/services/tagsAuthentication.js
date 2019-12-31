import axios from "axios"; //Will be used for http requests
import FormData from "form-data";
import { apiUrl } from "../config.json"; // Url of the server
import * as user from "./userAuthentication";
const apiEndpoint = apiUrl + "/tag";

export function newTag(name) {
  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: user.getCurrentUser(true)
    };
    return axios.post(
      apiEndpoint + "/new",
      { name },
      {
        headers: headers
      }
    );
  } catch (ex) {
    return null;
  }
}

export function getTags() {
  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: user.getCurrentUser(true)
    };
    return axios.get(apiEndpoint + "/getall", {
      headers: headers
    });
  } catch (ex) {
    return null;
  }
}

export function deleteTag(id) {
  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: user.getCurrentUser(true)
    };
    return axios.delete(apiEndpoint + "/" + id, {
      headers: headers
    });
  } catch (ex) {
    return null;
  }
}

export function commentOnTag(id, text, sev, img) {
  var payload = new FormData();
  payload.append("text", text);
  payload.append("sev", sev);
  if (img) payload.append("img", img);
  try {
    const headers = {
      "Content-Type": "multipart/form-data"
    };
    return axios.post(apiEndpoint + "/comment/" + id, payload, {
      headers: headers
    });
  } catch (ex) {
    return null;
  }
}
