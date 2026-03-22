import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../../utils/apiClient';

const API_BASE_URL = 'https://forum-istad-api.cheat.casa'; // Or fetch from .env

const fixUrl = (url) => {
  if (!url) return url;
  
  let base = url;
  if (url.includes('localhost:8070')) {
    base = url.replace('http://localhost:8070/api/v1/profile-images', `${API_BASE_URL}/api/v1/media`);
  } else if (url.startsWith('/')) {
    base = `${API_BASE_URL}${url}`;
  }
  
  // Append timestamp for cache busting on profile images
  const timestamp = Date.now();
  return base.includes('?') ? `${base}&t=${timestamp}` : `${base}?t=${timestamp}`;
};

const transformProfileImage = (response) => {
  if (response?.profileImage) response.profileImage = fixUrl(response.profileImage);
  if (response?.coverImage)   response.coverImage   = fixUrl(response.coverImage);

  // Hoist nested user stats to root level
  if (response?.bookmark?.users) {
    const u = response.bookmark.users;
    response.reputation = u.reputation ?? response.reputation;
    response.views      = u.views      ?? response.views;
  }
  return response;
};

export const profileApi = createApi({
  reducerPath: 'profileApi',
  baseQuery,
  tagTypes: ['Profile'],
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => '/users/me',
      providesTags: ['Profile'],
      transformResponse: transformProfileImage,
    }),
    getUserById: builder.query({
      query: (userId) => `/users/${userId}`,
      providesTags: (result, error, userId) => [{ type: 'Profile', id: userId }],
      transformResponse: transformProfileImage,
    }),
    uploadProfileImage: builder.mutation({
      query: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: '/users/upload-image',
          method: 'PUT',
          body: formData,
        };
      },
      transformResponse: transformProfileImage,
      invalidatesTags: ['Profile'],
    }),
    updateUser: builder.mutation({
      query: (userData) => ({
        url: '/users/update-user',
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: ['Profile'],
    }),
    updatePassword: builder.mutation({
      query: (passwords) => ({
        url: '/users/update-password',
        method: 'PUT',
        body: passwords, // { oldPassword, newPassword, confirmedNewPassword }
      }),
    }),
  }),
});

export const {
  useGetProfileQuery,
  useGetUserByIdQuery,
  useUploadProfileImageMutation,
  useUpdateUserMutation,
  useUpdatePasswordMutation,
} = profileApi;