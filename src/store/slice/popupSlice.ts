import { createSlice } from "@reduxjs/toolkit";

interface modalChannelIdDataInterface {
    channelId: string,
}

interface modalUserIdDataInterface {
    userId: string,
}
interface modalAlertMsgInterface {
    msg: string,
    msgTitle: string
    btnText: string
}

const initialState = {
    profilePopup: { isOpen: false},
    otherUserProfilePopup: { isOpen: false,data:{userId:""}},
    createChannelPopup: { isOpen: false},
    editChannelPopup: { isOpen: false,data:{channelId:""}},
    editChannelMemberPopup: { isOpen: false,data:{channelId:""}},
    alertMessagePopup: {isOpen: false, data: {msg: "", msgTitle: "", btnText:""}}

}

export const popupSlice = createSlice({
    name: 'popup',
    initialState,
    reducers: {
        openProfilePopup: (state) => {
            state.profilePopup={
                isOpen:true,
            }
        },

        closeProfilePopup: (state) => {
            state.profilePopup=initialState.profilePopup
        },

        openOtherUserProfilePopup: (state, action: {payload: modalUserIdDataInterface}) => {
            state.otherUserProfilePopup={
                isOpen:true,
                data:action.payload
            }
        },

        closeOtherUserProfilePopup: (state) => {
            state.otherUserProfilePopup=initialState.otherUserProfilePopup
        },


        openAlertMsgPopup: (state, action: {payload: modalAlertMsgInterface}) => {
            state.alertMessagePopup={
                isOpen:true,
                data:action.payload
            }
        },

        closeAlertMsgPopup: (state) => {
            state.alertMessagePopup=initialState.alertMessagePopup
        },
        openCreateChannelPopup: (state) => {
            state.createChannelPopup={
                isOpen:true,
            }
        },

        closeCreateChannelPopup: (state) => {
            state.createChannelPopup=initialState.createChannelPopup
        },

        openEditChannelPopup: (state, action: {payload: modalChannelIdDataInterface}) => {
            state.editChannelPopup={
                isOpen:true,
                data:action.payload
            }
        },

        closeEditChannelPopup: (state) => {
            state.editChannelPopup=initialState.editChannelPopup
        },

        openEditChannelMemberPopup: (state, action: {payload: modalChannelIdDataInterface}) => {
            state.editChannelMemberPopup={
                isOpen:true,
                data:action.payload
            }
        },

        closeEditChannelMemberPopup: (state) => {
            state.editChannelMemberPopup=initialState.editChannelMemberPopup
        }
    }

});

export const {
    openProfilePopup,
    closeProfilePopup,
    openOtherUserProfilePopup,
    closeOtherUserProfilePopup,
    openCreateChannelPopup,
    closeCreateChannelPopup,
    openEditChannelPopup,
    closeEditChannelPopup ,
    openEditChannelMemberPopup,
    closeEditChannelMemberPopup,
    openAlertMsgPopup,
    closeAlertMsgPopup
} =popupSlice.actions

export default popupSlice;