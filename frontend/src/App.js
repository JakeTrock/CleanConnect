import React, { Component } from 'react';
import { Route, Switch } from "react-router-dom";

import Home from "./pages/home";
import Login from "./pages/login";

import Navbar from './components/navbar.jsx'

import logo from './logo.svg';
import './App.css';

class App extends Component {
  state = {  }
  render() { 
    return (  
      <React.Fragment>
      <Navbar/> {/* Displays navbar on all pages (may change later) */}
      <main className="container">
        <Switch> {/* Allows a single page website to connect to all pages */}
        <Route path="/login" component={Login}/>
        <Route path="/" component={Home} />
        </Switch>
      </main>
      </React.Fragment>
    );
  }
}
 
export default App;

