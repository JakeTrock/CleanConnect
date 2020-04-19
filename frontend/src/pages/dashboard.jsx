import React, { Component } from "react";
import { Redirect } from "react-router-dom";

import Layout from "../components/layout";
import Grid from "../components/grid";
import Unit from "../components/unit";
import { ButtonPagination } from "../components/pagination";
import { paginate } from "../services/pagination";

import * as auth from "../services/tagsAuthentication";
import * as file from "../services/fileAuthentication";
import {
  ImageContainer,
  CallbackPopupContainer,
} from "../components/popupContainer";
import { BooleanSelect } from "../components/select";
import "../css/unit.css";
/* Unfinished, need to add stuff in footer*/
class Dashboard extends Component {
  state = {
    tags: [],
    currentPage: 1,
    pageSize: 6,
  };
  async setTags(viewDead) {
    let { user, token } = this.state;
    let tags = "";
    let viewDeadBool = false;
    if (viewDead === "Yes") viewDeadBool = true;

    if (user && token === user.dash) {
      tags = await auth.getTags(viewDeadBool);
      tags = tags.data;
    } else {
      if (token) {
        try {
          tags = await auth.anonTags(token, viewDeadBool); //NOTE: Deal with problem in future, you can see all dead tags
          tags = tags.data;
          console.log(tags);
        } catch {}
      }
    }
    if (tags) {
      tags = tags.reverse();
      //tags.forEach(async tag => {
      tags = await this.imageSetter(tags);
    }
    this.setState({ tags });
    if (token && !tags) this.setState({ redirect: "/notFound" });
  }
  async imageSetter(tags) {
    for (let i = 0; i < tags.length; i++) {
      for (let j = 0; j < tags[i].comments.length; j++) {
        if (tags[i].comments[j].img) {
          const result = await file.getImage(tags[i].comments[j].img);
          var urlCreator = window.URL || window.webkitURL;
          var imageUrl = urlCreator.createObjectURL(result.data);
          tags[i].comments[j].img = imageUrl;
        }
      }
    }
    return tags;
  }

  async componentDidMount() {
    await this.setState({
      user: this.props.user,
      token: this.props.match.params.token,
    });
    await this.setTags(false);
  }

  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };
  render() {
    let { tags, currentPage, pageSize, user, token, redirect } = this.state;
    if (!tags) tags = "";
    let sortedTags = paginate(tags, currentPage, pageSize);
    let dash = "";
    if (user) dash = user.dash;
    else dash = token;

    async function deleteComment(data) {
      const props = data.props;
      const postId = data.item.tag;
      const commentId = data.item._id;
      try {
        const result = await auth.deleteComment(postId, commentId);
        const { state } = props.location;
        if (result) window.location = state ? state.from.pathname : "/";
      } catch (e) {}
    }
    async function readdComment(data) {
      const props = data.props;
      const postId = data.item.tag;
      const commentId = data.item._id;
      try {
        const result = await auth.readdComment(postId, commentId);
        const { state } = props.location;
        if (result) window.location = state ? state.from.pathname : "/";
      } catch (e) {}
    }
    function severityColor(severity) {
      if (severity === 0) return "green";
      if (severity === 1) return "yellow";
      if (severity === 2) return "red";
    }
    let customBehavior = (item) => {
      //css for customBehavior are in unit.css
      let severity = 0;
      for (let i = 0; i < item.comments.length; i++) {
        severity += item.comments[i].sev;
      }
      severity = severityColor(Math.round(severity / item.comments.length));

      return (
        <Unit key={item._id} name={item.name} dot={severity}>
          <div className="unitCenter" style={{ height: "39vh" }}>
            {item.comments.map(function (comment) {
              comment.postId = item._id;
              let opacity = "1";
              if (comment.markedForDeletion) opacity = ".7";
              return (
                <React.Fragment key={comment._id}>
                  <div style={{ opacity: opacity }}>
                    <div className="mt-2 ml-2" style={{ display: "flex" }}>
                      <h4 className="unitText">{comment.text}</h4>
                      <span
                        style={{
                          backgroundColor: severityColor(comment.sev),
                        }}
                        className="dot rightObj"
                      />
                    </div>
                    {!comment.markedForDeletion && (
                      <CallbackPopupContainer
                        triggerText="Delete Comment"
                        customText={`This will delete the comment with info: ${comment.text}. Proceed?`}
                        callbackRoute={deleteComment}
                        callbackData={{ props: this.props, item: comment }}
                      />
                    )}
                    {comment.markedForDeletion && user && (
                      <CallbackPopupContainer
                        triggerText="Restore Comment"
                        customText={`This will restore the comment with info: ${comment.text}. Proceed?`}
                        callbackRoute={readdComment}
                        callbackData={{ props: this.props, item: comment }}
                      />
                    )}
                    <ImageContainer
                      trigger={
                        <img
                          className="centerObj"
                          style={{ cursor: "pointer" }}
                          src={comment.img}
                          alt=""
                        />
                      }
                      imgLink={comment.img}
                    />
                    {/* TEMPORARY*/}
                    {/* Make small then big*/}
                  </div>
                </React.Fragment>
              );
            }, this)}
          </div>
          {/* Add tag to printable sheet here? */}
        </Unit>
      );
    };
    customBehavior = customBehavior.bind(this);
    if (redirect)
      return (
        <Redirect
          to={{
            pathname: redirect,
          }}
        />
      );
    return (
      <React.Fragment>
        <Layout name={`Issue Tracker ${dash}`}>
          {this.state.popup}
          <ButtonPagination
            itemsCount={tags.length}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={this.handlePageChange}
          />
          <BooleanSelect
            text="Show dead comments?"
            callback={this.setTags.bind(this)}
          />
          <Grid
            {...this.props}
            items={sortedTags}
            idLocation={"_id"}
            customBehavior={customBehavior}
          ></Grid>
        </Layout>
      </React.Fragment>
    );
  }
}

export default Dashboard;
