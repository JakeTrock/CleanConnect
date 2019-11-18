import React, { Component } from 'react';

import Carousel from  '../components/carousel';

class Home extends Component {
  state = {  }
  render() { 
    return (  
      <React.Fragment>
        <Carousel/>
        <p> Welcome to Clean Connect!</p>
      </React.Fragment>
    );
  }
}
 
export default Home;