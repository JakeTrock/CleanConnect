import React, { Component } from "react";
import { Redirect } from "react-router-dom";

import Layout from "../components/layout";
import Grid from "../components/grid";
import Unit from "../components/unit";
import {
  CallbackPopupContainer,
  ImageContainer,
} from "../components/popupContainer";
import { ButtonPagination } from "../components/pagination";
import { paginate } from "../services/pagination";
import * as auth from "../services/tagsAuthentication";
import { tagLimit } from "../converters/limits";
import "../css/unit.css";

const queryString = require("query-string");
class Tags extends Component {
  state = {
    tags: "",
    limit: tagLimit(this.props.user),
    currentPage: 1,
    pageSize: 6,
  };
  async stateSetter() {}
  componentDidMount() {
    this.setTags(false);
  }
  /*componentDidUpdate(prevProps, prevState) {
    if (prevState.viewDead && prevState.viewDead === this.state.viewDead) {
      return;
    }
    this.stateSetter();
  }*/
  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };
  async setTags(viewDead) {
    let { user } = this.props;
    let tags = "";
    if (user) {
      let viewDeadBool = false;
      if (viewDead === "Yes") viewDeadBool = true;
      tags = await auth.getTags(viewDeadBool);

      tags = tags.data.reverse();
      //if (limit !== this.state.limit)
      this.setState({ tags }); //to prevent infinite loop, if statement is used
    }
  }

  render() {
    let { tags, limit, currentPage, pageSize } = this.state;
    if (tags !== "" && tags.length < limit && tags[0] !== "")
      tags.splice(0, 0, "");
    const sortedTags = paginate(tags, currentPage, pageSize);

    async function deleteTag(data) {
      const props = data.props;
      const id = data.item._id;
      try {
        const result = await auth.deleteTag(id);
        const { state } = props.location;
        if (result) window.location = state ? state.from.pathname : "/tags";
      } catch (e) {}
    }

    let customBehavior = (item) => {
      //css for customBehavior and emptyBehavior are in unit.css
      let redirect = this.state.redirect;
      return (
        <Unit key={item._id} name={item.name}>
          <div className="unitCenter">
            <ImageContainer
              trigger={
                <img
                  className="centerObj"
                  style={{ cursor: "pointer" }}
                  src={item.qrcode}
                  alt=""
                />
              }
              imgLink={item.qrcode}
            ></ImageContainer>
          </div>

          <div className="footer unitFooter">
            <div
              className="unitLink mt-2 mb-2"
              onClick={() => {
                const info = queryString.stringify({ id: item._id });
                redirect = "/printSheet/?" + info;
                this.setState({ redirect });
              }}
            >
              Add to Printable Sheet
            </div>
            <CallbackPopupContainer
              triggerText="Delete Tag"
              customText={`This will permanently delete the tag titled: ${item.name}. Proceed?`}
              callbackRoute={deleteTag}
              callbackData={{ props: this.props, item: item }}
            />
          </div>
          {redirect && (
            <Redirect
              to={{
                pathname: redirect,
              }}
            />
          )}
        </Unit>
      );
    };
    customBehavior = customBehavior.bind(this);

    let emptyBehavior = () => {
      return (
        <Unit>
          <div className="label label-complete">
            <input id="input" placeholder="Insert title..." maxLength="20" />
          </div>
          <span
            className="text-muted unitText addItem"
            style={{ cursor: "pointer" }}
            onClick={async () => {
              try {
                const result = await auth.newTag(
                  document.getElementById("input").value
                );
                const { state } = this.props.location;
                if (result) {
                  window.location = state ? state.from.pathname : "/tags";
                }
              } catch (e) {
                console.log(e);
              }
            }}
          >
            +
          </span>
        </Unit>
      );
    };
    emptyBehavior = emptyBehavior.bind(this);

    return (
      <React.Fragment>
        <Layout name="Tags">
          <ButtonPagination
            itemsCount={tags.length}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={this.handlePageChange}
          />
          <Grid
            {...this.props}
            items={sortedTags}
            idLocation={"_id"}
            customBehavior={customBehavior}
            emptyBehavior={emptyBehavior}
          ></Grid>
        </Layout>
      </React.Fragment>
    );
  }
}

export default Tags;
