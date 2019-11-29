//create grids then unit containers
import React, { Component } from "react";
import _ from "lodash";

class Grid extends Component {
  state = {
    items: []
  };
  componentDidMount() {
    let { items } = this.props.items;
    items = [
      { name: "A", id: 1 },
      { name: "", id: 2 },
      { name: "C", id: 3 },
      { name: "D", id: 4 }
    ];
    this.setState({ items: _.chunk(items, 2) });
    this.customBehavior = this.props.customBehavior.bind(this);
    this.emptyBehavior = this.props.emptyBehavior.bind(this);
  }
  render() {
    const { items } = this.state;
    const { customBehavior, emptyBehavior } = this;
    return (
      <React.Fragment>
        {items.map(function(list, i) {
          return (
            <div className="row" key={i}>
              {list.map(function(item) {
                if (item.name)
                  return (
                    <React.Fragment key={item.id}>
                      {customBehavior(item)}
                    </React.Fragment>
                  );
                else
                  return (
                    <React.Fragment key={item.id}>
                      {emptyBehavior(item)}
                    </React.Fragment>
                  );
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
