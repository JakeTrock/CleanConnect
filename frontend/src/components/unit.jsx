import React, { Component } from "react";
import "../css/unit.css";
class Unit extends Component {
  //don't put anything in unit.jsx besides this, render in tags with grid rendering children eventually
  render() {
    const props = this.props;
    let containerClass = "unitBorder";
    if (!props.name) containerClass += " addItem";
    return (
      <div className={containerClass}>
        <div className="unitBody">
          {props.name && <h1 className="label label-complete">{props.name}</h1>}
          {props.children}
        </div>
      </div>
    );
  }
}

export default Unit;
