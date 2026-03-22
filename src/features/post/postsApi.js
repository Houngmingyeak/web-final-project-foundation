import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../../utils/apiClient';

export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery,
  tagTypes: ['Post', 'Tag'],
  endpoints: (builder) => ({
    getPosts: builder.query({
      query: () => '/posts',
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: 'Post', id })),
            { type: 'Post', id: 'LIST' },
          ]
          : [{ type: 'Post', id: 'LIST' }],
    }),
    getPostById: builder.query({
      query: (id) => `/posts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Post', id }],
    }),
    getPostsSortedByScore: builder.query({
      query: () => '/posts/sort/score',
      providesTags: [{ type: 'Post', id: 'SCORE' }],
    }),
    getPostsByUser: builder.query({
      query: (userId) => `/posts/user/${userId}`,
      providesTags: (result, error, userId) => [
        { type: 'Post', id: `USER_${userId}` },
        { type: 'Post', id: 'LIST' },
      ],
    }),
    getTags: builder.query({
      query: () => '/tags',
      providesTags: [{ type: 'Tag', id: 'LIST' }],
    }),
    createTag: builder.mutation({
      query: (tagName) => ({
        url: '/tags',
        method: 'POST',
        body: { tagName },
      }),
      // Refetch tag list after creating so new tag appears immediately
      invalidatesTags: [{ type: 'Tag', id: 'LIST' }],
    }),
    createPost: builder.mutation({
      query: (postData) => ({
        url: '/posts',
        method: 'POST',
        body: postData,
      }),
      // Invalidate both the question list AND the score-sorted leaderboard
      invalidatesTags: [
        { type: 'Post', id: 'LIST' },
        { type: 'Post', id: 'SCORE' },
      ],
    }),
    createComment: builder.mutation({
      query: (commentData) => ({
        url: '/comments',
        method: 'POST',
        body: commentData,
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'Post', id: postId },
        { type: 'Post', id: 'LIST' },
        { type: 'Post', id: 'SCORE' },
      ],
    }),
    updatePost: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/posts/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Post', id },
        { type: 'Post', id: 'LIST' },
        { type: 'Post', id: 'SCORE' }
      ]
    }),
    deletePost: builder.mutation({
      query: (id) => ({
        url: `/posts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Post', id },
        { type: 'Post', id: 'LIST' },
        { type: 'Post', id: 'SCORE' }
      ]
    }),
  }),
});

export const {
  useGetPostsQuery,
  useGetPostByIdQuery,
  useGetPostsSortedByScoreQuery,
  useGetPostsByUserQuery,
  useGetTagsQuery,
  useCreateTagMutation,
  useCreatePostMutation,
  useCreateCommentMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} = postsApi;