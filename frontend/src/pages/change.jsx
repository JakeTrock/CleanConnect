import React from "react";
import { Redirect } from "react-router-dom";

import Joi from "joi-browser";

import Form from "../components/form"; //allows you to render Input, initalizing login form as a form
import Layout from "../components/layout";
import * as auth from "../services/authentication";

class Change extends Form {
  state = {
    //data stored in the form
    data: { email: "", name: "", password: "", password2: "" },
    errors: {},
    verified: true
  };
  schema = {
    //using Joi for form creation and errors (change?)
    name: Joi.string().required(),
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string().required(),
    password2: Joi.string().required()
  };
  async componentDidMount() {
    const token = this.props.match.params.token;
    try {
      await auth.validateChange(token);
    } catch (ex) {
      this.setState({ verified: false });
    }
    // /isValid/token
    // /change/token
    //check if token is valid
  }
  render() {
    const errors = this.state.errors;
    console.log(this.state.verified);
    //if (this.state.verified === false) return <Redirect to="/" />;
    return (
      <Layout name="Change Account">
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
          {this.renderButton("Submit")}
        </form>
      </Layout>
    );
  }
}

export default Change;
