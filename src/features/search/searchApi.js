import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../../utils/apiClient';

export const searchApi = createApi({
    reducerPath: 'searchApi',
    baseQuery,
    endpoints: (builder) => ({
        searchUsers: builder.query({
            query: (query) => `/users/search?query=${encodeURIComponent(query)}`,
        }),
        searchTags: builder.query({
            query: (query) => `/tags/search?query=${encodeURIComponent(query)}`,
        }),
        searchComments: builder.query({
            query: (query) => `/comments/search?query=${encodeURIComponent(query)}`,
        }),
        searchPosts: builder.query({
            query: (query) => `/posts/search?query=${encodeURIComponent(query)}`,
        }),
        searchPostsByRelevance: builder.query({
            query: (query) => `/posts/search/relevance?query=${encodeURIComponent(query)}`,
        }),
    }),
});

export const {
    useSearchUsersQuery,
    useSearchTagsQuery,
    useSearchCommentsQuery,
    useSearchPostsQuery,
    useSearchPostsByRelevanceQuery,
    useLazySearchUsersQuery,
    useLazySearchTagsQuery,
    useLazySearchCommentsQuery,
    useLazySearchPostsQuery,
    useLazySearchPostsByRelevanceQuery,
} = searchApi;
