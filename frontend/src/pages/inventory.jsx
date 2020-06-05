import React from "react";
import { NavLink, Redirect } from "react-router-dom";

import Layout from "../components/layout";
import ItemContainer from "../components/itemContainer";
import { NavbarPagination } from "../components/pagination";

import * as auth from "../services/inventoryAuthentication";
import { paginate } from "../services/pagination";

/*
Inventory contains new inventory form and a navbar for going through inventories
Has two children, itemContainer and items which it passes inventory data to
*/

class Inventory extends ItemContainer {
  state = {
    //data stored in the form
    inventories: [],
    displayNew: false,
    displayItems: true,
    data: {
      inventory: "",
    },
    errors: [],
    currentInventory: "",
    currentPage: 1,
    pageSize: 3,
  };

  async componentDidMount() {
    await this.setInventory();
  }
  async unMount(id) {
    //behavior is used in case user switches tabs with nav link, resetting the page for a new inventory
    this.setState({ displayItems: false, displayNew: false });
    await this.setInventory(id);
    this.setState({ displayItems: true });
  }
  async setInventory(id, viewDead) {
    const { user } = this.props;
    const { token } = this.props.match.params;
    if (!id) id = this.props.match.params.id;
    let viewDeadBool = false;
    if (viewDead === "Yes") viewDeadBool = true;
    this.setState({ viewDeadBool });
    let inventories = "";
    try {
      if (user) {
        const request = await auth.getAllInventories(viewDeadBool);
        inventories = request.data;
      } else {
        const request = await auth.getAnonInventories(token, viewDeadBool);
        inventories = request.data.inventory;
      }
      if (id) {
        let currentInventory = undefined;
        for (let i = 0; i < inventories.length; i++) {
          if (id === inventories[i]._id) {
            currentInventory = inventories[i];
          }
        }
        if (!currentInventory) this.setState({ redirect: "/notFound" });
        else this.setState({ currentInventory });
        //if (viewDead) return currentInventory;
        this.setState({ displayNew: false });
      } else this.setState({ displayNew: true });
      this.setState({ inventories });
    } catch (e) {
      this.setState({ redirect: "/notFound" });
    }
    if (!this.state.redirect) this.forceUpdate();
  }
  newInventory = async (event) => {
    event.preventDefault();
    const { data } = this.state;
    const success = await auth.newInventory(data.inventory);
    if (success) window.location.reload(true);
  };

  setDead = (viewDead) => {
    let inventories = this.setInventory(this.props.match.params.id, viewDead);
    return inventories;
  };
  onPageChange = (difference) => {
    let { currentPage } = this.state;
    this.setState({ currentPage: currentPage + difference });
  };
  render() {
    const {
      inventories,
      errors,
      displayNew,
      displayItems,
      currentInventory,
      currentPage,
      pageSize,
      redirect,
    } = this.state;
    const { name } = currentInventory;
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
            this.setState({ redirect: "/inventory" });
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
    else
      return (
        <Layout
          name={"Inventory " + layoutName}
          image={currentInventory && currentInventory.qrcode}
        >
          <NavbarPagination
            pageSize={pageSize}
            currentPage={currentPage}
            items={sortedInventories}
            onPageChange={this.onPageChange}
            customBehavior={customBehavior}
            emptyBehavior={user && emptyBehavior}
          />
          <div className="mb-5">
            {displayNew && ( //For creating inventory
              <form onSubmit={this.newInventory}>
                {this.renderInput({
                  name: "inventory",
                  error: errors.inventory,
                  label: "Name",
                })}
                {this.renderButton({
                  label: "Submit",
                  schema: this.schema["changeInventory"], //schema gotten from itemContainer
                })}
              </form>
            )}
          </div>
          {id && !displayNew && name && displayItems && (
            <ItemContainer
              {...this.props}
              currentInventory={currentInventory}
              updateDead={this.setInventory.bind(this)}
            />
          )}
        </Layout>
      );
  }
}

export default Inventory;
