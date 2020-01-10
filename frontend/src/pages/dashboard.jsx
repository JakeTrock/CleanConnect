import React, { Component } from "react";
import Layout from "../components/layout";
import Grid from "../components/grid";
import Unit from "../components/unit";
import * as auth from "../services/tagsAuthentication";
import * as file from "../services/fileAuthentication";
import {
  ImageContainer,
  DeletePopupContainer
} from "../components/popupContainer";
import "../css/unit.css";

class Dashboard extends Component {
  state = {
    tags: []
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
  render() {
    let { tags } = this.state;
    if (!tags) tags = "";

    function DeletePopup(data) {
      console.log(data);
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
        console.log(result);
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
      return (
        <Unit key={item._id} name={item.name}>
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
                        onClick={() =>
                          this.imagePopup(comment.img, comment._id)
                        }
                      />
                    }
                    imgLink={comment.img}
                  />
                  <div className="unitFooter" /> {/* TEMPORARY*/}
                  {/* Make small then big*/}
                </React.Fragment>
              );
            }, this)}
          </div>
          <div className="unitFooter"></div>
          {/* Add tag to printable sheet here? */}
        </Unit>
      );
    }
    return (
      <React.Fragment>
        <Layout name="Issue Tracker">
          {this.state.popup}

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

export default Dashboard;
