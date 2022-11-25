import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SearchLeague.css";
import { Link, useParams } from "react-router-dom";

function SearchLeague(props) {
  const [results, setResults] = useState([]);

  const { id } = useParams();

  useEffect(
    (event) => {
      // console.log(id);
      // console.log(props);
      axios
        .get(`/league/search?page=1&search=${id}`)
        .then((response) => {
          setResults(response.data);
        })
        .catch((error) => console.log(error));
    },
    [id]
  );

  return (
    <div className="searchResultContainer">
      {results.map((league, index) => {
        return (
          <Link
            className="searchResult"
            key={index}
            to={`/league/${league._id}`}
          >
            <div className="searchResultTitle">{league.title}</div>
            <div className="searchResultHost">{`Host: ${league.host}`}</div>
          </Link>
        );
      })}
    </div>
  );
}

export default SearchLeague;
