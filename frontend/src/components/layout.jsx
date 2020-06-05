import React, { Component } from "react";
import { ImageContainer } from "../components/popupContainer";
import "../css/layout.css";

class Layout extends Component {
  render() {
    let { name, image, children } = this.props;
    return (
      <div className="page mt-3">
        <h1 className="label label-header">
          {name}
          &nbsp;
          {image && (
            <ImageContainer
              trigger={
                <img
                  style={{
                    cursor: "pointer",
                    width: "20%",
                    marginLeft: "1vw",
                  }}
                  src={image}
                  alt=""
                />
              }
              imgLink={image}
            />
          )}
          {/*<div className="h2 question text">?</div>*/}
        </h1>

        <div className="pageBorder">
          <div className="pageBody">{children}</div>
        </div>
      </div>
    );
  }
}

export default Layout;
