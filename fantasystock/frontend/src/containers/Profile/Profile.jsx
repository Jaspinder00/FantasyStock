import React, { useEffect, useState } from "react";
import axios from "axios";
import BtnIcons from "../../components/BtnIcon/BtnIcon";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import "./Profile.css";
import { ReactComponent as Crown } from "../../assets/crown.svg";
import { ReactComponent as Amazon } from "../../assets/amazon.svg";
import { ReactComponent as Apple } from "../../assets/apple.svg";
import { ReactComponent as Google } from "../../assets/google.svg";
import { ReactComponent as Ibm } from "../../assets/ibm.svg";
import { ReactComponent as Intel } from "../../assets/intel.svg";
import { ReactComponent as Meta } from "../../assets/meta.svg";
import { ReactComponent as Microsoft } from "../../assets/microsoft.svg";
import { ReactComponent as Nvidia } from "../../assets/nvidia.svg";
import { ReactComponent as Tesla } from "../../assets/tesla.svg";
import InlineUser from "../../components/InlineUser/InlineUser";

function Profile(props) {
  const [data, setData] = useState({
    displayName: String,
    photo: String,
    id: String,
    bio: String,
    username: String,
    activeIcon: String,
    iconList: [String],
  });
  const [show, setShow] = useState(false);
  const [editable, setEditable] = useState(false);

  const iconCollection = [
    { name: "crown", item: <Crown className="userIcon" /> },
    { name: "amazon", item: <Amazon className="userIcon" /> },
    { name: "apple", item: <Apple className="userIcon" /> },
    { name: "google", item: <Google className="userIcon" /> },
    { name: "ibm", item: <Ibm className="userIcon" /> },
    { name: "intel", item: <Intel className="userIcon" /> },
    { name: "meta", item: <Meta className="userIcon" /> },
    { name: "microsoft", item: <Microsoft className="userIcon" /> },
    { name: "nvidia", item: <Nvidia className="userIcon" /> },
    { name: "tesla", item: <Tesla className="userIcon" /> },
  ];

  useEffect((event) => {
    axios
      .get(`/register/profile`)
      .then((response) => {
        // console.log(response.data);
        setData({
          displayName: response.data.displayName,
          photo: response.data.photo,
          id: response.data._id,
          bio: response.data.bio,
          username: response.data.username,
          activeIcon: response.data.activeIcon,
          icons: response.data.icons,
        });
        setShow(true);
      })
      .catch((error) => {
        setShow(false);
      });
  }, []);

  const sendPatch = () => {
    if (
      data.username.length <= 32 &&
      data.bio.length <= 300 &&
      data.username.length >= 1 &&
      data.bio.length >= 1
    ) {
      axios.patch("/register/edit", {
        username: data.username,
        bio: data.bio,
        activeIcon: data.activeIcon,
      });
      toggleEdit();
    }
  };

  const toggleEdit = () => setEditable(!editable);

  const editUsername = (e) =>
    setData((prev) => ({ ...prev, username: e.target.value }));

  const editBio = (e) => setData((prev) => ({ ...prev, bio: e.target.value }));

  return (
    <div className="mainProfileContainer">
      {show && (
        <div>
          <div className="profilePicContainer">
            <div className="profilePic">
              <img
                src={data.photo}
                referrerPolicy="no-referrer"
                alt="profile"
              />
              <span className="editBtn">
                <BtnIcons
                  icon={faPencil}
                  name=""
                  design="VerticalNavbarIcons2"
                  onClick={toggleEdit}
                />
              </span>
            </div>
          </div>
          {editable ? (
            <form id="editProfile">
              <span id="namelmt">Edit Name (32 characters max)</span>
              <div id="editProfileName">
                <input
                  type="textbox"
                  placeholder="Username"
                  maxlength="32"
                  onChange={editUsername}
                  text={data.username}
                  value={data.username}
                />
              </div>
              <span id="biolmt">Edit Bio (300 characters max)</span>
              <div id="editProfileBio">
                <textarea
                  rows="4"
                  cols="50"
                  placeholder="Bio"
                  maxlength="300"
                  onChange={editBio}
                  text={data.bio}
                  value={data.bio}
                ></textarea>
              </div>
              <div id="editProfileIcon">
                <select
                  value={data.activeIcon}
                  onChange={(e) => {
                    setData((prev) => ({
                      ...prev,
                      activeIcon: e.target.value,
                    }));
                  }}
                >
                  {data.icons.map((icon, index) => (
                    <option key={index} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </div>
              <div id="editProfileSave">
                <button type="button" onClick={sendPatch}>
                  Save
                </button>
              </div>
            </form>
          ) : (
            <div>
              <InlineUser
                user={data.id}
                to={`/user/${data.id}`}
                aAlt={`${data.username}'s Profile`}
                design="circlePic"
                aSrc={data.photo}
                username={data.username}
              />
              <h3 id="profileIDstring">ID: {data.id}</h3>
              <p id="profileBio">{data.bio}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Profile;
