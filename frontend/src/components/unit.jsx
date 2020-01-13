import React, { Component } from "react";
import "../css/unit.css";
class Unit extends Component {
  //don't put anything in unit.jsx besides this, render in tags with grid rendering children eventually
  render() {
    const props = this.props;
    let headerClass = "";
    if (props.name) headerClass = "label-complete";
    return (
      <div className="unitBorder">
        <div className="unitBody">
          <div className={headerClass} style={{ display: "flex" }}>
            {props.name && (
              <h1
                className="label"
                style={{ marginLeft: "auto", marginRight: "auto" }}
              >
                {props.name}
              </h1>
            )}
            {props.dot && (
              <span
                style={{
                  marginLeft: "-2vw",
                  backgroundColor: props.dot
                }}
                className=" dot rightObj"
              />
            )}
          </div>
          {props.children}
        </div>
      </div>
    );
  }
}

export default Unit;
