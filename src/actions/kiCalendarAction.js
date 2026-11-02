import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ENDPOINTS } from '~/utils/URL';
import axios from 'axios';

export const kiCalendarApi = createApi({
  reducerPath: "kiCalendarApi",
  baseQuery: fetchBaseQuery({
    prepareHeaders: (headers) => {
      const token = axios.defaults.headers.common.Authorization;
      if (token) headers.set("Authorization", token);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getKICalendarEvents: builder.query({
      query: ({ month, year }) =>
        ENDPOINTS.KI_CALENDAR_EVENTS(month, year), 
        // `kitchenandinventory/calendar?month=${month}&year=${year}`,
    }),
  }),
});

export const { useGetKICalendarEventsQuery } = kiCalendarApi;
