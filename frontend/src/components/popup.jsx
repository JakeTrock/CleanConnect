import React from "react";
import Popup from "reactjs-popup";

const PopupContainer = () => {
  return (
    <Popup trigger={<button> Trigger</button>} position="right center" modal>
      <div>A</div>
    </Popup>
  );
};

export default PopupContainer;
