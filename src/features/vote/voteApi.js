import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../../utils/apiClient';

export const voteApi = createApi({
  reducerPath: 'voteApi',
  baseQuery,
  tagTypes: ['Vote', 'Post'],
  endpoints: (builder) => ({
    getVoteById: builder.query({
      query: (voteId) => `/votes/${voteId}`,
      providesTags: (result, error, voteId) => [{ type: 'Vote', id: voteId }],
    }),
    createVote: builder.mutation({
      query: ({ postId, voteTypeId }) => ({
        url: '/votes',
        method: 'POST',
        body: { postId, voteTypeId },
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'Post', id: postId },
        { type: 'Post', id: 'LIST' },
        { type: 'Post', id: 'SCORE' }
      ],
    }),
    updateVote: builder.mutation({
      query: ({ voteId, postId, voteTypeId }) => ({
        url: `/votes/${voteId}`,
        method: 'PUT',
        body: { postId, voteTypeId },
      }),
      invalidatesTags: (result, error, { voteId, postId }) => [
        { type: 'Vote', id: voteId },
        { type: 'Post', id: postId },
        { type: 'Post', id: 'LIST' },
        { type: 'Post', id: 'SCORE' }
      ],
    }),
    deleteVote: builder.mutation({
      query: (voteId) => ({
        url: `/votes/${voteId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Vote', 'Post'],
    }),
  }),
});

export const {
  useGetVoteByIdQuery,
  useCreateVoteMutation,
  useUpdateVoteMutation,
  useDeleteVoteMutation,
} = voteApi;
