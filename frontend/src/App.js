import React, { Component } from 'react';
import { Route, BrowserRouter } from "react-router-dom";

import Home from "./pages/home";

import logo from './logo.svg';
import './App.css';

class App extends Component {
  state = {  }
  render() { 
    return (  
      <React.Fragment>
      <main className="container">
        <BrowserRouter>
        <Route path="/" component={Home} />
        </BrowserRouter>
      </main>
      </React.Fragment>
    );
  }
}
 
export default App;

