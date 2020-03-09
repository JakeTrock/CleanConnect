import axios from "axios"; //Will be used for http requests
import FormData from "form-data";
import { apiUrl } from "../config.json"; // Url of the server
import * as user from "./userAuthentication";
const tagEndpoint = process.env.REACT_APP_API_URL + "/tag";
const commentEndpoint = process.env.REACT_APP_API_URL + "/comment";
export function newTag(name) {
  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: user.getCurrentUser(true)
    };
    return axios.post(
      tagEndpoint + "/new",
      { name },
      {
        headers: headers
      }
    );
  } catch (ex) {
    return null;
  }
}
/*
export function genCache() {
  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: user.getCurrentUser(true)
    };
    return axios.get(tagEndpoint + "/genimgs", {
      headers: headers
    });
  } catch (ex) {
    return null;
  }
}*/
export function getTags(showDead) {
  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: user.getCurrentUser(true)
    };
    return axios.post(
      tagEndpoint + "/getall",
      { showDead },
      {
        headers: headers
      }
    );
  } catch (ex) {
    return null;
  }
}
export function getTag(token) {
  try {
    const headers = {
      "Content-Type": "application/json"
    };
    return axios.get(tagEndpoint + "/getone/" + token, {
      headers: headers
    });
  } catch (ex) {
    return null;
  }
}

export function tagExists(token) {
  try {
    return axios.get(tagEndpoint + "/exists/" + token);
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
    return axios.delete(tagEndpoint + "/delete/" + id, {
      headers: headers
    });
  } catch (ex) {
    return null;
  }
}
export function readdTag(id) {
  console.log(user.getCurrentUser(true));
  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: user.getCurrentUser(true)
    };
    return axios.post(tagEndpoint + "/restore/" + id, "", {
      headers: headers
    });
  } catch (ex) {
    return null;
  }
}
export function deleteComment(postId, commentId) {
  try {
    const headers = {
      "Content-Type": "application/json"
    };
    return axios.delete(
      commentEndpoint + "/delete/" + postId + "/" + commentId,
      {
        headers: headers
      }
    );
  } catch (ex) {
    return null;
  }
}
export function readdComment(postId, commentId) {
  try {
    const headers = {
      "Content-Type": "application/json"
    };
    return axios.post(
      commentEndpoint + "/restore/" + postId + "/" + commentId,
      {
        headers: headers
      }
    );
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
    return axios.post(commentEndpoint + "/new/" + id, payload, {
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

    return axios.post(tagEndpoint + "/print", { printIteration }, { headers });
  } catch (ex) {
    return null;
  }
}
export function anonTags(token, showDead) {
  try {
    const headers = {
      "Content-Type": "application/json"
    };
    return axios.get(tagEndpoint + "/dash/" + token, showDead, {
      headers: headers
    });
  } catch (ex) {
    return null;
  }
}
