import { createSlice } from "@reduxjs/toolkit";


interface UpdateLastSeenDm {
    dmId: string
}

interface UpdateLastSeenChannel {
    channelId: string
}

const initialState = {

    lastSelectedDm: '',
    lastSelectedChannel: ''
}

export const lastSelectedPersistSlice = createSlice({
    name: 'lastSelectedPersist',
    initialState,
    reducers: {

        updateLastSeenDmId: (state, action: {payload: UpdateLastSeenDm}) =>{
            const {dmId} = action.payload;
            state.lastSelectedDm = dmId
        },

        updateLastSeenChannelId: (state, action: {payload: UpdateLastSeenChannel}) =>{
            const {channelId} = action.payload;
            state.lastSelectedChannel = channelId
        }
    }
});

export const {
    updateLastSeenDmId,
    updateLastSeenChannelId


} = lastSelectedPersistSlice.actions

export default lastSelectedPersistSlice;
