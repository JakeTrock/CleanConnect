import React, { Component } from "react";
import Layout from "../components/layout";
import * as auth from "../services/authentication";

class Profile extends Component {
  editAccount() {
    auth.changeInfo();
    this.refs.editButton.setAttribute("disabled", "disabled");
    //if success create success, if not create error
    //disable button for certain time
  }
  deleteAccount() {
    auth.deleteInfo();
    this.refs.deleteButton.setAttribute("disabled", "disabled");
  }
  render() {
    const { user } = this.props;
    return (
      <Layout name="Account Panel">
        {user && (
          <h1 className="label border-bottom mb-3">{user.name}'s Profile</h1>
        )}
        {user && (
          <h1 className="label mb-3">
            You are currently a tier {user.tier} member, you have (# of tags){" "}
          </h1>
        )}
        <button
          type="button"
          ref="editButton"
          className="btn btn-primary"
          style={{ borderRadius: "10px" }}
          onClick={() => this.editAccount()}
        >
          Edit Account
        </button>
        <h1 className="pageText text-secondary mb-3">
          This option requires email verification. Please have your preferred
          email client open to change link.
        </h1>
        <button
          type="button"
          ref="deleteButton"
          className="btn btn-danger"
          style={{ borderRadius: "10px" }}
          onClick={() => this.deleteAccount()}
        >
          Delete Account
        </button>
        <h1 className="pageText text-secondary mb-3">
          WARNING: THIS OPTION WILL PERMANENTLY DELETE YOUR ACCOUNT. YOU WILL
          NEED TO VERIFY THIS CHOICE BY EMAIL.
        </h1>
      </Layout>
    );
  }
}

export default Profile;
