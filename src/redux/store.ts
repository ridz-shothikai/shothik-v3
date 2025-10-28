import { configureStore } from "@reduxjs/toolkit";
import settingReducer from "./slices/setting-slice";
import userReducer from "./slices/user-slice";

export const store = configureStore({
  reducer: {
    setting: settingReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
