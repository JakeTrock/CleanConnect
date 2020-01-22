import React from "react";
import Popup from "reactjs-popup";

export const ImageContainer = props => {
  const trigger = props.trigger;
  const imgLink = props.imgLink;
  return (
    <Popup position="right center" trigger={trigger} modal>
      {close => (
        <div
          style={{
            border: "5px solid black",
            margin: "-6px"
          }}
        >
          <div>
            <div className="close" style={{ margin: "10px" }} onClick={close}>
              &times;
            </div>
            <img
              className="centerObj"
              style={{ maxHeight: "95vh" }}
              src={imgLink}
              alt=""
            />
          </div>
        </div>
      )}
    </Popup>
  );
};
export const DeletePopupContainer = props => {
  //const item = data.item;
  const triggerText = props.triggerText;
  const customText = props.customText;
  const deleteRoute = props.deleteRoute;
  const deleteData = props.deleteData;
  return (
    <Popup
      trigger={
        <div className="unitLink" href="">
          {triggerText}
        </div>
      }
      position="right center"
      modal
    >
      {close => (
        <div style={{ border: "5px solid black", margin: "-6px" }}>
          <div style={{ margin: "10px", overflow: "hidden" }}>
            <div className="close" onClick={close}>
              &times;
            </div>
            <h1>{customText}</h1>
            <button
              className="btn btn-danger"
              style={{
                borderRadius: "10px",
                display: "block",
                width: "30%",
                marginLeft: "auto",
                marginRight: "auto"
              }}
              onClick={() => {
                close();
                console.log(deleteData);
                deleteRoute(deleteData);
              }}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </Popup>
  );
};
