import axios from "axios"; //Will be used for h
import { toast } from "react-toastify";

axios.interceptors.response.use(
  function(response) {
    //console.clear();
    console.log(response);
    if (response.data.status && response.data)
      toast.success(response.data.status);
    return response;
  },
  function(error) {
    //console.clear();
    toast.error(error.response.statusText, { autoClose: 2500 });
    return Promise.reject(error);
  }
);
