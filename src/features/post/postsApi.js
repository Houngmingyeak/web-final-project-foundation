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
    getPostsByAnswers: builder.query({
      query: (parentId) => `/posts/answers/${parentId}`,
      providesTags: (result, error, parentId) => [{ type: 'Post', id: `ANSWERS_${parentId}` }],
    }),
    getPostsSortedByViews: builder.query({
      query: () => '/posts/sort/views',
      providesTags: [{ type: 'Post', id: 'VIEWS' }],
    }),
    getPostsByTag: builder.query({
      query: (tagId) => `/posts/tag/${tagId}`,
      providesTags: (result, error, tagId) => [{ type: 'Post', id: `TAG_${tagId}` }, { type: 'Post', id: 'LIST' }],
    }),
    getPostsByType: builder.query({
      query: (postTypeId) => `/posts/type/${postTypeId}`,
      providesTags: (result, error, postTypeId) => [{ type: 'Post', id: `TYPE_${postTypeId}` }],
    }),
    getPopularTags: builder.query({
      query: () => '/tags/popular',
      providesTags: [{ type: 'Tag', id: 'POPULAR' }],
    }),
    getTagsSearch: builder.query({
      query: (params) => ({ url: '/tags/search', params }),
      providesTags: [{ type: 'Tag', id: 'SEARCH' }],
    }),
    getTopTags: builder.query({
      query: (limit) => `/tags/top/${limit}`,
      providesTags: [{ type: 'Tag', id: 'TOP' }],
    }),
    getTagById: builder.query({
      query: (tagId) => `/tags/${tagId}`,
      providesTags: (result, error, tagId) => [{ type: 'Tag', id: tagId }],
    }),
    updateTag: builder.mutation({
      query: ({ tagId, tagName }) => ({
        url: `/tags/${tagId}`,
        method: 'PUT',
        body: { tagName },
      }),
      invalidatesTags: (result, error, { tagId }) => [{ type: 'Tag', id: tagId }, { type: 'Tag', id: 'LIST' }],
    }),
    deleteTag: builder.mutation({
      query: (tagId) => ({
        url: `/tags/${tagId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Tag', id: 'LIST' }],
    }),
    getCommentsByPost: builder.query({
      query: (postId) => `/comments/post/${postId}`,
      providesTags: (result, error, postId) => [{ type: 'Post', id: postId }],
    }),
    getCommentsByUser: builder.query({
      query: (userId) => `/comments/user/${userId}`,
    }),
    getCommentsSearch: builder.query({
      query: (params) => ({ url: '/comments/search', params }),
    }),
    updateComment: builder.mutation({
      query: ({ commentId, ...patch }) => ({
        url: `/comments/${commentId}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['Post'],
    }),
    deleteComment: builder.mutation({
      query: (commentId) => ({
        url: `/comments/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Post'],
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
  useGetPostsByAnswersQuery,
  useGetPostsSortedByViewsQuery,
  useGetPostsByTagQuery,
  useGetPostsByTypeQuery,
  useGetPopularTagsQuery,
  useGetTagsSearchQuery,
  useGetTopTagsQuery,
  useGetTagByIdQuery,
  useUpdateTagMutation,
  useDeleteTagMutation,
  useGetCommentsByPostQuery,
  useGetCommentsByUserQuery,
  useGetCommentsSearchQuery,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = postsApi;