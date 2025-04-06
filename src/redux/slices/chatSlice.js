// features/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: { recieverUser: {} },
  reducers: {
    chatUser: (state, action) => {
        console.log("redux => ", action)
      state.recieverUser = action.payload;
    }
  },
});

export const { chatUser } = chatSlice.actions;
export default chatSlice.reducer;
