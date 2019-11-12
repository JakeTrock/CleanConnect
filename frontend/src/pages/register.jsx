import React from 'react';
import Joi from "joi-browser";
import Form from "../components/form"; //allows you to render Input, initalizing login form as a form
import * as auth from "../services/authentication";

class Register extends Form {
  state = {  //data stored in the form
    data: { name:"",email: "", password: "", password2:""},
    errors: {}
  }
  schema = { //using Joi for form creation and errors (change?)
    name: Joi.string()
      .required(),
    email: Joi.string()
      .required(),
    password: Joi.string()
      .required(),
    password2: Joi.string()
      .required()

  };
  doSubmit = async () => {
    try {
      const { data } = this.state;
      await auth.register(data.name, data.email, data.password, data.password2);
      const { state } = this.props.location;
      window.location = state ? state.from.pathname : "/";
    } 
    catch (ex) {
      console.clear()
      if (ex.response && ex.response.status === 400) {
        const errors = { ...this.state.errors };
        errors.name = ex.response.data.name;
        errors.email = ex.response.data.email;
        errors.password = ex.response.data.password;
        errors.password2 = ex.response.data.password2;
        this.setState({ errors });
      }
    }
  };
  render() { 
    const errors=this.state.errors
    return ( 
      <div>
        <h1>Register</h1>
        <form onSubmit={this.handleSubmit}>
          {this.renderInput("name", "Name",errors.name)}
          {this.renderInput("email", "Email", errors.email)}
          {this.renderInput("password", "Password", errors.password,"password")}
          {this.renderInput("password2", "Confirm Password",errors.password2,"password")}
          {this.renderButton("Register")}
        </form>
      </div>
     );
  }
}
 
export default Register;