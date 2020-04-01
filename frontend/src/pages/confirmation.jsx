import React, {Component} from "react";
import { Redirect } from "react-router-dom";
import * as auth from "../services/userAuthentication";
import { toast } from "react-toastify";

class Confirm extends Component {
  state = {
    confirmed:false,
    }
  async componentDidMount() {
    const code = this.props.match.params.token;
    try{
    await auth.confirm(code);
    toast.success("Confirmed.", { autoClose: 7500 });
    this.setState({confirmed:true})
    } catch(e){
      toast.error("An error has occurred. This likely means this route has already been called once or the code is invalid.", { autoClose: 7500 });
      this.setState({confirmed:true})
    }
  }
  render() { 
    if(this.state.confirmed){
      return <Redirect to="/"/>
    }
    else{
    return ( 
      <div>
        <h1>Verifying info. Please wait. 
          <br/>
          If this takes too long please refresh.
          </h1>
      </div>
     );
    }
  }
}
 
export default Confirm;