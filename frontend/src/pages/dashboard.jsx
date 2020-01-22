import React, { Component } from "react";
import Layout from "../components/layout";
import Grid from "../components/grid";
import Unit from "../components/unit";
import Pagination from "../components/pagination";
import { paginate } from "../services/pagination";
import * as auth from "../services/tagsAuthentication";
import * as file from "../services/fileAuthentication";
import {
  ImageContainer,
  DeletePopupContainer
} from "../components/popupContainer";
import "../css/unit.css";

/* Unfinished, need to add stuff in footer*/
class Dashboard extends Component {
  state = {
    tags: [],
    currentPage: 1,
    pageSize: 6
  };
  async stateSetter() {
    let { user } = this.props;
    let tags = "";
    if (user) {
      tags = await auth.getTags();
      tags = tags.data;
    }
    //tags.forEach(async tag => {
    tags = await this.imageSetter(tags);

    this.setState({ tags });
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
    let { tags, currentPage, pageSize } = this.state;
    if (!tags) tags = "";
    let sortedTags = paginate(tags, currentPage, pageSize);

    function DeletePopup(data) {
      const customText =
        "This will permanently delete the comment with info: " +
        data.item.text +
        ". Proceed?";
      return (
        <DeletePopupContainer
          triggerText="Delete Comment"
          customText={customText}
          deleteRoute={deleteComment}
          deleteData={data}
        />
      );
    }
    async function deleteComment(data) {
      const props = data.props;
      const postId = data.item.postId;
      const commentId = data.item.cid;
      try {
        const result = await auth.deleteComment(postId, commentId);
        const { state } = props.location;
        if (result) window.location = state ? state.from.pathname : "/";
      } catch (e) {
        console.log(e);
      }
    }
    function severityColor(severity) {
      if (severity === 0) return "green";
      if (severity === 1) return "yellow";
      if (severity === 2) return "red";
    }
    function customBehavior(item) {
      //css for customBehavior are in unit.css
      let severity = 0;
      for (let i = 0; i < item.comments.length; i++) {
        severity += item.comments[i].sev;
      }
      severity = severityColor(Math.round(severity / item.comments.length));
      return (
        <Unit key={item._id} name={item.name} dot={severity}>
          <div className="unitCenter">
            {item.comments.map(function(comment) {
              comment.postId = item._id;
              return (
                <React.Fragment key={comment._id}>
                  <div className="mt-2 ml-2" style={{ display: "flex" }}>
                    <h4 className="unitText">{comment.text}</h4>
                    <span
                      style={{
                        backgroundColor: severityColor(comment.sev)
                      }}
                      className="dot rightObj"
                    />
                  </div>
                  <DeletePopup props={this.props} item={comment} />
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
                  <div className="footer" /> {/* TEMPORARY*/}
                  {/* Make small then big*/}
                </React.Fragment>
              );
            }, this)}
          </div>
          <div className="footer unitFooter"></div>
          {/* Add tag to printable sheet here? */}
        </Unit>
      );
    }
    return (
      <React.Fragment>
        <Layout name="Issue Tracker">
          {this.state.popup}
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
          ></Grid>
        </Layout>
      </React.Fragment>
    );
  }
}

export default Dashboard;
