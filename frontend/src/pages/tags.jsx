import React, { Component } from "react";
import Layout from "../components/layout";
import Grid from "../components/grid";
import Unit from "../components/unit";
import * as auth from "../services/tagsAuthentication";
import Popup from "reactjs-popup";
import "../css/unit.css";

class Tags extends Component {
  state = {
    tags: [],
    limit: ""
  };
  async stateSetter() {
    let { user } = this.props;
    let tags = "";
    if (user) {
      tags = await auth.getTags();
      tags = tags.data;
      let limit = null;
      if (user.tier === 0) limit = 5;
      if (user.tier === 1) limit = 25;
      if (limit !== this.state.limit) this.setState({ tags, limit });
    }
  }
  componentDidMount() {
    this.stateSetter();
  }
  componentDidUpdate(prevProps) {
    if (prevProps === this.props) return;
    this.stateSetter();
  }
  render() {
    let { tags, limit } = this.state;
    if (!tags) tags = "";
    if (tags[0] !== "" && tags.length < limit) tags.splice(0, 0, "");

    function DeletePopup(data) {
      const item = data.item;
      return (
        <Popup
          trigger={<a href="#">Delete Tag</a>}
          position="right center"
          modal
        >
          {close => (
            <div style={{ border: "5px solid black", margin: "-6px" }}>
              <div style={{ margin: "10px" }}>
                <a className="close" onClick={close}>
                  &times;
                </a>
                <h1>
                  This will permanently delete the tag titled {item.name}.
                  Proceed?
                </h1>
                <button
                  className="btn btn-danger"
                  style={{
                    borderRadius: "10px",
                    display: "block",
                    width: "30%",
                    marginLeft: "auto",
                    marginRight: "auto"
                  }}
                  onClick={() => {
                    close();
                    deleteTag(data.props, item._id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </Popup>
      );
    }

    async function deleteTag(props, id) {
      //eventually turn this into a popup or an email notification
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
      return (
        <Unit key={item._id} name={item.name}>
          <div className="unitText">item</div>
          <div className="unitFooter"></div>
          <DeletePopup props={this.props} item={item} />
        </Unit>
      );
    }
    function emptyBehavior() {
      return (
        <Unit>
          <div className="label label-complete">
            <input id="input" placeholder="Insert title..." />
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
                if (result)
                  window.location = state ? state.from.pathname : "/tags";
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
    return (
      <React.Fragment>
        <Layout name="Tags">
          <Grid
            {...this.props}
            items={tags}
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
