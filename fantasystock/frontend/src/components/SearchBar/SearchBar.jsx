import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import "./SearchBar.css";

function SearchBar(props) {
  const [search, setSearch] = useState("");

  return (
    <div className="NavbarForm">
      <input
        type="search"
        placeholder="Search for a League"
        aria-label="Search"
        onChange={(e) => {
          setSearch(e.target.value);
        }}
      />
      {search !== "" ? (
        <Link to={`/league/search/${search}`}>
          <button>
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
        </Link>
      ) : (
        <button>
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </button>
      )}
    </div>
  );
}

export default SearchBar;
