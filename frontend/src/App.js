import React, { Component } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Dashboard from "./pages/dashboard";
import Home from "./pages/home";
import Login from "./pages/login";
import Logout from "./pages/logout";
import Register from "./pages/register";
import Change from "./pages/change";
import Profile from "./pages/profile";
import Tags from "./pages/tags";
import NotFound from "./pages/notFound";
import Change from "./pages/change";
import Navbar from "./components/navbar";
import ProtectedRoute from "./components/protectedRoute";
import NoTokenRoute from "./components/noTokenRoute";
import auth from "./services/authentication";
import "./App.css";

class App extends Component {
  state = {};
  componentDidMount() {
    const user = auth.getCurrentUser();
    this.setState({ user });
  }
  render() {
    const { user } = this.state;
    return (
      <React.Fragment>
        <ToastContainer />
        <Navbar user={user} />
        {/* Displays navbar on all pages (may change later) */}
        <main className="container">
          <Switch>
            {/* Allows a single page website to connect to all pages */}
            <NoTokenRoute path="/login" component={Login} />
            <NoTokenRoute path="/register" component={Register} />
            <ProtectedRoute path="/logout" component={Logout} />
            <ProtectedRoute path="/change/:token" component={Change} />
            <ProtectedRoute
              path="/profile"
              render={props => <Profile {...props} user={user} />}
            />
            {user && (
              <ProtectedRoute
                exact
                path="/"
                render={props => <Dashboard {...props} user={user} />}
              />
            )}
            {!user && <Route exact path="/" component={Home} />}
            <ProtectedRoute
              path="/tags"
              render={props => <Tags {...props} user={user} />}
            />
            <Route path="/notFound" component={NotFound} />
            <Redirect to="/notFound" />
          </Switch>
        </main>
      </React.Fragment>
    );
  }
}

export default App;
