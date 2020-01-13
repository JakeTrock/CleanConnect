//create grids then unit containers
import React, { Component } from "react";
import _ from "lodash";

class Grid extends Component {
  componentDidMount() {
    this.customBehavior = this.props.customBehavior.bind(this);
    if (this.props.emptyBehavior)
      this.emptyBehavior = this.props.emptyBehavior.bind(this);
  }
  render() {
    let { items, idLocation } = this.props;
    items = _.chunk(items, 2);
    const { customBehavior, emptyBehavior } = this;
    return (
      <React.Fragment>
        {items.map(function(list, i) {
          return (
            <div className="row" key={i}>
              {list.map(function(item) {
                if (item.name)
                  return (
                    <React.Fragment key={item[idLocation]}>
                      {customBehavior(item)}
                    </React.Fragment>
                  );
                else if (emptyBehavior) {
                  return (
                    <React.Fragment key="empty">
                      {emptyBehavior()}
                    </React.Fragment>
                  );
                } else return "";
              })}
            </div>
          );
        })}
      </React.Fragment>
    );
  }
}
//<Unit key={item.id} item={item} />

export default Grid;
