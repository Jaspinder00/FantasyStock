import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import InlineUser from "../../components/InlineUser/InlineUser";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./League.css";
import { useNavigate } from "react-router-dom";

function League() {
  const navigate = useNavigate();

  const [stk, setStk] = useState("");
  const [qnt, setQnt] = useState(1);
  const [pos, setPos] = useState("Long");

  const [comment, setComment] = useState("");
  const [editableComment, setEditableComment] = useState([]);
  const [editComment, setEditComment] = useState([]);

  const [reply, setReply] = useState([]);

  const [stkList, setstkList] = useState([]);
  const [tickers, setTickers] = useState([]);

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
    userInLeague: Boolean,
  });

  const updateData = () => {
    axios
      .get(`/league/${id}`)
      .then((response) => {
        if (!response.data.success) {
          console.log(response.data);
          navigate(`/league`);
        }
        setShow(true);
        let startDate = new Date(response.data.start);
        startDate = `${
          startDate.getUTCMonth() + 1
        }/${startDate.getUTCDate()}/${startDate.getUTCFullYear()}`;

        let endDate = new Date(response.data.end);
        endDate = `${
          endDate.getUTCMonth() + 1
        }/${endDate.getUTCDate()}/${endDate.getUTCFullYear()}`;

        setData({
          commentsection: response.data.commentsection.reverse(),
          end: endDate,
          start: startDate,
          host: response.data.host,
          players: response.data.players,
          title: response.data.title,
          visibility: response.data.visibility,
          userInLeague: response.data.userInLeague,
        });

        setEditableComment(
          new Array(response.data.commentsection.length).fill(false, 0)
        );
        setEditComment(
          response.data.commentsection.reverse().map((ele) => ele.comment)
        );
        setReply(new Array(response.data.commentsection.length).fill("", 0));

        setShow(true);
      })
      .catch((error) => {
        setShow(false);
        console.log(error);
      });
  };

  useEffect((event) => {
    updateData();

    axios
      .get(`/price/tickers`)
      .then((response) => {
        setTickers(response.data);
      })
      .catch((error) => {});
  }, []);

  const joinLeague = () => {
    axios
      .patch("/league/join", {
        stocks: stkList.map((aStock) => {
          return {
            stock: aStock.stock,
            quantity: aStock.quantity,
            position: aStock.position.toLowerCase(),
          };
        }),
        gameID: id,
      })
      .then((res) => {
        updateData();
      })
      .catch((e) => console.log(e));
  };

  const postComment = () => {
    if (comment === "") return;

    axios.patch("/league/comment", { gameID: id, comment }).then((e) => {
      updateData();
      setComment("");
    });
  };

  return (
    <div>
      <div id="LeagueDeetsHeader">
        <div className="LeagueTitle">{`${data.title}`}</div>
        <div className="LeagueDeets">
          <h4>
            Host:
            {show && (
              <InlineUser
                user={data.host._id}
                to={`/user/${data.host._id}`}
                aAlt={`${data.host.username}'s Profile`}
                design="circlePic"
                aSrc={data.host.photo}
                username={data.host.username}
              />
            )}
          </h4>
        </div>
        <div className="LeagueDeets">{`Visibility: ${data.visibility}`}</div>
        <div className="LeagueDeets">{`League Start: ${data.start}`}</div>
        <div className="LeagueDeets">{`League End: ${data.end}`}</div>
      </div>
      {!data.userInLeague && (
        <div id="LeagueJoinStocks">
          <h4>{`Join ${data.title}: Choose Stocks`}</h4>
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
      )}

      {!data.userInLeague && (
        <div id="JoinLeagueBtn">
          <input type="button" value="Join League" onClick={joinLeague} />
        </div>
      )}
      <h4 className="pl">{`${data.title} Players`}</h4>
      <div id="LeagueUsers">
        {show &&
          data.players.map((player, index) => {
            return (
              <div key={index} className="leagueUserCard">
                {show && (
                  <InlineUser
                    user={player.player._id}
                    to={`/user/${player.player._id}`}
                    aAlt={`${player.player.username}'s Profile`}
                    design="circlePic"
                    aSrc={player.player.photo}
                    username={player.player.username}
                  />
                )}
                <div className="leagueUserCardStocks">
                  <h4>{`${player.player.username}'s Stocks`}</h4>
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

      <div id="LeagueCommentSection">
        <h4>Comment Section</h4>
        <div id="LeagueCreateComment">
          <textarea
            id="LeagueComment"
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
            }}
            placeholder="Leave a Comment"
          />
          <input type="button" value="Post Comment" onClick={postComment} />
        </div>
        {show &&
          data.commentsection.map((data, index) => {
            return (
              <div key={index} className="LeagueComment">
                {show && (
                  <InlineUser
                    user={data.owner._id}
                    to={`/user/${data.owner._id}`}
                    aAlt={`${data.owner.username}'s Profile`}
                    design="circlePic"
                    aSrc={data.owner.photo}
                    username={data.owner.username}
                  />
                )}
                <div className="LeagueCommentData">{data.comment}</div>

                {data.isOwner && (
                  <span className="CommentEditBox">
                    {editableComment[index] && (
                      <div className="LeagueCommentEdit">
                        <textarea
                          onChange={(e) => {
                            editComment[index] = data.comment;
                            const tmpThing = editComment;
                            tmpThing[index] = e.target.value;
                            setEditComment([...tmpThing]);
                          }}
                          value={editComment[index]}
                        />
                        <input
                          type="button"
                          value="Edit Comment"
                          onClick={() => {
                            if (editComment[index] === "") return;

                            axios
                              .patch("/league/comment/edit", {
                                gameID: id,
                                commentID: data.commentID,
                                comment: editComment[index],
                              })
                              .then((e) => {
                                updateData();
                              });
                          }}
                        />
                      </div>
                    )}
                    <div className="CommentUpdateButtonBox">
                      <input
                        type="button"
                        value="Edit"
                        onClick={() => {
                          const tmpThing = editableComment;
                          tmpThing[index] = !tmpThing[index];
                          setEditableComment([...tmpThing]);
                        }}
                      />
                      <input
                        type="button"
                        value="Delete"
                        onClick={() =>
                          axios
                            .patch("/league/comment/delete", {
                              gameID: id,
                              commentID: data.commentID,
                            })
                            .then((e) => updateData())
                        }
                      />
                    </div>
                  </span>
                )}

                <div className="LeagueCommentReplySection">
                  <h4>Replies:</h4>
                  {data.replies.map((reply, index) => {
                    return (
                      <div key={index} className="LeagueCommentReply">
                        {show && (
                          <InlineUser
                            user={reply.replyowner._id}
                            to={`/user/${reply.replyowner._id}`}
                            aAlt={`${reply.replyowner.username}'s Profile`}
                            design="circlePic"
                            aSrc={reply.replyowner.photo}
                            username={reply.replyowner.username}
                          />
                        )}
                        <div className="LeagueCommentData">{reply.reply}</div>

                        {reply.isOwner && (
                          <span>
                            {editableComment[index] && (
                              <div>
                                <input
                                  type="button"
                                  value="Post Edit"
                                  onClick={() =>
                                    axios.patch("/league/comment/edit", {
                                      gameID: id,
                                      commentID: data.commentID,
                                      comment: editComment[index],
                                    })
                                  }
                                />
                              </div>
                            )}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="LeagueCreateCommentReply">
                  <textarea
                    onChange={(e) => {
                      const tmpThing = reply;
                      tmpThing[index] = e.target.value;
                      setReply([...tmpThing]);
                    }}
                    value={reply[index]}
                    placeholder="Leave a Reply"
                  />
                  <input
                    type="button"
                    value="Post Reply"
                    onClick={() => {
                      if (reply[index] === "") return;

                      axios
                        .patch("/league/comment/reply", {
                          gameID: id,
                          commentID: data.commentID,
                          comment: reply[index],
                        })
                        .then((e) => {
                          const tmpThing = reply;
                          tmpThing[index] = "";
                          setReply([...tmpThing]);
                          updateData();
                        });
                    }}
                  />
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default League;
