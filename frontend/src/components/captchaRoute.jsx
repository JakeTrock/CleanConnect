import React from "react";
import { Route } from "react-router-dom";

import ReCAPTCHA from "react-google-recaptcha";

const CaptchaRoute = ({
  path,
  validated,
  captchaSubmit,
  component: Component,
  render,
  ...rest
}) => {
  const recaptchaRef = React.createRef();
  const key = process.env.REACT_APP_CAPTCHA_KEY; //"6LeQ3csUAAAAAJMNvvh313yU9HCborrUzc4bzQ5t"
  const captchaCompleted = value => {
    if (value) captchaSubmit();
  };
  const Captcha = () => {
    return (
      <div>
        <h3 align="center" style={{ fontSize: "6vw" }} className="mt-5 mb-5">
          Finish the captcha to access the page
        </h3>
        <ReCAPTCHA
          size="compact"
          ref={recaptchaRef}
          sitekey={key}
          onChange={captchaCompleted}
          align="center"
        />
      </div>
    );
  };
  return (
    <React.Fragment>
      <Route
        {...rest}
        render={props => {
          if (!validated)
            return (
              <React.Fragment>
                <Captcha />
              </React.Fragment>
            );
          return Component ? <Component {...props} /> : render(props);
        }}
      />
    </React.Fragment>
  );
};

export default CaptchaRoute;
