import { baseApi } from "../baseApi";
import type { AuthUser, UpdateMeRequest } from "../types";
import { authApi } from "./auth";

/** /api/v1/users — the signed-in user's own profile. */
export const usersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    updateMe: build.mutation<AuthUser, UpdateMeRequest>({
      query: (body) => ({ url: "/api/v1/users/me", method: "PATCH", body }),
      // The response is the updated user — write it straight into the getMe cache
      // instead of refetching, so every screen showing the user updates at once.
      async onQueryStarted(_body, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            authApi.util.upsertQueryEntries([
              { endpointName: "getMe", arg: undefined, value: data },
            ]),
          );
        } catch {
          // The form shows the error; the cache keeps the last good user.
        }
      },
      // Profile skills feed the claimed skills, the dashboard and "My skills" questions.
      invalidatesTags: (result) => (result ? ["Dashboard", "MySkills", "Questions"] : []),
    }),
  }),
});

export const { useUpdateMeMutation } = usersApi;
