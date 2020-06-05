import React, { Component } from "react";
import Joi from "joi-browser";
import { CallbackPopupContainer } from "../components/popupContainer";
class Form extends Component {
  validate = (schema) => {
    if (!schema) schema = this.schema;
    const options = { abortEarly: false, allowUnknown: true };
    const { error } = Joi.validate(this.state.data, schema, options);
    if (!error) return null;
    const errors = {};
    for (let item of error.details) errors[item.path[0]] = item.message;
    return errors;
  };

  validateProperty = (name, value) => {
    //validates onChange
    const obj = { [name]: value };
    let schema = undefined;
    if (this.schema[name]) schema = { [name]: this.schema[name] };
    else {
      for (let key in this.schema) {
        const dict = this.schema[key];
        if (dict[name]) schema = { [name]: dict[name] };
      }
    }
    const { error } = Joi.validate(obj, schema);
    return error ? error.details[0].message : null;
  };
  handleSubmit = (e) => {
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

  renderButton({ label, onClick, disabled, schema } = {}) {
    //renderButton(label, onClick, disabled) {
    let className = "btn btn-primary";
    if (label === "Delete") className = "btn btn-danger";
    if (disabled === undefined) disabled = this.validate(schema); //pass parammeters here to validate
    if (!onClick)
      return (
        <button disabled={disabled} className={className}>
          {label}
        </button>
      );
    else
      return (
        <button onClick={onClick} disabled={disabled} className={className}>
          {label}
        </button>
      );
  }
  renderInput({ name, label, placeHolder, error, type, dropdown }) {
    const { data } = this.state;
    return (
      <div className="form-group">
        {label && <label className="pageText">{label}</label>}
        <input
          type={type}
          name={name}
          id={name}
          value={data[name]}
          placeholder={placeHolder}
          className="form-control"
          style={{ fontFamily: "arial" }}
          onChange={this.handleString}
          list="list"
        />
        {dropdown && (
          <datalist id="list">
            {dropdown.map((option) => (
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
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {error && <div className="alert alert-danger">{error}</div>}
      </div>
    );
  }
  renderStep({ name, label, error, value, min, max }) {
    let inputClass = "";
    if (value < min || value > max) inputClass = "text-danger";
    return (
      <div className="form-group">
        <div style={{ display: "flex" }}>
          <label className="pageText mr-2">{label}:</label>
          <input
            className={inputClass}
            type="number"
            name={name}
            step="1"
            value={value}
            onChange={this.handleString}
          />
        </div>
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
  renderPopup({ parameters, triggerText, customText, callback }) {
    return (
      <div style={{ marginTop: "1vw" }}>
        <CallbackPopupContainer
          triggerText={triggerText}
          customText={customText}
          callbackRoute={callback}
          callbackData={parameters}
        />
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
