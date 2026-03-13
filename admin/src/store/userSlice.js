import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userData: {
    id: null,
    name: "",
    auth: 0,
    loggedIn: false,
  }
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action) => {
      const { id, name, auth } = action.payload;
      state.userData.id = id;
      state.userData.name = name;
      state.userData.auth = auth;
      state.userData.loggedIn = true;
    },
    logout: (state) => {
      state.userData.id = null;
      state.userData.name = "";
      state.userData.auth = 0;
      state.userData.loggedIn = false;
      sessionStorage.removeItem("ud");
    },
  },
});

export const { login, logout } = userSlice.actions;
export const selectIsLoggedIn = (state) => state.user.userData.loggedIn;
export default userSlice.reducer;
