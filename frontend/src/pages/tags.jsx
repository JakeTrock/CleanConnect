import React, { Component } from "react";
import { Redirect } from "react-router-dom";

import Layout from "../components/layout";
import Grid from "../components/grid";
import Unit from "../components/unit";
import {
  DeletePopupContainer,
  ImageContainer
} from "../components/popupContainer";
import Pagination from "../components/pagination";
import { paginate } from "../services/pagination";
import * as auth from "../services/tagsAuthentication";
import "../css/unit.css";

const queryString = require("query-string");
class Tags extends Component {
  state = {
    tags: [],
    limit: "",
    currentPage: 1,
    pageSize: 6
  };
  async stateSetter() {
    let { user } = this.props;
    let tags = "";
    if (user) {
      tags = await auth.getTags();
      for (let i = 0; i < tags.length; i++) {
        //contingency if a tag doesn't have a qr code
        if (!tags[i].qrcode) {
          await auth.genCache();
        }
      }
      tags = tags.data.reverse();
      let limit = null;
      if (user.tier === 0) limit = 5;
      if (user.tier === 1) limit = 25;
      if (limit !== this.state.limit) this.setState({ tags, limit }); //to prevent infinite loop, if statement is used
    }
  }
  componentDidMount() {
    this.stateSetter();
  }
  componentDidUpdate(prevProps) {
    if (prevProps === this.props) return;
    this.stateSetter();
  }
  handlePageChange = page => {
    this.setState({ currentPage: page });
  };
  render() {
    let { tags, limit, currentPage, pageSize } = this.state;
    if (!tags) tags = "";
    if (tags[0] !== "" && tags.length < limit) tags.splice(0, 0, "");
    let sortedTags = paginate(tags, currentPage, pageSize);

    function DeletePopup(data) {
      const customText =
        "This will permanently delete the tag titled " +
        data.item.name +
        ". Proceed?";
      return (
        <DeletePopupContainer
          triggerText="Delete Tag"
          customText={customText}
          deleteRoute={deleteTag}
          deleteData={data}
        />
      );
    }

    async function deleteTag(data) {
      const props = data.props;
      const id = data.item._id;
      try {
        const result = await auth.deleteTag(id);
        console.log(result);
        const { state } = props.location;
        if (result) window.location = state ? state.from.pathname : "/tags";
      } catch (e) {
        console.log(e);
      }
    }
    function customBehavior(item) {
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
                console.log(info);
                redirect = "/printSheet/?" + info;
                this.setState({ redirect });
              }}
            >
              Add to Printable Sheet
            </div>
            <DeletePopup props={this.props} item={item} />
          </div>
          {redirect && (
            <Redirect
              to={{
                pathname: redirect
              }}
            />
          )}
        </Unit>
      );
    }
    customBehavior = customBehavior.bind(this);

    function emptyBehavior() {
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
                await auth.genCache();
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
    }
    emptyBehavior = emptyBehavior.bind(this);

    return (
      <React.Fragment>
        <Layout name="Tags">
          <Pagination
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
