import { baseApi } from "../baseApi";
import type {
  AuthUser,
  LoginRequest,
  RegisterRequest,
  SendOtpRequest,
  SendOtpResponse,
  TokenResponse,
} from "../types";

/** /api/v1/auth — signup with OTP, login, logout and the current user. */
export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMe: build.query<AuthUser, void>({
      query: () => "/api/v1/auth/me",
      providesTags: ["Me"],
    }),
    sendOtp: build.mutation<SendOtpResponse, SendOtpRequest>({
      query: (body) => ({ url: "/api/v1/auth/send-otp", method: "POST", body }),
    }),
    register: build.mutation<TokenResponse, RegisterRequest>({
      query: (body) => ({ url: "/api/v1/auth/register", method: "POST", body }),
    }),
    login: build.mutation<TokenResponse, LoginRequest>({
      query: (body) => ({ url: "/api/v1/auth/login", method: "POST", body }),
    }),
    logout: build.mutation<{ message: string }, { refresh_token: string }>({
      query: (body) => ({ url: "/api/v1/auth/logout", method: "POST", body }),
    }),
  }),
});

export const {
  useGetMeQuery,
  useSendOtpMutation,
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
} = authApi;
