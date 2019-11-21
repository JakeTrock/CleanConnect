import React from 'react';
import {Route, Redirect} from 'react-router-dom';
import auth from '../services/authentication'
const NoTokenRoute = ({path, component: Component, render, ...rest}) => {
    return (  
        <Route {...rest}
      render ={props => {
        if(auth.getCurrentUser()) return <Redirect to={{
          pathname: '/notFound',
        }}/>
        return Component ? <Component {...props} /> : render(props);
      }}/>
    );
}
 
export default NoTokenRoute;