import {
  clearUser as clearUserSlice,
  setUser as setUserSlice,
} from "@/redux/slices/user-slice";
import type { AppDispatch, RootState } from "@/redux/store";
import type { TUserState } from "@/types/state.type";
import { useDispatch, useSelector } from "react-redux";

const useUser = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user);

  const setUser = (payload: TUserState) => dispatch(setUserSlice(payload));

  const clearUser = () => dispatch(clearUserSlice());

  return { isLoading: false, user, setUser, clearUser };
};

export default useUser;
