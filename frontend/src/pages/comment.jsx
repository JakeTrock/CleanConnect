import React from "react";
import { Redirect } from "react-router-dom";

import Joi from "joi-browser";

import Form from "../components/form";
import Layout from "../components/layout";
import * as auth from "../services/tagsAuthentication";

class Comment extends Form {
  state = {
    //data stored in the form
    data: { text: "", severity: "", image: "", imageUrl: "" },
    errors: {},
    severityOptions: ["High", "Medium", "Low"],
    verified: true
  };
  schema = {
    text: Joi.string().required(),
    severity: Joi.string().required(),
    image: Joi.any().optional(),
    imageUrl: Joi.when("image", {
      //not used if image doesn't exist, but applies filter if it does
      is: Joi.not(""),
      then: Joi.string()
        .regex(/\.(jpg|jpeg|tiff|gif|png)$/i)
        .error(() => {
          return {
            message: "Not a valid image type (jpg, jpeg, tiff, gif, or png)"
          };
        })
    })
  };
  async componentDidMount() {
    // not finished
    /*const token = this.props.match.params.token;
    try {
      await auth.commentOnTag(token);
    } catch (ex) {
      //if (ex.response && ex.response.status === 404)
      //this.setState({ verified: false });
    }*/
  }
  doSubmit = async () => {
    try {
      //submits to comment on tag with form info then returns to home page
      const token = this.props.match.params.token;
      const { data } = this.state;
      data.severity = this.severityConverter(data.severity);
      await auth.commentOnTag(token, data.text, data.severity, data.image);
      this.setState({ verified: false });
    } catch (ex) {
      if (ex.response) {
        //gets errors then shows them to user
        const errors = { ...this.state.errors };
        if (ex.response.status === 400) {
          errors.text = ex.response.data.text;
          errors.sev = ex.response.data.sev;
          errors.imageUrl = ex.response.data.img;
        }
        this.setState({ errors });
      }
    }
  };
  severityConverter(data) {
    //converts severity to what backend expects
    if (data === "High") return 2;
    if (data === "Medium") return 1;
    if (data === "Low") return 0;
  }
  render() {
    const { errors, severityOptions } = this.state;
    if (this.state.verified === false) return <Redirect to="/" />;
    return (
      <Layout name="Report Problem">
        <form onSubmit={this.handleSubmit}>
          {this.renderImage("image", "Image (optional)", errors.image)}
          {this.renderError(errors.imageUrl)}
          {this.renderInput("text", "Information about problem", errors.text)}
          {this.renderSelect(
            "severity",
            "Rate the severity",
            severityOptions,
            errors.severity
          )}
          {this.renderButton("Submit")}
        </form>
      </Layout>
    );
  }
}

export default Comment;
