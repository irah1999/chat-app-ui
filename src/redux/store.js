// store.js
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage/session';

import authReducer from './slices/authSlice';
import chatReducer from './slices/chatSlice';
import groupChatReducer from './slices/groupChatSlice';
import { thunk } from "redux-thunk";

const rootReducer = combineReducers({
  auth: authReducer,
  chat: chatReducer,
  groupChat: groupChatReducer,
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'chat', 'groupChat'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = configureStore({
  reducer: persistedReducer,
  middleware: [thunk],
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});
export const persistor = persistStore(store);
