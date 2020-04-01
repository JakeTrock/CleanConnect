import React, { Component } from "react";
import Joi from "joi-browser";

class Form extends Component {
  /*state = {
    data: {},
    errors: {}
  };*/ //commenting for now
  validate = () => {
    const options = { abortEarly: false };
    const { error } = Joi.validate(this.state.data, this.schema, options);
    if (!error) return null;
    const errors = {};
    //for (let item of error.details) errors[item.path[0]] = item.message;
    return errors;
  };

  validateProperty = (name, value) => {
    const obj = { [name]: value };
    const schema = { [name]: this.schema[name] };
    const { error } = Joi.validate(obj, schema);
    return error ? error.details[0].message : null;
  };
  handleSubmit = e => {
    e.preventDefault();

    const errors = this.validate();
    this.setState({ errors: errors || {} });
    if (errors) return;

    this.doSubmit();
  };

  handleChange = async (name, value) => {
    const errors = { ...this.state.errors };
    const errorMessage = this.validateProperty(name, value);
    if (errorMessage) errors[name] = errorMessage;
    else delete errors[name];

    const data = { ...this.state.data };
    data[name] = value;
    await this.setState({ data, errors });
  };
  handleComponent = (name, val) => {
    this.handleChange(name, val);
  };
  handleImage = async ({ currentTarget: input }) => {
    await this.handleChange(input.name, input.files[0]);
    this.handleChange("imageUrl", input.value);
  };
  handleString = ({ currentTarget: input }) => {
    this.handleChange(input.name, input.value);
  };
  handleSelect = ({ currentTarget: select }) => {
    this.handleChange(select.name, select.value);
  };

  renderButton(label) {
    return (
      <button disabled={this.validate()} className="btn btn-primary">
        {label}
      </button>
    );
  }
  renderInput({ name, label, error, type, dropdown }) {
    const { data } = this.state;
    return (
      <div className="form-group">
        <label className="pageText">{label}</label>
        <input
          type={type}
          name={name}
          id={name}
          value={data[name]}
          className="form-control"
          style={{ fontFamily: "arial" }}
          onChange={this.handleString}
          list="list"
        />
        {dropdown && (
          <datalist id="list">
            {dropdown.map(option => (
              <option key={option} value={option} />
            ))}
          </datalist>
        )}
        {this.renderError(error)}
      </div>
    );
  }
  renderSelect({ name, label, options, error }) {
    const { data } = this.state;
    return (
      <div className="form-group">
        <label className="pageText">{label}</label>
        <select
          name={name}
          id={name}
          onChange={this.handleSelect}
          value={data[name]}
          className="form-control"
        >
          <option value="" />
          {options.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {error && <div className="alert alert-danger">{error}</div>}
      </div>
    );
  }
  renderImage(name, label, error) {
    return (
      <div className="form-group">
        <label className="pageText">{label}</label>
        <input
          type="file"
          name={name}
          id={name}
          accept="image/*, .mp4, .gif, .webm, .webp"
          capture="environment"
          onChange={this.handleImage}
        />
        {this.renderError(error)}
      </div>
    );
  }
  renderComponent({ name, Component, props, error }) {
    return (
      <div>
        <Component name={name} props={props} onChange={this.handleComponent} />
        {error && <div className="alert alert-danger">{error}</div>}
      </div>
    );
  }
  renderError(error) {
    return error && <div className="alert alert-danger">{error}</div>;
  }
}

export default Form;
