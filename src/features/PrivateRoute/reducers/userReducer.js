import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    loading: true,
    user: {},
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        }
    }
});

export const { setUser, setLoading } = userSlice.actions;
export default userSlice.reducer;