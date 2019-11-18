import React from 'react';
import { Link, NavLink } from "react-router-dom";

import logo from '../images/logo.png';
//Link and NavLink are react specific tools allowing you to move through pages of a single paged website
const Navbar = ({ user }) => {
  //Temporary navbar, subject to change
  return ( 
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
    <img src = {logo}/>
    <button
      className="navbar-toggler"
      type="button"
      data-toggle="collapse"
      data-target="#navbarNavAltMarkup"
      aria-controls="navbarNavAltMarkup"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span className="navbar-toggler-icon" />
    </button>
    <div className="navbar-nav ml-auto" id="navbarNavAltMarkup">
      <div className="navbar-nav">
          {!user && (
            <React.Fragment>
              <NavLink className="nav-item nav-link navbar" to="/login">
                Login
              </NavLink>
             <NavLink className="nav-item nav-link"  to="/register">
                Register
              </NavLink>
            </React.Fragment>
          )}
          {user && (
            <React.Fragment>
              <NavLink className="nav-item nav-link" to="/profile">
                {user.name}
              </NavLink>
              <NavLink className="nav-item nav-link" to="/logout">
                Logout
              </NavLink>
            </React.Fragment>
          )}
         
      </div>
    </div>
  </nav>
  );
}
 
export default Navbar;