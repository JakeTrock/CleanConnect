import React from "react";
import { Redirect } from "react-router-dom";

import Joi from "joi-browser";

import Form from "../components/form"; //allows you to render Input, initalizing login form as a form
import Layout from "../components/layout";
import Payment from "../components/payment";
import * as auth from "../services/userAuthentication";

class Register extends Form {
  state = {
    //data stored in the form
    data: {
      name: "",
      email: "",
      password: "",
      password2: "",
      tier: "",
      payment_method_nonce: ""
    },
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
      .min(6),
    tier: Joi.string().required(),
    payment_method_nonce: Joi.string().required()
  };
  tierConverter(tier) {
    if (tier.includes("0:")) return "0";
    if (tier.includes("1:")) return 1;
    else return 2;
  }
  doSubmit = async () => {
    try {
      const { data } = this.state;
      const tier = this.tierConverter(data.tier);
      await auth.register(
        data.name,
        data.email,
        data.password,
        data.password2,
        tier,
        data.payment_method_nonce
      );
      this.setState({ formCompleted: true }); //const { state } = this.props.location; //window.location = state ? state.from.pathname : "/login";
    } catch (ex) {
      if (ex.response && ex.response.status === 400) {
        const errors = { ...this.state.errors };
        errors.name = ex.response.data.details.name;
        errors.email = ex.response.data.details.email;
        errors.password = ex.response.data.details.password;
        errors.password2 = ex.response.data.details.password2;
        errors.tier = ex.response.data.details.tier;
        errors.payment_method_nonce =
          ex.response.data.details.payment_method_nonce;
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
          {this.renderInput({
            name: "name",
            label: "Name",
            error: errors.name
          })}
          {this.renderInput({
            name: "email",
            label: "Email",
            error: errors.email
          })}
          {this.renderInput({
            name: "password",
            label: "Password",
            error: errors.password,
            type: "password"
          })}
          {this.renderInput({
            name: "password2",
            label: "Confirm Password",
            error: errors.password2,
            type: "password"
          })}
          {this.renderSelect({
            name: "tier",
            label: "Select Payment Tier",
            options: [
              "Tier 0: (INSERT DESCRIPTION)",
              "Tier 1: (INSERT DESCRIPTION)",
              "Tier 2: (INSERT DESCRIPTION)"
            ],
            error: errors.tier
          })}
          {this.renderComponent({
            name: "payment_method_nonce",
            Component: Payment,
            error: errors.payment_method_nonce
          })}
          {this.renderButton("Register")}
        </form>
      </Layout>
    );
  }
}

export default Register;
