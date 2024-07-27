import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    sideBarActive: false
}

interface updateSidebarState {
    active: boolean
}

export const sidebarSlice = createSlice({
    name: 'sidebar',
    initialState,
    reducers: {
        updateSideBarState: (state, action: {payload:  updateSidebarState}) => {
            state.sideBarActive = action.payload.active
        }
    }

});

export const { updateSideBarState } = sidebarSlice.actions

export default sidebarSlice;
