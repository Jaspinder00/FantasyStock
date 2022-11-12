import React from "react";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import LoggedInBtn from "../../components/LoggedinBtn/LoggedinBtn";
import FloatingTab from "../../components/FloatingTab/FloatingTab";
import ClickableIcons from "../../components/ClickableIcons/ClickableIcons";
import { useSelector, useDispatch } from "react-redux";
import { toggle as fTabToggler } from "../../redux/fTabState";
import OutsideAlerter from "../../helpers/OutsideAlerter";

function LoginSet(props) {
  const fTabToggle = useSelector((state) => state.fTabState.value);
  const dispatch = useDispatch();
  return (
    <OutsideAlerter>
      <span>
        <LoggedInBtn onClick={() => dispatch(fTabToggler())} />
        {fTabToggle && <FloatingTab />}
        <ClickableIcons
          to="/league/create"
          icon={faPlus}
          design="createleague"
          hoverName="Create League"
          hoverDesign="hovertextbottom"
        />
      </span>
    </OutsideAlerter>
  );
}

export default LoginSet;
