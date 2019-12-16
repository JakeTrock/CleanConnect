import { Component } from "react";
import * as auth from "../services/userAuthentication";

class Logout extends Component {
  componentDidMount() {
    auth.logout(); //simply logs out user and returns to home page
    window.location = "/"; //can change if need be
  }
  render() {
    return null;
  }
}

export default Logout;
