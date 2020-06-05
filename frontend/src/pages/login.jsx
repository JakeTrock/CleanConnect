import React from "react";

import Joi from "joi-browser";

import Form from "../components/form"; //allows you to render Input, initalizing login form as a form
import Layout from "../components/layout";
import * as auth from "../services/userAuthentication";

class Login extends Form {
  state = {
    //data stored in the form
    data: { email: "", password: "" },
    errors: {},
  };
  schema = {
    email: Joi.string().required().label("Email"),
    password: Joi.string().required().label("Password").min(6),
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
          errors.email = ex.response.data.details.email;
          errors.password = ex.response.data.details.password;
        }
        if (ex.response.status === 401) {
          errors.email = ex.response.data.details.msg;
        }
        this.setState({ errors });
      }
    }
  };
  render() {
    const { errors, data } = this.state;
    const email = data.email;
    return (
      <Layout name="Login">
        <form onSubmit={this.handleSubmit}>
          {this.renderInput({
            name: "email",
            label: "Email",
            error: errors.email,
          })}
          {this.renderInput({
            name: "password",
            label: "Password",
            error: errors.password,
            type: "password",
          })}
          {this.renderButton({ label: "Login" })}
          {email &&
            this.renderPopup({
              parameters: { email: email },
              triggerText: "Forgot password?",
              customText: `This will send a verification email to ${email}. Proceed?`,
              callback: auth.forgotPassword,
            })}
        </form>
      </Layout>
    );
  }
}

export default Login;
