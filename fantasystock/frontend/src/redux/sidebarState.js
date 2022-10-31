import { createSlice } from "@reduxjs/toolkit";

export const sidebarStateSlice = createSlice({
  name: "sidebarState",
  initialState: {
    value: false,
  },
  reducers: {
    toggle: (state) => {
      state.value = !state.value;
    },
  },
});

export const { toggle } = sidebarStateSlice.actions;

export default sidebarStateSlice.reducer;
