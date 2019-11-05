import React, { Component } from "react";

class Form extends Component {  
  renderInput(name, type) {
    const { data, errors } = this.state;
    return (
      <div className="form-group">
      <label htmlFor={name}>{name[0].toUpperCase()+name.slice(1)}</label>
      <input type={type} name={name} id={name} className="form-control" />
      {errors.products && errors.products.map(error => <div className="alert alert-danger">{error}</div>)}
      </div>
    );
  }
}

 
export default Form;