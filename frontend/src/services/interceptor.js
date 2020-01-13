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
    console.log(error.response);
    if (error.response && error.response.data && error.response.data.simple)
      toast.error(error.response.data.simple, { autoClose: 2500 });
    else toast.error("An unexpected error has occurred.", { autoClose: 2500 });
    return Promise.reject(error);
  }
);
