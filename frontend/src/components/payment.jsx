import React, { Component } from "react";
import DropIn from "braintree-web-drop-in-react";
import * as auth from "../services/userAuthentication";

class Payment extends Component {
  instance;

  state = {
    clientToken: null,
  };

  async componentDidMount() {
    let data = "";
    if (this.props.props) {
      //if given props of user
      data = await auth.getAuthClientToken();
      console.log(data);
    } else data = await auth.getClientToken();
    const clientToken = data.data.clientToken;
    this.setState({ clientToken });
  }

  async buy() {
    // Send the nonce to your server
    const { nonce } = await this.instance.requestPaymentMethod();
    this.props.onChange(this.props.name, nonce);
  }
  render() {
    const { clientToken } = this.state;
    if (!clientToken) {
      return (
        <div>
          <h3>Loading...</h3>
          <h5>
            If this is loading for too long please refresh the page as that
            means an error has occurred.
          </h5>
        </div>
      );
    } else {
      return (
        <div style={{ marginBottom: "6vh" }}>
          <DropIn
            options={{
              authorization: clientToken,
            }}
            onInstance={(instance) => (this.instance = instance)}
          />
          <div>
            <button className="btn btn-info " onClick={this.buy.bind(this)}>
              Confirm Payment
            </button>
          </div>
        </div>
      );
    }
  }
}

export default Payment;
