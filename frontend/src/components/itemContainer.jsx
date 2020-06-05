import React from "react";

import Joi from "joi-browser";

import Item from "../components/item";
import { CallbackPopupContainer } from "../components/popupContainer";
import { BooleanSelect } from "../components/select";
import { ButtonPagination } from "../components/pagination";

import { paginate } from "../services/pagination";
import * as auth from "../services/inventoryAuthentication";

import { itemLimit } from "../converters/limits";

/*
ItemContainer contains a new item form
and a control panel that allows you to edit the inventory, 
set if you want to see dead items, and manipulates editing quantities/descriptions.
Has a parent inventory where it gets it's inventory and child item which it passes an item to.
*/

class ItemContainer extends Item {
  state = {
    //data stored in the form
    data: {
      inventory: "",
      name: "",
      curQuant: "",
      minQuant: 0,
      maxQuant: "",
    },
    errors: [],
    displayDetails: "No",
    displayChild: true,
    currentPage: 1,
    pageSize: 10,
  };
  schema = {
    newItem: {
      name: Joi.string().required(),
      curQuant: Joi.number().required(),
      minQuant: Joi.number().allow("").optional(),
      maxQuant: Joi.number().allow("").optional(),
    },
    changeInventory: {
      inventory: Joi.string().required(),
    },
  };
  componentDidMount() {}

  setDead = async (viewDead) => {
    await this.props.updateDead(this.props.match.params.id, viewDead);
  };
  setDetails = async (displayDetails) => {
    await this.setState({ displayDetails, displayChild: false });
    this.setState({ displayChild: true });
  };
  editInventory = async (event) => {
    event.preventDefault();
    try {
      const { data } = this.state;
      const { id } = this.props.match.params;
      const success = await auth.editInventory(data.inventory, id);
      if (success) window.location.reload(true);
    } catch (ex) {
      const errors = { ...this.state.errors };
      errors.inventory = ex.response.data.details.name;
      this.setState({ errors });
    }
  };
  deleteInventory = async () => {
    const { id } = this.props.match.params;
    const success = await auth.deleteInventory(id);
    if (success) window.location.href = "/inventory";
  };
  submitEmpty = async (event) => {
    event.preventDefault();
    try {
      const { data } = this.state;
      const id = this.props.match.params.id;
      const success = await auth.newItem(data, id);
      if (success) window.location.reload(true);
    } catch (ex) {
      const errors = { ...this.state.errors };
      const { details } = ex.response.data;
      errors.name = details.name;
      errors.curQuant = details.curQuant;
      errors.minQuant = details.minQuant;
      errors.maxQuant = details.maxQuant;
      this.setState({ errors });
    }
    //submit empty value
  };
  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };
  render() {
    const {
      errors,
      currentPage,
      pageSize,
      displayDetails,
      displayChild,
    } = this.state;
    const { user, currentInventory } = this.props;
    const { name, items } = currentInventory;
    const sortedItems = paginate(items, currentPage, pageSize);
    return (
      <div>
        <div className="border mb-5">
          <h1 className="label mb-2" style={{ textAlign: "center" }}>
            Control Board
          </h1>
          {user && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <form style={{ display: "flex" }} onSubmit={this.editInventory}>
                {this.renderInput({
                  name: "inventory",
                  error: errors.inventory,
                  placeHolder: "Name...",
                })}
                <div>
                  {this.renderButton({
                    label: "Edit Inventory Name",
                    schema: this.schema["changeInventory"],
                  })}
                </div>
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
          )}
          <BooleanSelect
            text="Show dead inventory items?"
            callback={this.setDead.bind(this)}
          />
          <BooleanSelect
            text="Edit item details?"
            callback={this.setDetails.bind(this)}
          />
        </div>

        {sortedItems && //items to be displayed
          displayChild &&
          sortedItems.map(
            function (item) {
              return (
                <Item
                  {...this.props}
                  item={item}
                  key={item._id}
                  displayDetails={displayDetails}
                />
              );
            }.bind(this)
          )}

        <ButtonPagination
          itemsCount={items.length}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={this.handlePageChange}
        />

        {user &&
        sortedItems &&
        sortedItems.length < itemLimit(user) && ( //creating new item
            <form onSubmit={this.submitEmpty} className="pageText">
              <div style={{ display: "flex" }}>
                {this.renderInput({
                  name: "name",
                  label: "Name",
                  placeHolder: "Enter name...",
                  error: errors.name,
                })}
                {this.renderInput({
                  name: "curQuant",
                  label: "Value",
                  placeHolder: "Enter value (optional)...",
                  error: errors.curQuant,
                })}
                {this.renderInput({
                  name: "minQuant",
                  label: "Minimum",
                  placeHolder: "Enter min (optional)...",
                  error: errors.minQuant,
                })}
                {this.renderInput({
                  name: "maxQuant",
                  label: "Maximum",
                  placeHolder: "Enter max (optional)...",
                  error: errors.maxQuant,
                })}
              </div>
              {this.renderButton({
                label: "Create New",
                schema: this.schema["newItem"],
              })}
            </form>
          )}
      </div>
    );
  }
}

export default ItemContainer;
