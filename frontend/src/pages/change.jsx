import React from "react";
import { Redirect } from "react-router-dom";

import Joi from "joi-browser";

import Form from "../components/form";
import Layout from "../components/layout";
import Payment from "../components/payment";
import * as auth from "../services/userAuthentication";

class Change extends Form {
  state = {
    //data stored in the form
    data: {
      email: "",
      name: "",
      password: "",
      password2: "",
      tier: "",
      payment_method_nonce: ""
    },
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
      .min(6),
    tier: Joi.string().required(),
    payment_method_nonce: Joi.string().required()
  };
  tierConverter(tier) {
    if (tier.includes("0:")) return 0;
    if (tier.includes("1:")) return 1;
    else return 2;
  }
  reverseTierConverter(tier) {
    if (tier === 0) return "Tier 0: (INSERT DESCRIPTION)";
    if (tier === 1) return "Tier 1: (INSERT DESCRIPTION)";
    if (tier === 2) return "Tier 2: (INSERT DESCRIPTION)";
  }
  async componentDidMount() {
    const token = this.props.match.params.token;
    try {
      await auth.validateChange(token);
    } catch (ex) {
      this.setState({ verified: false });
    }
    const user = this.props.user;
    this.setState({ user });
    let data = this.state.data;
    data["name"] = user.name;
    data["email"] = user.email;
    data["tier"] = this.reverseTierConverter(user.tier);
    this.setState({ data });
    // /isValid/token
    // /change/token
    //check if token is valid
  }
  doSubmit = async () => {
    try {
      const token = this.props.match.params.token;
      const { data } = this.state;
      const tier = this.tierConverter(data.tier);
      await auth.completeChange(
        token,
        data.name,
        data.email,
        data.password,
        data.password2,
        tier,
        data.payment_method_nonce
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
          errors.tier = ex.response.data.details.tier;
          errors.payment_method_nonce =
            ex.response.data.details.payment_method_nonce;
        }
        this.setState({ errors });
      }
    }
  };
  render() {
    const { errors, user } = this.state;
    if (this.state.verified === false) return <Redirect to="/" />;
    if (!user) return <h1>Loading...</h1>;
    return (
      <Layout name="Change Account">
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
            props: user,
            error: errors.payment_method_nonce
          })}
          {this.renderButton("Submit")}
        </form>
      </Layout>
    );
  }
}

export default Change;
