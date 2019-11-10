import React, { Component } from 'react';
import { Route, Switch } from "react-router-dom";

import Home from "./pages/home";
import Login from "./pages/login";
import Logout from "./pages/logout";
import Register from "./pages/register";


import Navbar from './components/navbar'

import auth from './services/authentication'
import logo from './logo.svg';
import './App.css';

class App extends Component {
  state = {  }
  componentDidMount() {
    const user = auth.getCurrentUser();
    this.setState({ user });
  }
  render() { 
    const { user } = this.state;
    return (  
      <React.Fragment>
      <Navbar user = {user}/> {/* Displays navbar on all pages (may change later) */}
      <main className="container">
        <Switch> {/* Allows a single page website to connect to all pages */}
        <Route path="/login" component={Login}/>
        <Route path="/register" component={Register}/>
        <Route path="/logout" component={Logout}/>
        <Route path="/" component={Home} />
        </Switch>
      </main>
      </React.Fragment>
    );
  }
}
 
export default App;

