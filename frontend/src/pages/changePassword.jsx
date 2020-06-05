import React from "react";
import { Redirect } from "react-router-dom";

import Joi from "joi-browser";

import Form from "../components/form";
import Layout from "../components/layout";
import * as auth from "../services/userAuthentication";
import { phoneConverter, reversePhoneConverter } from "../converters/account";
class Change extends Form {
  state = {
    //data stored in the form
    data: {
      email: "",
      phoneNum: "",
      password: "",
      password2: "",
    },
    errors: {},
    verified: true,
  };
  schema = {
    //using Joi for form creation and errors (change?)
    email: Joi.string().required(),
    phoneNum: Joi.string()
      .length(10)
      .regex(/^\d+$/)
      .error(() => {
        return {
          message:
            "Needs to be a valid phone number 10 digits long. (Just the numbers)",
        };
      }),
    password: Joi.string().required().min(6),
    password2: Joi.string().required().min(6),
  };
  async componentDidMount() {
    const token = this.props.match.params.token;
    try {
      await auth.anonIsValid(token);
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
      let { data } = this.state;
      data.phoneNum = phoneConverter(data.phoneNum);
      await auth.forgotPassword(data, token);

      this.setState({ verified: false });
    } catch (ex) {
      let { data } = this.state;
      data.phoneNum = reversePhoneConverter(data.phoneNum);
      this.setState({ data: data });
      if (ex.response) {
        const errors = { ...this.state.errors };
        if (ex.response.status === 400) {
          errors.email = ex.response.data.email;
          errors.phoneNum = ex.response.data.phoneNum;
          errors.password = ex.response.data.password;
          errors.password2 = ex.response.data.password2;
        }
        this.setState({ errors });
      }
    }
  };
  render() {
    const { errors } = this.state;
    if (this.state.verified === false) return <Redirect to="/" />;
    return (
      <Layout name="Change Password">
        <form onSubmit={this.handleSubmit}>
          {this.renderInput({
            name: "email",
            label: "Email",
            error: errors.email,
          })}
          {this.renderInput({
            name: "phoneNum",
            label: "Phone Number",
            error: errors.phoneNum,
          })}
          {this.renderInput({
            name: "password",
            label: "Password",
            error: errors.password,
            type: "password",
          })}
          {this.renderInput({
            name: "password2",
            label: "Confirm Password",
            error: errors.password2,
            type: "password",
          })}
          {this.renderButton({ label: "Submit" })}
        </form>
      </Layout>
    );
  }
}

export default Change;
