import React, { Component } from 'react';
import * as auth from "../services/authentication";
import '../css/profile.css'


class Profile extends Component {
  editAccount(){
    //will be used to edit account
  }
  render() { 
    const {user} = this.props;
    console.log(this.props)
    return ( 
    <div className = "profile">
      <h1 className="text-dark mt-1 label label-header">Account Panel</h1> 
      <div className="profileBorder">
        <div className="profileBody">
        {user && <h1 className = "label border-bottom mb-3">{user.name}'s Profile</h1>}
        <button type="button" className="btn btn-primary" style={{borderRadius:'10px'}} onClick={()=>this.editAccount()}>Edit Account</button>
        <h1 className = "profileText text-secondary mb-3">
          This option requires email verification.  Please have your preferred email client open to change link.
        </h1>
        <button type="button" className="btn btn-danger" style={{borderRadius:'10px'}} >Delete Account</button>
        <h1 className = "profileText text-secondary mb-3">
          WARNING: THIS OPTION WILL PERMANENTLY DELETE YOUR ACCOUNT. YOU WILL NEED TO VERIFY THIS CHOICE BY EMAIL.
        </h1>
        </div>
      </div>
    </div>
    );
  }
}
 
export default Profile;