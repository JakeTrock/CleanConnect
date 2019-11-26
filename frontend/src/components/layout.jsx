import React, { Component } from "react";
import "../css/layout.css";

class Layout extends Component {
  render() {
    return (
      <div className="page mt-3">
        <h1 className="label label-header">{this.props.name}</h1>
        <div className="pageBorder">
          <div className="pageBody">{this.props.children}</div>
        </div>
      </div>
    );
  }
}

export default Layout;
