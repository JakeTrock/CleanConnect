import React from "react";
import { Redirect } from "react-router-dom";

import Joi from "joi-browser";

import Form from "../components/form";
import Layout from "../components/layout";
import * as auth from "../services/userAuthentication";

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
    password: Joi.string()
      .required()
      .min(6),
    password2: Joi.string()
      .required()
      .min(6)
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
  doSubmit = async () => {
    try {
      const token = this.props.match.params.token;
      const { data } = this.state;
      await auth.completeChange(
        token,
        data.name,
        data.email,
        data.password,
        data.password2
      );
      const { state } = this.props.location;
      window.location = state ? state.from.pathname : "/";
    } catch (ex) {
      if (ex.response) {
        const errors = { ...this.state.errors };
        if (ex.response.status === 400) {
          errors.email = ex.response.data.email;
          errors.name = ex.response.data.name;
          errors.password = ex.response.data.password;
          errors.password2 = ex.response.data.password2;
        }
        this.setState({ errors });
      }
    }
  };
  render() {
    const errors = this.state.errors;
    if (this.state.verified === false) return <Redirect to="/" />;
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
