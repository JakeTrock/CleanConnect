import React from "react";
import { Redirect } from "react-router-dom";

import Joi from "joi-browser";

import Form from "../components/form"; //allows you to render Input, initalizing login form as a form
import Layout from "../components/layout";
import * as auth from "../services/authentication";

class Register extends Form {
  state = {
    //data stored in the form
    data: { name: "", email: "", password: "", password2: "" },
    errors: {},
    formCompleted: false
  };
  schema = {
    //using Joi for form creation and errors (change?)
    name: Joi.string().required(),
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string()
      .required()
      .min(6),
    password2: Joi.string()
      .required()
      .min(6)
  };
  doSubmit = async () => {
    try {
      const { data } = this.state;
      await auth.register(data.name, data.email, data.password, data.password2);
      this.setState({ formCompleted: true }); //const { state } = this.props.location; //window.location = state ? state.from.pathname : "/login";
    } catch (ex) {
      if (ex.response && ex.response.status === 400) {
        const errors = { ...this.state.errors };
        errors.name = ex.response.data.name;
        errors.email = ex.response.data.email;
        errors.password = ex.response.data.password;
        errors.password2 = ex.response.data.password2;
        this.setState({ errors });
      }
    }
  };
  render() {
    if (this.state.formCompleted === true) return <Redirect to="/login" />;
    const errors = this.state.errors;
    return (
      <Layout name="Register">
        <form onSubmit={this.handleSubmit}>
          {this.renderInput("name", "Name", errors.name)}
          {this.renderInput("email", "Email", errors.email)}
          {this.renderInput(
            "password",
            "Password",
            errors.password,
            "password"
          )}
          {this.renderInput(
            "password2",
            "Confirm Password",
            errors.password2,
            "password"
          )}
          {this.renderButton("Register")}
        </form>
      </Layout>
    );
  }
}

export default Register;
