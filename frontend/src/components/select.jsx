import React from "react";

export const BooleanSelect = props => {
  const text = props.text;
  const callback = props.callback;
  return (
    <div style={{ textAlign: "center" }}>
      <h1>{text}</h1>
      <select onChange={event => callback(event.target.value)}>
        <option value="No">No</option>
        <option value="Yes">Yes</option>
      </select>
    </div>
  );
};
