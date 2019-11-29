import React, { Component } from "react";
import Layout from "../components/layout";
import Grid from "../components/grid";
import Unit from "../components/unit";
import "../css/unit.css";
class Tags extends Component {
  render() {
    let { tags } = this.props;
    if (!tags) tags = "";
    function customBehavior(item) {
      //css for customBehavior and emptyBehavior are in unit.css
      return (
        <Unit key={item.id} name={item.name}>
          <div className="unitText">item</div>
        </Unit>
      );
    }
    function emptyBehavior(item) {
      return (
        <Unit key={item.id}>
          <span className="text-muted">+</span>
        </Unit>
      );
    }
    return (
      <React.Fragment>
        <Layout name="Tags">
          <Grid
            {...this.props}
            items={tags}
            customBehavior={customBehavior}
            emptyBehavior={emptyBehavior}
          ></Grid>
        </Layout>
      </React.Fragment>
    );
  }
}

export default Tags;
