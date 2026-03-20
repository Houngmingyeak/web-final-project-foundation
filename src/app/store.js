import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import { authApi } from "../features/auth/authApi";
import { profileApi } from "../features/profile/profileApi";
import { postsApi } from "../features/post/postsApi";
import { uploadApi } from "../features/upload/uploadApi";
import { bookmarkApi } from "../features/bookmark/bookmarkApi";

import { searchApi } from "../features/search/searchApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
    [postsApi.reducerPath]: postsApi.reducer,
    [uploadApi.reducerPath]: uploadApi.reducer,
    [bookmarkApi.reducerPath]: bookmarkApi.reducer,

    [searchApi.reducerPath]: searchApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      profileApi.middleware,
      postsApi.middleware,
      uploadApi.middleware,
      bookmarkApi.middleware,

      searchApi.middleware
    ),
});
