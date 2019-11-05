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
      <Navbar/>
      <main className="container">
        <Switch>
        <Route path="/login" component={Login}/>
        <Route path="/" component={Home} />
        </Switch>
      </main>
      </React.Fragment>
    );
  }
}
 
export default App;

