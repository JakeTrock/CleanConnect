import React from "react";

import Joi from "joi-browser";

import Form from "./form";
import { CallbackPopupContainer } from "./popupContainer";

import * as auth from "../services/inventoryAuthentication";

/*
Item contains a form to edit the various parts of an item,
including the capability to edit the quantity or the details,
as well as the ability to delete an item.
Has parents ItemContainer and Inventory where it gets it's item from.
*/

class Item extends Form {
  state = {
    //data stored in the form
    data: {
      //schema for creating new item
    },
    itemList: [],
    errors: [],
    displayDetails: "",
  };
  schema = {};
  componentDidMount() {
    this.setItem();
  }
  setItem() {
    const { item, displayDetails } = this.props;
    //adding item to schema / data
    let { data } = this.state;
    const uniqueItem = "Item " + item.name;
    const uniqueName = "Name " + item.name;
    const uniqueMax = "Max " + item.name;
    const uniqueMin = "Min " + item.name;
    if (displayDetails === "No") {
      this.schema[uniqueItem] = Joi.number().required();
      data[uniqueItem] = item.curQuant;
    } else {
      this.schema[uniqueName] = Joi.string().required();
      this.schema[uniqueMax] = Joi.number().allow("").optional();
      this.schema[uniqueMin] = Joi.number().allow("").optional();
      data[uniqueName] = item.name;
      data[uniqueMax] = item.maxQuant;
      data[uniqueMin] = item.minQuant;
    }
    this.setState({
      data,
      displayDetails,
      uniqueItem,
      uniqueName,
      uniqueMax,
      uniqueMin,
    });
  }

  updateItem = async (event, itemId, quantity) => {
    event.preventDefault();
    const { id } = this.props.match.params;
    const success = await auth.updateItem(itemId, id, quantity);
    if (success) window.location.reload(true);
  };
  updateItemDetails = async (event, itemId, data) => {
    event.preventDefault();
    const { id } = this.props.match.params;
    const { uniqueName, uniqueMax, uniqueMin } = data;
    const success = await auth.updateItemDetails(
      itemId,
      id,
      uniqueName,
      uniqueMax,
      uniqueMin
    );
    //if (success) window.location.reload(true);
  };

  changeItemState = async (data) => {
    //changes from dead to restored and vice versa
    let { itemId, markedForDeletion } = data;
    let { id } = this.props.match.params;
    let success = "";
    if (markedForDeletion) success = await auth.restoreItem(itemId, id);
    else success = await auth.deleteItem(itemId, id);
    if (success) window.location.reload(true);
  };

  render() {
    const { data, errors } = this.state;
    const { uniqueItem, uniqueName, uniqueMax, uniqueMin } = this.state;
    const { item, displayDetails } = this.props;

    //displaying item without updating details
    if (displayDetails === "No" && data.hasOwnProperty(uniqueItem))
      return (
        <div key={item._id} className="mb-3">
          <form
            style={{ display: "inline-block" }}
            onSubmit={(event) =>
              this.updateItem(event, item._id, data[uniqueItem])
            }
          >
            {this.renderStep({
              name: uniqueItem,
              label: item.name,
              value: data[uniqueItem],
              min: item.minQuant,
              max: item.maxQuant,
              error: errors[uniqueItem],
            })}
            {this.renderButton({
              label: "Update",
              schema: this.schema,
            })}
            <CallbackPopupContainer
              triggerText={(item.markedForDeletion && "Restore") || "Delete"}
              customText={`This will permanently delete the item titled: ${item.name}. Proceed?`}
              callbackRoute={this.changeItemState}
              callbackData={{
                itemId: item._id,
                markedForDeletion: item.markedForDeletion,
              }}
              triggerType="button"
            />
          </form>
        </div>
      );
    else if (data.hasOwnProperty(uniqueName))
      return (
        <div key={item._id} className="mb-3">
          <form
            onSubmit={(event) => this.updateItemDetails(event, item._id, data)}
          >
            <div style={{ display: "flex" }}>
              {[
                [uniqueName, "Name"],
                [uniqueMin, "Minimum"],
                [uniqueMax, "Maximum"],
              ].map(
                function (identifier) {
                  return (
                    <div key={identifier[0]}>
                      {this.renderInput({
                        name: identifier[0],
                        label: identifier[1],
                        error: errors[identifier[0]],
                        value: data[identifier[0]],
                      })}
                    </div>
                  );
                }.bind(this)
              )}
            </div>
            {this.renderButton({
              label: "Update",
              schema: this.schema,
            })}
          </form>
        </div>
      );
    return null;
  }
}

export default Item;
