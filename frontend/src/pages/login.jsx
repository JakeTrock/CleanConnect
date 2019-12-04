import React from "react";

import Joi from "joi-browser";

import Form from "../components/form"; //allows you to render Input, initalizing login form as a form
import Layout from "../components/layout";
import * as auth from "../services/authentication";

class Login extends Form {
  state = {
    //data stored in the form
    data: { email: "", password: "" },
    errors: {}
  };
  schema = {
    //using Joi for form creation and errors (change?)
    email: Joi.string()
      .required()
      .label("Email"),
    password: Joi.string()
      .required()
      .label("Password")
      .min(6)
  };
  doSubmit = async () => {
    try {
      const { data } = this.state;
      await auth.login(data.email, data.password);
      const { state } = this.props.location;
      window.location = state ? state.from.pathname : "/";
    } catch (ex) {
      if (ex.response) {
        const errors = { ...this.state.errors };
        if (ex.response.status === 400) {
          errors.email = ex.response.data.email;
          errors.password = ex.response.data.password;
        }
        if (ex.response.status === 401) {
          errors.email = ex.response.data.msg;
        }
        this.setState({ errors });
      }
    }
  };
  render() {
    const errors = this.state.errors;
    return (
      <Layout name="Login">
        <form onSubmit={this.handleSubmit}>
          {this.renderInput("email", "Email", errors.email)}
          {this.renderInput(
            "password",
            "Password",
            errors.password,
            "password"
          )}
          {this.renderButton("Login")}
        </form>
      </Layout>
    );
  }
}

export default Login;
