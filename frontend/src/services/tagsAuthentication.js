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
export function genCache() {
  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: user.getCurrentUser(true)
    };
    return axios.get(apiEndpoint + "/genimgs", {
      headers: headers
    });
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
export function getTag(token) {
  try {
    const headers = {
      "Content-Type": "application/json"
    };
    return axios.get(apiEndpoint + "/getone/" + token, {
      headers: headers
    });
  } catch (ex) {
    return null;
  }
}

export function tagExists(token) {
  try {
    return axios.get(apiEndpoint + "/exists/" + token);
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
export function deleteComment(postId, commentId) {
  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: user.getCurrentUser(true)
    };
    return axios.delete(apiEndpoint + "/comment/" + postId + "/" + commentId, {
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

export function print(printIteration) {
  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: user.getCurrentUser(true)
    };
    const data = { printIteration };
    console.log(data);

    return axios.post(apiEndpoint + "/print", { printIteration }, { headers });
  } catch (ex) {
    return null;
  }
}
