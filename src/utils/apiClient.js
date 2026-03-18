import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseQuery = fetchBaseQuery({
  baseUrl: 'https://forum-istad-api.cheat.casa/api/v1',
  prepareHeaders: (headers, { getState }) => {
    // Try to get token from Redux state first
    let token = getState().auth?.token;
    
    // If not in Redux, read from localStorage directly
    if (!token) {
      token = localStorage.getItem('token');
    }
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});