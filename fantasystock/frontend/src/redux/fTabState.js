import { createSlice } from "@reduxjs/toolkit";

export const fTabStateSlice = createSlice({
  name: "fTabState",
  initialState: {
    value: false,
  },
  reducers: {
    toggle: (state) => {
      state.value = !state.value;
    },
    on: (state) => {
      state.value = true;
    },
    off: (state) => {
      state.value = false;
    },
  },
});

export const { toggle, on, off } = fTabStateSlice.actions;

export default fTabStateSlice.reducer;
