import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Home.css";
import moment from "moment";

function Home() {
  const [articles, setArticles] = useState([]);

  useEffect((event) => {
    axios
      .get(`/news`)
      .then((response) => {
        setArticles(response.data.reverse());
        // console.log(response.data);
      })
      .catch((error) => {});
  }, []);

  return (
    <div id="homePage">
      {articles.map((article, index) => (
        <div className="articleCard" key={`uniqueId${index}`}>
          <a className="articleCardA" href={article.url} target="_blank">
            <img
              className="articleCardImage"
              src={article.urlToImage}
              alt="Article"
            />{" "}
          </a>
          <div className="articleBody">
            <div className="articleHeader">{article.title}</div>
            <div className="articleCreatedAt">
              {moment(article.publishedAt).fromNow()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Home;
