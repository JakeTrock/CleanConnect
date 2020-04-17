import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import Layout from "../components/layout";
import Grid from "../components/grid";
import Unit from "../components/unit";
import * as auth from "../services/tagsAuthentication";
import "../css/unit.css";

const queryString = require("query-string");

class PrintSheet extends Component {
  state = {
    tags: [],
    mounted: false,
    url: ""
  };
  async stateSetter() {
    const query = queryString.parse(window.location.search);
    let { user } = this.props;
    let tags = "";
    if (user) {
      tags = await auth.getTags();
      tags = tags.data.reverse();
      for (let number in tags) {
        tags[number].counter = 0;
        if (query.id === tags[number]._id) tags[number].counter = 1;
      }
      this.setState({ tags });
      this.setState({ mounted: true });
    }
    //tags = await this.counterSetter(tags);
  }

  async componentDidMount() {
    await this.stateSetter();
  }
  async componentDidUpdate(prevProps) {
    if (prevProps === this.props) return;
    await this.stateSetter();
  }

  async doSubmit(tags) {
    let printIteration = [];
    tags = tags.reverse();
    for (let i = 0; i < tags.length; i++) {
      const tag = tags[i];
      printIteration.push(tag.counter);
    }
    let info = await auth.print(printIteration);
    const url = info.data.filename + ".pdf";
    this.setState({ url });
  }
  isDisabled(tags) {
    for (let i = 0; i < tags.length; i++) {
      if (tags[i].counter !== 0) return false;
    }
    return true;
  }
  /*sortTags(tags) {
    this.setState({
      tags: _.sortBy(tags, ["counter", "dateLastAccessed"]).reverse()
    });
  }*/
  render() {
    let { tags, mounted, url } = this.state;
    let customBehavior = item => {
      //css for customBehavior are in unit.css
      return (
        <Unit key={item._id} name={item.name}>
          <div className="unitCenter addItem">
            <span
              className="text-muted unitText mr-3 largeText"
              style={{ cursor: "pointer" }}
              onClick={() => {
                item.counter++;
                this.setState({ tags });
              }}
            >
              +
            </span>
            <span
              className="text-muted unitText ml-3 largeText"
              style={{ cursor: "pointer" }}
              onClick={() => {
                if (item.counter > 0) item.counter--;
                this.setState({ tags });
              }}
            >
              -
            </span>
          </div>
          <div className="footer unitFooter">
            <div className="addItem" style={{ fontSize: "200%" }}>
              {item.counter} on sheet
            </div>
          </div>
        </Unit>
      );
    };
    customBehavior = customBehavior.bind(this);
    if (tags.length === 0 && mounted)
      return (
        <Redirect
          to={{
            pathname: "/tags"
          }}
        />
      ); //tags = "";
    if (url) {
      return (
        <Redirect
          to={{
            pathname: "/print/" + url
          }}
        />
      );
    }
    return (
      <React.Fragment>
        <Layout name="Add to Printable Sheet">
          {this.state.popup}
          <div className="row">
            <button
              type="button"
              style={{ marginLeft: "auto", marginRight: "auto" }}
              className="btn btn-primary"
              onClick={() => this.doSubmit(tags)}
              disabled={this.isDisabled(tags)}
            >
              Submit
            </button>
          </div>
          <Grid
            {...this.props}
            items={tags}
            idLocation={"_id"}
            customBehavior={customBehavior}
          ></Grid>
        </Layout>
      </React.Fragment>
    );
  }
}

export default PrintSheet;
