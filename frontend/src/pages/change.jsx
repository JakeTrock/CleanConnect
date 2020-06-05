import React from "react";
import { Redirect } from "react-router-dom";

import Joi from "joi-browser";

import Form from "../components/form";
import Layout from "../components/layout";
import Payment from "../components/payment";
import * as auth from "../services/userAuthentication";
import {
  phoneConverter,
  reversePhoneConverter,
  tierConverter,
  reverseTierConverter,
} from "../converters/account";

class Change extends Form {
  state = {
    //data stored in the form
    data: {
      email: "",
      name: "",
      phone: "",
      tier: "",
      payment_method_nonce: "",
    },
    errors: {},
    verified: true,
  };
  schema = {
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string()
      .length(10)
      .regex(/^\d+$/)
      .error(() => {
        return {
          message:
            "Needs to be a valid phone number 10 digits long. (Just the numbers)",
        };
      }),
    tier: Joi.string().required(),
    payment_method_nonce: Joi.string().required(),
  };

  async componentDidMount() {
    const token = this.props.match.params.token;
    try {
      await auth.validateChange(token);
    } catch (ex) {
      this.setState({ verified: false });
    }
    const user = this.props.user;
    this.setState({ user });
    console.log(user);
    let data = this.state.data;
    data["name"] = user.name;
    data["email"] = user.email;
    //data["phone"] = reversePhoneConverter(user.phone);
    data["tier"] = reverseTierConverter(user.tier);
    this.setState({ data });
    // /isValid/token
    // /change/token
    //check if token is valid
  }
  doSubmit = async () => {
    try {
      const token = this.props.match.params.token;
      const { data } = this.state;
      const tier = tierConverter(data.tier);
      const phone = phoneConverter(data.phone);
      await auth.completeChange(
        token,
        data.name,
        data.email,
        phone,
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
          errors.phone = ex.response.data.phone;
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
            error: errors.name,
          })}
          {this.renderInput({
            name: "email",
            label: "Email",
            error: errors.email,
          })}
          {this.renderInput({
            name: "phone",
            label: "Phone Number",
            error: errors.phone,
          })}
          {this.renderSelect({
            name: "tier",
            label: "Select Payment Tier",
            options: [
              "Tier 0: (INSERT DESCRIPTION)",
              "Tier 1: (INSERT DESCRIPTION)",
              "Tier 2: (INSERT DESCRIPTION)",
            ],
            error: errors.tier,
          })}
          {this.renderComponent({
            name: "payment_method_nonce",
            Component: Payment,
            props: user,
            error: errors.payment_method_nonce,
          })}
          {this.renderButton({ label: "Submit" })}
        </form>
      </Layout>
    );
  }
}

export default Change;
