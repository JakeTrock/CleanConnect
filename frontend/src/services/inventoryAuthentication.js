import axios from "axios";
import * as user from "./userAuthentication";

const inventoryEndpoint = process.env.REACT_APP_API_URL + "/inventory";
const dashEndpoint = process.env.REACT_APP_API_URL + "/dash";
const headers = {
  "Content-Type": "application/json",
  Authorization: user.getCurrentUser(true),
};
export function getAllInventories(showDead) {
  try {
    return axios.post(
      inventoryEndpoint + "/getall",
      { showDead },
      {
        headers: headers,
      }
    );
  } catch (ex) {
    return null;
  }
}
export function getOneInventory(id) {
  try {
    return axios.post(inventoryEndpoint + "/getone/" + id, {
      headers: headers,
    });
  } catch (ex) {
    return null;
  }
}
export function newInventory(name) {
  return axios.post(
    inventoryEndpoint + "/new",
    { name },
    {
      headers: headers,
    }
  );
}

export function editInventory(name, token) {
  return axios.post(
    inventoryEndpoint + "/edit/" + token,
    { name },
    {
      headers: headers,
    }
  );
}

export function deleteInventory(token) {
  return axios.delete(inventoryEndpoint + "/delete/" + token, {
    headers: headers,
  });
}
export function getAnonInventories(token, showDead) {
  try {
    const headers = {
      "Content-Type": "application/json",
    };
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

export function newItem(data, id) {
  const { name, maxQuant, minQuant, curQuant } = data;
  return axios.post(inventoryEndpoint + "/newItem/" + id, {
    name,
    maxQuant,
    minQuant,
    curQuant,
  });
}

export function updateItem(itemId, id, newVal) {
  return axios.post(inventoryEndpoint + "/updItemQuant/" + id + "/" + itemId, {
    newVal,
  });
}

export function updateItemDetails(itemId, id, name, maxQuant, minQuant) {
  return axios.post(inventoryEndpoint + "/changeItem/" + id + "/" + itemId, {
    name,
    maxQuant,
    minQuant,
  });
}

export function deleteItem(itemId, id) {
  return axios.delete(inventoryEndpoint + "/delItem/" + id + "/" + itemId);
}

export function restoreItem(itemId, id) {
  return axios.post(inventoryEndpoint + "/restore/" + id + "/" + itemId);
}
