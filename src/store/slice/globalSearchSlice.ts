import { createSlice } from "@reduxjs/toolkit";

interface UpdateSearchText {
    searchText: string
}

const initialState = {
    searchText: ""
}

export const globalSearchSlice = createSlice({
    name: 'globalSearch',
    initialState,
    reducers: {
        updateSearchText: (state, action :{payload: UpdateSearchText}) => {
            state.searchText = action.payload.searchText
        }
    }

});

export const { updateSearchText } = globalSearchSlice.actions

export default globalSearchSlice;
