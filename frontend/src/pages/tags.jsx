import React, { Component } from "react";
import Layout from "../components/layout";
import Grid from "../components/grid";
import Unit from "../components/unit";
import { DeletePopupContainer } from "../components/popupContainer";
import * as auth from "../services/tagsAuthentication";
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
  render() {
    let { tags, limit } = this.state;
    if (!tags) tags = "";
    if (tags[0] !== "" && tags.length < limit) tags.splice(0, 0, "");

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
      return (
        <Unit key={item._id} name={item.name}>
          <div className="unitText">item</div>
          <div className="unitFooter">
            <DeletePopup props={this.props} item={item} />
          </div>
        </Unit>
      );
    }
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
