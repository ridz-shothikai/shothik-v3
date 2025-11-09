"use client";

import {
  useGetUserLimitQuery,
  useGetUserQuery,
  useLoginMutation,
} from "@/redux/api/auth/authApi";
import { setShowLoginModal, setShowRegisterModal } from "@/redux/slices/auth";
import { useGoogleOneTapLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useDispatch, useSelector } from "react-redux";

const AuthApplier = () => {
  const dispatch = useDispatch();
  const { user, accessToken } = useSelector((state) => state.auth);
  const { isLoading } = useGetUserQuery(undefined, {
    skip: !accessToken,
  });
  useGetUserLimitQuery();

  const [login] = useLoginMutation();

  useGoogleOneTapLogin({
    onSuccess: async (res) => {
      try {
        const { email, name } = jwtDecode(res.credential);

        const response = await login({
          auth_type: "google",
          googleToken: res.credential,
          oneTapLogin: true,
          oneTapUser: {
            email,
            name,
          },
        });

        if (response?.data) {
          dispatch(setShowRegisterModal(false));
          dispatch(setShowLoginModal(false));
        }
      } catch (error) {
        console.error(error);
      }
    },
    flow: "auth-code",
    onError: (err) => {
      console.error(err);
    },
    scope: "email profile",
    disabled: isLoading || user?.email,
  });

  return null;
};

export default AuthApplier;
