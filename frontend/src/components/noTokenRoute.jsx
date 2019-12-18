import React from "react";
import { Route, Redirect } from "react-router-dom";
import * as auth from "../services/userAuthentication";
const NoTokenRoute = ({ path, component: Component, render, ...rest }) => {
  return (
    <Route
      {...rest}
      render={props => {
        if (auth.getCurrentUser())
          return (
            <Redirect
              to={{
                pathname: "/notFound"
              }}
            />
          );
        return Component ? <Component {...props} /> : render(props);
      }}
    />
  );
};

export default NoTokenRoute;
