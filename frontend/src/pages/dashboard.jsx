import React, { Component } from "react";
import Layout from "../components/layout";

class Dashboard extends Component {
  state = {
    issues: [],
    user: this.props.user
  };
  componentDidMount() {
    //call route in backend to get issues depending on user
  }
  render() {
    const { issues } = this.state;
    return (
      <Layout name="Issue Tracker">
        {issues.map(issue => (
          <div>{issue}</div>
        ))}
      </Layout>
    );
  }
}

export default Dashboard;
