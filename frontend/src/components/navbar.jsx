import React from 'react';
import { Link, NavLink } from "react-router-dom";
//Link and NavLink are react specific tools allowing you to move through pages of a single paged website
const Navbar = () => {
  //Temporary navbar, subject to change
  return ( 
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
    <Link className="navbar-brand" to="/">
      Clean Connect
    </Link>
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
    <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
      <div className="navbar-nav">
        <NavLink className="nav-item nav-link" to="/login"> 
          Login
        </NavLink>
        <NavLink className="nav-item nav-link" to="/register">
          Register
        </NavLink>
      </div>
    </div>
  </nav>
  );
}
 
export default Navbar;