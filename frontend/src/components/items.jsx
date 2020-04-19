import React from "react";

import Joi from "joi-browser";

import Form from "../components/form";
import { CallbackPopupContainer } from "../components/popupContainer";

import * as auth from "../services/inventoryAuthentication";
import { itemLimit } from "../converters/limits";
class Items extends Form {
  state = {
    //data stored in the form
    data: {
      //schema for creating new item
      name: "",
      value: "",
      min: 0,
      max: "",
    },
    itemList: [],
    errors: {},
    verified: true,
  };
  schema = {
    name: Joi.string().required(),
    value: Joi.number().required(),
    min: Joi.number().allow("").optional(),
    max: Joi.number().allow("").optional(),
  };
  componentDidMount() {
    const { items } = this.props;
    if (items) {
      //adding items to schema / data
      this.setState({ itemList: items });
      let { data } = this.state;
      items.forEach(function (item, index) {
        this.schema["item" + item.name] = Joi.number().allow("").optional();
        data["item" + item.name] = item.curQuant;
      }, this);
      this.setState({ data });
    }
  }
  submitEmpty = async (event) => {
    event.preventDefault();
    const { data } = this.state;
    const id = this.props.match.params.id;
    const success = await auth.newItem(data, id);
    if (success) window.location.reload(true);
    else {
      let fixLater = "yes";
    }
    //submit empty value
  };
  updateItem = async (event, itemId, quantity) => {
    event.preventDefault();
    let { id } = this.props.match.params;
    await auth.updateItem(itemId, quantity, id);
  };
  deleteItem = async (itemId) => {
    let { id } = this.props.match.params;
    console.log(itemId, id);
    const success = await auth.deleteItem(itemId, id);
    if (success) window.location.reload(true);
  };

  render() {
    const { errors } = this.state;
    const { data, itemList } = this.state;
    const { user } = this.props;
    //if (this.state.verified === false) return <Redirect to="/" />;

    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          {itemList.map(function (item) {
            //displaying items
            const uniqueName = "item" + item.name;
            this.schema[uniqueName] = Joi.number().required();
            let itemError = this.validateProperty(uniqueName, data[uniqueName]);
            this.schema[uniqueName] = Joi.number().allow("").optional();
            let disabled = itemError !== null;
            return (
              <div key={item._id}>
                {this.renderStep({
                  name: uniqueName,
                  label: item.name,
                  value: data[uniqueName],
                  min: item.minQuant,
                  max: item.maxQuant,
                  error: itemError,
                })}
                {this.renderButton(
                  "Update",
                  (event) => this.updateItem(event, item._id, data[uniqueName]),
                  disabled
                )}
                <CallbackPopupContainer
                  triggerText="Delete"
                  customText={`This will permanently delete the item titled: ${item.name}. Proceed?`}
                  callbackRoute={this.deleteItem}
                  callbackData={item._id}
                  triggerType="button"
                />
              </div>
            );
          }, this)}
        </form>
        {itemList.length < itemLimit(user) && ( //creating new item
          <form onSubmit={this.submitEmpty} className="pageText">
            <div style={{ display: "flex" }}>
              {this.renderInput({
                name: "name",
                label: "Name",
                placeHolder: "Enter name...",
                error: errors.name,
              })}
              {this.renderInput({
                name: "value",
                label: "Value",
                placeHolder: "Enter value...",
                error: errors.value,
              })}
              {this.renderInput({
                name: "min",
                label: "Minimum",
                placeHolder: "Enter min (optional)...",
                error: errors.min,
              })}
              {this.renderInput({
                name: "max",
                label: "Maximum",
                placeHolder: "Enter max (optional)...",
                error: errors.max,
              })}
            </div>
            {this.renderButton("Create New")}
          </form>
        )}
      </div>
    );
  }
}

export default Items;
