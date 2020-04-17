import React from "react";
import _ from "lodash";

export const ButtonPagination = ({
  itemsCount,
  pageSize,
  currentPage,
  onPageChange,
}) => {
  const pagesCount = Math.ceil(itemsCount / pageSize);
  if (pagesCount === 1) return null;
  const pages = _.range(1, pagesCount + 1);

  return (
    <nav>
      <ul className="pagination justify-content-center">
        {pages.map((page) => (
          <li
            key={page}
            className={page === currentPage ? "page-item active" : "page-item"}
          >
            <div
              className="page-link"
              style={{ marginLeft: "auto" }}
              onClick={() => onPageChange(page)}
            >
              {page}
            </div>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export const NavbarPagination = ({
  pageSize,
  currentPage,
  onPageChange,
  items,
  customBehavior,
  emptyBehavior,
}) => {
  return (
    <nav
      className="navbar navbar-expand-lg bg-light mb-4"
      style={{ borderBottom: "1px solid black" }}
    >
      {currentPage > 1 && <div onClick={() => onPageChange(-1)}>&lt;</div>}
      {items &&
        items.map(function (item) {
          return (
            <div key={item.name} className="ml-auto mr-auto">
              {customBehavior(item)}
            </div>
          );
        })}
      {emptyBehavior && (
        <div className="ml-auto mr-auto">{emptyBehavior()}</div>
      )}
      {currentPage < pageSize && (
        <div className="ml-auto" onClick={() => onPageChange(1)}>
          &gt;
        </div>
      )}
    </nav>
  );
};

//export default Pagination;
