import React, { Component } from 'react';
import {Redirect} from 'react-router-dom';

class NotFound extends Component {
  state = {
    redirect: false
  }

  componentDidMount() {
    this.id = setTimeout(() => this.setState({ redirect: true }), 10000)
  }

  componentWillUnmount() {
    clearTimeout(this.id)
  }

  render() {
    return (
      <React.Fragment>
      <p className="h1 text text-dark mt-5"> Page not found or user is trying to access certain pages when logged in. Redirecting soon.</p>
      {this.state.redirect && <Redirect to="/" />}
      </React.Fragment>


    )
  }
}
 
export default NotFound;