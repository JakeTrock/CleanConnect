import React, {Component} from 'react';
import { Redirect } from "react-router-dom";
import Joi from "joi-browser";
import Form from "../components/form"; //allows you to render Input, initalizing login form as a form
import * as auth from "../services/authentication";

class Login extends Form {
  state = {  //data stored in the form
    data: { email: "", password: "" },
    errors: {}
  }
  schema = { //using Joi for form creation and errors (change?)
    email: Joi.string()
      .required()
      .label("Email"),
    password: Joi.string()
      .required()
      .label("Password")
  };
  doSubmit = async () => {
    try {
      const { data } = this.state;
      await auth.login(data.email, data.password);
      //const { state } = this.props.location;
      //window.location = state ? state.from.pathname : "/";
    } 
    catch (ex) {
      if (ex.response && ex.response.status === 400) {
        const errors = { ...this.state.errors };
        errors.email = ex.response.data;
        this.setState({ errors });
      }
    }
  };
  render() { 
    return ( 
      <div>
        <h1>Login</h1>
        <form onSubmit={this.handleSubmit}>
          {this.renderInput("email")}
          {this.renderInput("password", "password")}
          {this.renderButton("Login")}
        </form>
      </div>
     );
  }
}
 
export default Login;