import api from "@/lib/api";
import type {
  AuthResponse,
  ChangePasswordPayload,
  ForgetPasswordPayload,
  ResetPasswordPayload,
  SignInPayload,
  SignUpPayload,
} from "@/types/auth.type";

// POST - Sign In
export async function signIn(payload: SignInPayload): Promise<AuthResponse> {
  const response = await api.post("/api/auth/signin", payload, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  return response.data as AuthResponse;
}

// POST - Sign Up
export async function signUp(payload: SignUpPayload): Promise<AuthResponse> {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("email", payload.email);
  formData.append("password", payload.password);
  if (payload.image) formData.append("image", payload.image);

  const response = await api.post("/api/auth/signup", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  });

  return response.data as AuthResponse;
}

// POST - Refresh Token
export async function refreshToken(): Promise<AuthResponse> {
  const response = await api.post("/api/auth/refresh-token", null, {
    withCredentials: true,
  });
  return response.data as AuthResponse;
}

// PATCH - Change Password
export async function changePassword(
  payload: ChangePasswordPayload,
): Promise<AuthResponse> {
  const response = await api.patch("/api/auth/change-password", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data as AuthResponse;
}

// POST - Forget Password
export async function forgetPassword(
  payload: ForgetPasswordPayload,
): Promise<AuthResponse> {
  const response = await api.post("/api/auth/forget-password", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data as AuthResponse;
}

// PATCH - Reset Password
export async function resetPassword(
  payload: ResetPasswordPayload,
): Promise<AuthResponse> {
  const response = await api.patch("/api/auth/reset-password", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data as AuthResponse;
}

// POST - Email Verification Source
export async function emailVerificationSource(): Promise<AuthResponse> {
  const response = await api.post("/api/auth/email-verification-source", null, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data as AuthResponse;
}

// POST - Email Verification
export async function emailVerification(): Promise<AuthResponse> {
  const response = await api.post("/api/auth/email-verification", null, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data as AuthResponse;
}
