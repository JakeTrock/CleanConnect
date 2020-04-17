import React from "react";
import { NavLink, Redirect } from "react-router-dom";

import Joi from "joi-browser";

import Form from "../components/form";
import Layout from "../components/layout";
import Items from "../components/items";
import { CallbackPopupContainer } from "../components/popupContainer";
import { NavbarPagination } from "../components/pagination";

import * as auth from "../services/inventoryAuthentication";
import { paginate } from "../services/pagination";

class Inventory extends Form {
  state = {
    //data stored in the form
    inventories: [],
    displayNew: false,
    displayItems: true,
    data: {
      name: "",
    },
    items: [],
    currentPage: 1,
    pageSize: 3,
  };
  schema = {
    name: Joi.string().required(),
  };
  async componentDidMount() {
    await this.setInventory();
  }
  async unMount(id) {
    this.setState({ displayItems: false, displayNew: false });
    await this.setInventory(id);
    this.setState({ displayItems: true });
  }
  async setInventory(id) {
    const { user } = this.props;
    const { token } = this.props.match.params;
    if (!id) id = this.props.match.params.id;
    let inventories = "";
    try {
      if (user) {
        const request = await auth.getAllInventories();
        inventories = request.data;
        if (id) {
          let name = "";
          let items = "";
          for (let i = 0; i < inventories.length; i++) {
            if (id === inventories[i]._id) {
              name = inventories[i].name;
              items = inventories[i].items;
            }
          }
          if (!name) this.setState({ verified: false });
          else this.setState({ name, items });
        }
      } else {
        const request = await auth.getAnonInventories(token);
      }
      this.setState({ inventories });
    } catch (e) {
      console.log(e);
      this.setState({ redirect: "/notFound" });
    }
    this.forceUpdate();
  }
  newInventory = async (event) => {
    event.preventDefault();
    const { data } = this.state;
    const success = await auth.newInventory(data.name);
    if (success) window.location.reload(true);
  };
  editInventory = async (event) => {
    event.preventDefault();
    const { data } = this.state;
    const { id } = this.props.match.params;
    const success = await auth.editInventory(data.name, id);
    if (success) window.location.reload(true);
  };
  deleteInventory = async () => {
    const { id } = this.props.match.params;
    const success = await auth.deleteInventory(id);
    if (success) window.location.href = "/inventory";
  };
  onPageChange = (difference) => {
    let { currentPage } = this.state;
    this.setState({ currentPage: currentPage + difference });
  };
  render() {
    const {
      inventories,
      displayNew,
      displayItems,
      name,
      items,
      currentPage,
      pageSize,
      redirect,
    } = this.state;
    const { token, id } = this.props.match.params;
    const { user } = this.props;
    let layoutName = name ? name : "";
    let sortedInventories = paginate(inventories, currentPage, pageSize);
    let customBehavior = (inventory) => {
      //customBehavior/emptyBehavior for navbar
      let navId = inventory._id;
      return (
        <NavLink
          className="nav-item nav-link"
          to={"/inventory/" + token + "/" + navId}
          key={inventory._id}
          onClick={() => this.unMount(inventory._id)}
        >
          {inventory.name}
        </NavLink>
      );
    };
    let emptyBehavior = () => {
      return (
        <div
          className=" ml-auto mr-auto nav-item nav-link"
          style={{ cursor: "pointer" }}
          onClick={() => {
            this.setState({ displayNew: !displayNew });
          }}
        >
          New
        </div>
      );
    };
    customBehavior = customBehavior.bind(this);
    emptyBehavior = emptyBehavior.bind(this);
    if (redirect)
      return (
        <Redirect
          to={{
            pathname: redirect,
          }}
        />
      );
    return (
      <Layout name={"Inventory " + layoutName}>
        <NavbarPagination
          pageSize={pageSize}
          currentPage={currentPage}
          items={sortedInventories}
          onPageChange={this.onPageChange}
          customBehavior={customBehavior}
          emptyBehavior={emptyBehavior}
        />
        <div className="mb-5">
          {displayNew && ( //For creating inventory
            <form onSubmit={this.newInventory}>
              {this.renderInput({
                name: "name",
                label: "Name",
              })}
              {this.renderButton("Submit")}
            </form>
          )}
          {id &&
          user &&
          !displayNew && ( //For editing inventory
              <div className="border">
                <h1 className="label" style={{ textAlign: "center" }}>
                  Control Board
                </h1>
                <div
                  style={{
                    display: "flex",
                    padding: "1vw",
                  }}
                >
                  <div className="ml-auto mr-auto" style={{ display: "flex" }}>
                    <form
                      style={{ display: "flex" }}
                      onSubmit={this.editInventory}
                    >
                      {this.renderInput({
                        name: "name",
                        placeHolder: "Name...",
                      })}
                      <div>{this.renderButton("Edit Inventory Name")}</div>
                    </form>
                    <div>
                      <CallbackPopupContainer
                        triggerText="Delete Inventory"
                        customText={`This will permanently delete the inventory titled: ${name}. Proceed?`}
                        callbackRoute={this.deleteInventory}
                        triggerType="button"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>
        {id && !displayNew && name && displayItems && (
          <div>
            <Items {...this.props} name={name} items={items} id={id} />
          </div>
        )}
      </Layout>
    );
  }
}

export default Inventory;
