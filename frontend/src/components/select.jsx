import React from "react";

export const BooleanSelect = (props) => {
  const { text, callback, value } = props;
  let selected = "No";
  if (value === true) selected = "Yes";
  //const parameters = props.parameters;
  return (
    <div style={{ textAlign: "center" }}>
      <h2>{text}</h2>
      <select
        defaultValue={selected}
        onChange={(event) => {
          //if (parameters) callback(parameters, event.target.value);
          callback(event.target.value);
        }}
      >
        <option value="No">No</option>
        <option value="Yes">Yes</option>
      </select>
    </div>
  );
};
