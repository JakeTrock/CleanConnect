import React, { Component } from "react";
import logo from "../images/logo2.png";
import logo2 from "../images/logo.png";

import "../css/carousel.css";

class Carousel extends Component {
  state = {
    images: [logo, logo2, logo],
    positionInList: 0
  };
  changeImage(direction) {
    if (this.listBoundary(direction)) {
      const positionInList = this.state.positionInList + direction;
      this.setState({ positionInList });
    }
  }

  listBoundary(direction) {
    if (
      direction + this.state.positionInList > this.state.images.length - 1 ||
      direction + this.state.positionInList < 0
    )
      return false;
    return true;
  }
  render() {
    const { images, positionInList } = this.state;
    return (
      <div className="carouselContainer mt-5">
        <span
          role="button"
          className="direction"
          onClick={() => this.changeImage(-1)}
        >
          {this.listBoundary(-1) && <div>&#60;</div>}
        </span>
        <span className="center">
          <img className="centerImg" alt="" src={images[positionInList]}></img>
        </span>
        <span className="direction" onClick={() => this.changeImage(1)}>
          {this.listBoundary(1) && <div>&#62;</div>}
        </span>
      </div>
    );
  }
}

export default Carousel;
