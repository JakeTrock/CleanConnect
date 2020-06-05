import axios from "axios"; //Will be used for http requests
import FormData from "form-data";
import * as user from "./userAuthentication";
const tagEndpoint = process.env.REACT_APP_API_URL + "/tag";
const commentEndpoint = process.env.REACT_APP_API_URL + "/comment";
const dashEndpoint = process.env.REACT_APP_API_URL + "/dash";
const headers = {
  "Content-Type": "application/json",
  Authorization: user.getCurrentUser(true),
};

export function newTag(name) {
  try {
    return axios.post(
      tagEndpoint + "/new",
      { name },
      {
        headers: headers,
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
    return axios.post(
      tagEndpoint + "/getall",
      { showDead },
      {
        headers: headers,
      }
    );
  } catch (ex) {
    return null;
  }
}
export function getTag(token) {
  try {
    /*const headers = {
      "Content-Type": "application/json",
    };*/
    return axios.get(tagEndpoint + "/getone/" + token, {
      headers: headers,
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
    return axios.delete(tagEndpoint + "/delete/" + id, {
      headers: headers,
    });
  } catch (ex) {
    return null;
  }
}
export function readdTag(id) {
  try {
    return axios.post(tagEndpoint + "/restore/" + id, "", {
      headers: headers,
    });
  } catch (ex) {
    return null;
  }
}
export function deleteComment(postId, commentId) {
  try {
    /*const headers = {
      "Content-Type": "application/json",
    };*/
    return axios.delete(
      commentEndpoint + "/delete/" + postId + "/" + commentId,
      {
        headers: headers,
      }
    );
  } catch (ex) {
    return null;
  }
}
export function readdComment(postId, commentId) {
  try {
    /*const headers = {
      "Content-Type": "application/json",
    };*/
    return axios.post(
      commentEndpoint + "/restore/" + postId + "/" + commentId,
      {
        headers: headers,
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
    const multiHeaders = {
      "Content-Type": "multipart/form-data",
    };
    return axios.post(commentEndpoint + "/new/" + id, payload, {
      headers: multiHeaders,
    });
  } catch (ex) {
    return null;
  }
}
export function print(printIteration) {
  try {
    const data = { printIteration };

    return axios.post(tagEndpoint + "/print", { printIteration }, { headers });
  } catch (ex) {
    return null;
  }
}
export function anonTags(token, showDead) {
  try {
    /*const headers = {
      "Content-Type": "application/json",
    };*/
    return axios.get(
      dashEndpoint + "/" + token,
      { showDead },
      {
        headers: headers,
      }
    );
  } catch (ex) {
    return null;
  }
}
