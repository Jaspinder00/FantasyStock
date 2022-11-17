import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CreateLeague.css";
import { useNavigate } from "react-router-dom";

function Home() {
  const [visibility, setVisibility] = useState("Public");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [title, setTitle] = useState("");

  const [stk, setStk] = useState("");
  const [qnt, setQnt] = useState(1);
  const [pos, setPos] = useState("Long");

  const [stkList, setstkList] = useState([]);
  const [tickers, setTickers] = useState([]);

  const navigate = useNavigate();

  const createLeague = () => {
    const rightnow = new Date();
    const start1 = new Date(start);
    const end1 = new Date(end);

    if (
      title === undefined ||
      typeof title !== "string" ||
      stkList.length === 0 ||
      (visibility.toLowerCase() !== "public" &&
        visibility.toLowerCase() !== "private") ||
      start === undefined ||
      typeof start !== "string" ||
      end === undefined ||
      typeof end !== "string" ||
      start1 <= rightnow ||
      start1 >= end1
    ) {
      console.log("fill everything out");

      return;
    }
    axios
      .post("/league/create", {
        start,
        end,
        title,
        visibility: visibility.toLowerCase(),
        stocks: stkList.map((aStock) => {
          return {
            stock: aStock.stock,
            quantity: aStock.quantity,
            position: aStock.position.toLowerCase(),
          };
        }),
      })
      .then((e) => {
        console.log(e.data);
        navigate(`/league/${e.data.leagueID}`);
      });
  };

  useEffect((event) => {
    axios
      .get(`/price/tickers`)
      .then((response) => {
        setTickers(response.data);
      })
      .catch((error) => {});
  }, []);

  const stash = (env) => {
    if (stk === "") return;

    setstkList((prev) => [
      ...prev,
      { stock: stk, quantity: qnt, position: pos },
    ]);
    setStk("");
    setQnt(1);
    setPos("Long");
  };

  const deleteStk = (index) => {
    setstkList((prev) => {
      const thing = [...prev];
      thing.splice(index, 1);
      return thing;
    });
  };

  return (
    <div id="CreateLeague">
      <div id="CL">
        <div id="CLTitle">
          <label htmlFor="clTitle">Title</label>
          <input
            id="clTitle"
            type="textbox"
            onChange={(e) => {
              setTitle(e.target.value);
            }}
            value={title}
          />
        </div>
        <div id="CLVisibility">
          <label htmlFor="visibility">League</label>
          <select
            id="visibility"
            onChange={(e) => setVisibility(e.target.value)}
          >
            <option>Public</option>
            <option>Private</option>
          </select>
        </div>
        <div id="CLStart">
          <label htmlFor="start">Start</label>
          <input
            id="start"
            type="date"
            onChange={(e) => {
              setStart(e.target.value);
            }}
            value={start}
          />
        </div>
        <div id="CLEnd">
          <label htmlFor="end">End</label>
          <input
            id="end"
            type="date"
            onChange={(e) => {
              setEnd(e.target.value);
            }}
            value={end}
          />
        </div>
      </div>
      <div id="LeagueJoinStocks">
        <h4>Stocks</h4>
        <div>
          <div id="StockOptSelect">
            <label htmlFor="clTicker">Ticker:</label>
            <input
              id="clTicker"
              type="text"
              list="data"
              onChange={(e) => {
                setStk(e.target.value);
              }}
              value={stk}
              placeholder="Pick a stock"
            />
            <datalist id="data">
              {tickers.map((item, key) => (
                <option key={key} value={item} />
              ))}
            </datalist>

            <label htmlFor="clQuantity">Quantity:</label>
            <input
              id="clQuantity"
              type="number"
              min="1"
              max="999"
              onChange={(e) => {
                setQnt(e.target.value);
              }}
              value={qnt}
            />

            <label htmlFor="clPosition">Position:</label>
            <select
              id="clPosition"
              onChange={(e) => setPos(e.target.value)}
              value={pos}
            >
              <option>Long</option>
              <option>Short</option>
            </select>

            <input type="button" value="Pick" onClick={stash} />
          </div>
        </div>
        <div id="StockOptList">
          <h4> My Stocks </h4>
          {stkList.map((aStock, index) => (
            <div className="MyStockOpt" key={index}>
              <p>
                {aStock.stock} {aStock.quantity} {aStock.position}
              </p>
              <input
                type="button"
                value="delete"
                onClick={() => deleteStk(index)}
              />
            </div>
          ))}
        </div>
      </div>

      <div id="CLcreate">
        <input type="button" value="Create League" onClick={createLeague} />
      </div>
    </div>
  );
}

export default Home;
