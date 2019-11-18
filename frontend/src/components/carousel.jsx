
import React from 'react';
import { Carousel} from 'react-responsive-carousel';
import logo from '../images/logo.png';
import "react-responsive-carousel/lib/styles/carousel.min.css";

export default () => (
    <Carousel autoPlay>
      <div>
          <img src={logo} />
      </div>
      <div>
          <img src={logo} />
      </div>
      <div>
          <img src={logo} />
      </div>
    </Carousel>
)