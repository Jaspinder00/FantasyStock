import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function League() {
  const { id } = useParams();
  const [show, setShow] = useState(false);
  const [data, setData] = useState({
    commentsection: [String],
    end: Date,
    start: Date,
    host: String,
    players: [String],
    title: String,
    visibility: String,
  });

  useEffect((event) => {
    axios
      .get(`/league/${id}`)
      .then((response) => {
        setData({
          commentsection: response.data.commentsection,
          end: response.data.end,
          start: response.data.start,
          host: response.data.host,
          players: response.data.players,
          title: response.data.title,
          visibility: response.data.visibility,
        });
        setShow(true);
      })
      .catch((error) => {
        setShow(false);
        console.log(error);
      });
  }, []);

  return (
    <div>
      <div>{`Title: ${data.title}`}</div>
      <div>{`host: ${data.host}`}</div>
      <div>{`Visibility: ${data.visibility}`}</div>
      <div>{`start: ${data.start}`}</div>
      <div>{`end: ${data.end}`}</div>
      <div>
        <input type="button" value="Join :P" />
      </div>
      <div style={{ marginTop: "4rem" }}>Players</div>
      {show &&
        data.players.map((player, index) => {
          return (
            <div key={index} style={{ marginTop: "1rem" }}>
              <div>{`Player: ${player.player}`}</div>
              <div style={{ marginTop: "1rem" }}>
                Stocks
                {player.stocks.map((stock, index) => {
                  return (
                    <div key={index}>
                      {stock.ticker} {stock.quantity} {stock.position}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
    </div>
  );
}

export default League;
