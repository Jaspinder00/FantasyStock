import { configureStore } from "@reduxjs/toolkit";
import sidebarStateReducer from "./sidebarState";
import fTabStateReducer from "./fTabState";
import authStateReducer from "./authState";

export default configureStore({
  reducer: {
    sidebarState: sidebarStateReducer,
    fTabState: fTabStateReducer,
    authState: authStateReducer,
  },
});
