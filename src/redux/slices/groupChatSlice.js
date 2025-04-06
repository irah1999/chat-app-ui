// features/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const groupChatSlice = createSlice({
  name: 'groupChat',
  initialState: { groupUser: {} },
  reducers: {
    groupChatUser: (state, action) => {
      state.groupUser = action.payload;
    },
    updateGroupChatUser: (state, action) => {
      state.groupUser = { ...state.groupUser, ...action.payload };
    },
  },
});

export const { groupChatUser, updateGroupChatUser } = groupChatSlice.actions;
export default groupChatSlice.reducer;
