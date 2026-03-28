import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ENDPOINTS } from '~/utils/URL';
import axios from 'axios';
import { normalizeFilter } from "~/utils/weeklySummariesFilterHelper";

export const weeklySummariesFiltersApi = createApi({
  reducerPath: "weeklySummariesFiltersApi",
  baseQuery: fetchBaseQuery({
    prepareHeaders: (headers) => {
      const token = axios.defaults.headers.common.Authorization;
      if (token) headers.set("Authorization", token);
      return headers;
    },
  }),
  tagTypes: ["WeeklySummariesFilters"],   // <-- Add tag type
  endpoints: (builder) => ({
    
    // ---------------------------------------
    // GET Filter List
    // ---------------------------------------
    getWeeklySummariesFilters: builder.query({
      query: () => ENDPOINTS.WEEKLY_SUMMARIES_FILTERS,
      transformResponse: (response) => {
        const filterList = response;
        const updatedFilterChoices = [];

        filterList.forEach(filter => {
          updatedFilterChoices.push(normalizeFilter(filter));
        });

        return updatedFilterChoices;
      },
      providesTags: ["WeeklySummariesFilters"],  // <-- Cache tag
    }),

    // ---------------------------------------
    // CREATE New Filter
    // ---------------------------------------
    createWeeklySummariesFilter: builder.mutation({
      query: ({data}) => ({
        url: ENDPOINTS.WEEKLY_SUMMARIES_FILTERS,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["WeeklySummariesFilters"],  // <-- Refresh cache
    }),

    // ---------------------------------------
    // UPDATE Existing Filter
    // ---------------------------------------
    updateWeeklySummariesFilter: builder.mutation({
      query: ({ id, data }) => ({
        url:  ENDPOINTS.WEEKLY_SUMMARIES_FILTER_BY_ID(id),
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["WeeklySummariesFilters"],  // <-- Refresh cache
    }),

     // ---------------------------------------
    // REPLACE Existing Filter
    // ---------------------------------------
    replaceWeeklySummariesFilter: builder.mutation({
      query: ({ id, data }) => ({
        url:  ENDPOINTS.WEEKLY_SUMMARIES_FILTER_BY_ID(id),
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["WeeklySummariesFilters"],  // <-- Refresh cache
    }),

    // ---------------------------------------
    // DELETE Existing Filter
    // ---------------------------------------
    deleteWeeklySummariesFilter: builder.mutation({
      query: ({ id }) => ({
        url:  ENDPOINTS.WEEKLY_SUMMARIES_FILTER_BY_ID(id),
        method: "DELETE",
      }),
      invalidatesTags: ["WeeklySummariesFilters"],  // <-- Refresh cache
    }),

    // ---------------------------------------
    // UPDATE Existing Filter with Replaced Team codes
    // ---------------------------------------
    updateFiltersWithReplacedTeamCodes: builder.mutation({
      query: ({oldTeamCodes, newTeamCode}) => ({
        url: ENDPOINTS.WEEKLY_SUMMARIES_FILTER_REPLACE_CODES,
        method: "POST",
        body: { oldTeamCodes, newTeamCode },
      }),
      invalidatesTags: ["WeeklySummariesFilters"],  // <-- Refresh cache
    }),

    // ---------------------------------------
    // UPDATE Existing Filter with Individual Codes changes
    // ---------------------------------------
    updateFiltersWithIndividualCodesChange: builder.mutation({
      query: ({oldTeamCode, newTeamCode, userId}) => ({
        url: ENDPOINTS.WEEKLY_SUMMARIES_FILTER_REPLACE_INDIVIDUAL_CODES,
        method: "POST",
        body: { oldTeamCode, newTeamCode, userId },
      }),
      invalidatesTags: ["WeeklySummariesFilters"],  // <-- Refresh cache
    }),

  }),
});

export const {
  useGetWeeklySummariesFiltersQuery,
  useCreateWeeklySummariesFilterMutation,
  useUpdateWeeklySummariesFilterMutation,
  useReplaceWeeklySummariesFilterMutation,
  useDeleteWeeklySummariesFilterMutation,
  useUpdateFiltersWithReplacedTeamCodesMutation,
  useUpdateFiltersWithIndividualCodesChangeMutation,
} = weeklySummariesFiltersApi;
