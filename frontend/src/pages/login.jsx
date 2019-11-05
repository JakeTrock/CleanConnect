import React, {Component} from 'react';
import { Redirect } from "react-router-dom";
import Joi from "joi-browser";
import Form from "../components/form";
import * as auth from "../services/authentication";

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
  doSubmit = async () => {
    try {
      const { data } = this.state;
      await auth.login(data.username, data.password);
      const { state } = this.props.location;
      window.location = state ? state.from.pathname : "/";
    } 
    catch (ex) {
      if (ex.response && ex.response.status === 400) {
        const errors = { ...this.state.errors };
        errors.username = ex.response.data;
        this.setState({ errors });
      }
    }
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