import { baseApi } from "../baseApi";
import type { NotificationList } from "../types";

/** /api/v1/notifications — the bell in the top bar. */
export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getNotifications: build.query<NotificationList, void>({
      query: () => "/api/v1/notifications",
      providesTags: ["Notifications"],
    }),
    markNotificationRead: build.mutation<NotificationList, string>({
      query: (id) => ({ url: `/api/v1/notifications/${id}/read`, method: "POST" }),
      // The response is the fresh list; write it straight into the cache.
      async onQueryStarted(_id, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(notificationsApi.util.upsertQueryData("getNotifications", undefined, data));
        } catch {
          // The bell keeps showing it as unread.
        }
      },
    }),
    markAllNotificationsRead: build.mutation<NotificationList, void>({
      query: () => ({ url: "/api/v1/notifications/read-all", method: "POST" }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(notificationsApi.util.upsertQueryData("getNotifications", undefined, data));
        } catch {
          // Nothing to undo.
        }
      },
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationsApi;
