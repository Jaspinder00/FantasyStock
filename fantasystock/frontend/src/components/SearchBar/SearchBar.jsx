import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import "./SearchBar.css";

function SearchBar(props) {
  return (
    <form className="NavbarForm">
      <input
        type="search"
        placeholder="Search for a League"
        aria-label="Search"
      />
      <button type="submit">
        <FontAwesomeIcon icon={faMagnifyingGlass} />
      </button>
    </form>
  );
}

export default SearchBar;
