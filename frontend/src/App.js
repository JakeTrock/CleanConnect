import React, { Component } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Comment from "./pages/comment";
import Confirmation from "./pages/confirmation";
import Dashboard from "./pages/dashboard";
import Home from "./pages/home";
import Inventory from "./pages/inventory";
import Login from "./pages/login";
import Logout from "./pages/logout";
import Register from "./pages/register";
import Change from "./pages/change";
import ChangePassword from "./pages/changePassword";
import Profile from "./pages/profile";
import Tags from "./pages/tags";
import PrintSheet from "./pages/printSheet";
import Print from "./pages/print";
import NotFound from "./pages/notFound";

import Navbar from "./components/navbar";
import ProtectedRoute from "./components/protectedRoute";
import CaptchaRoute from "./components/captchaRoute";

import NoTokenRoute from "./components/noTokenRoute";
import * as auth from "./services/userAuthentication";
import "./App.css";

class App extends Component {
  state = {
    captchaValidated: false,
    user: auth.getCurrentUser(),
  };
  componentDidMount() {
    const user = auth.getCurrentUser();
    this.setState({ user });
    this.captchaSubmit = this.captchaSubmit.bind(this);
  }
  captchaSubmit() {
    this.setState({ captchaValidated: true });
  }
  render() {
    const { user, captchaValidated } = this.state;
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
            <NoTokenRoute
              path="/user/resetPass/:token"
              component={ChangePassword}
            />
            <ProtectedRoute path="/logout" component={Logout} />
            <ProtectedRoute
              path="/user/change/:token"
              render={(props) => <Change {...props} user={user} />}
            />

            <ProtectedRoute
              path="/profile"
              render={(props) => <Profile {...props} user={user} />}
            />

            <ProtectedRoute
              path="/tags"
              render={(props) => <Tags {...props} user={user} />}
            />
            <ProtectedRoute
              path="/printSheet"
              render={(props) => <PrintSheet {...props} user={user} />}
            />

            <Route path="/print/:token" component={Print} />
            <CaptchaRoute
              path="/tag/:token"
              validated={captchaValidated}
              captchaSubmit={() => this.captchaSubmit()}
              component={Comment}
            />
            <Route path="/user/confirmation/:token" component={Confirmation} />
            <Route path="/notFound" component={NotFound} />
            {!user && <Route exact path="/" component={Home} />}
            {user && (
              <Route
                exact
                path="/inventory"
                render={() => (
                  <Redirect
                    to={{
                      pathname: "inventory/" + user.dash,
                    }}
                  />
                )}
              />
            )}
            <Route
              path="/inventory/:token/:id?"
              render={(props) => <Inventory {...props} user={user} />}
            />
            {user && (
              <Route
                exact
                path="/"
                render={() => (
                  <Redirect
                    to={{
                      pathname: user.dash,
                    }}
                  />
                )}
              />
            )}
            <Route
              exact
              path="/:token"
              render={(props) => <Dashboard {...props} user={user} />}
            />

            <Redirect to="/notFound" />
          </Switch>
        </main>
      </React.Fragment>
    );
  }
}

export default App;
