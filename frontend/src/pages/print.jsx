import React, { Component } from "react";
import Layout from "../components/layout";
import * as file from "../services/fileAuthentication";

class Print extends Component {
  state = {
    url: ""
  };
  async componentDidMount() {
    const filename = this.props.match.params.token;
    const info = await file.getPdf(filename);
    const data = info.data;
    var urlCreator = window.URL || window.webkitURL;
    var url = urlCreator.createObjectURL(data);
    this.setState({ url });
  }
  render() {
    const { url } = this.state;
    return (
      <Layout name="Print">
        <iframe title="print" src={url} width="100%" height="500px" />
      </Layout>
    );
  }
}

export default Print;
