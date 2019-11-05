import React, {Component} from 'react';
import { Redirect } from "react-router-dom";
import Joi from "joi-browser";
import Form from "../components/form";

class Login extends Form {
  state = { 
    data: { email: "", password: "" },
    errors: {}
  }
  schema = {
    email: Joi.string()
      .required()
      .label("Username"),
    password: Joi.string()
      .required()
      .label("Password")
  };
  render() { 
    return ( 
      <div>
        <h1>Login</h1>
        <form onSubmit={this.handleSubmit}>
          {this.renderInput("username")}
          {this.renderInput("password", "password")}
          <button className="btn btn-primary">Login</button>
        </form>
      </div>
     );
  }
}
 
export default Login;