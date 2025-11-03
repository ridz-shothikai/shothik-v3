"use client";

import useSnackbar from "@/hooks/useSnackbar";
import { useVerifyEmailMutation } from "@/redux/api/auth/authApi";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function VerifyEmailPage() {
  const { token } = useParams();
  const router = useRouter();
  const enqueueSnackbar = useSnackbar(); // Initialize useSnackbar
  const [verifyEmail, { isLoading, isSuccess, isError, error }] =
    useVerifyEmailMutation();

  useEffect(() => {
    if (token) {
      verifyEmail({ key: token });
    }
  }, [token, verifyEmail]);

  useEffect(() => {
    if (isSuccess) {
      // console.log("Email verification successful!");
      enqueueSnackbar("Email verification successful!", { variant: "success" });
      setTimeout(() => {
        router.push("/");
      }, 0);
    }

    if (isError) {
      // console.error("Email verification failed:", error);
      if (error?.data?.message === "Invalid or expired token") {
        enqueueSnackbar(
          "Token expired. Please request a new verification email.",
          { variant: "error" },
        );
      } else {
        enqueueSnackbar("Email verification failed. Please try again.", {
          variant: "error",
        });
      }
      setTimeout(() => {
        router.push("/");
      }, 2500);
    }
  }, [isSuccess, isError, error, router, enqueueSnackbar]);

  return null;
}
