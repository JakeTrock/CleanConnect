import React, { Component } from 'react';
import logo from '../images/logo.png';
import '../css/carousel.css'

class Carousel extends Component {
  state = {  }
  render() { 
    return ( 
    <div className = "carouselContainer">
        <span className="left">&#60;</span>
        <span className="center">
        <img src={logo} alt=""/>
        </span>
    </div>
     );
  }
}
 
export default Carousel;

