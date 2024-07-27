import { createSlice } from "@reduxjs/toolkit";
import {UserDgraphInfoInterface} from "../../services/ProfileService.ts";

interface addChannelTypingInterface {
    user: UserDgraphInfoInterface
    channelId: string
    timer: ReturnType<typeof setTimeout>
}

interface addChatTypingInterface {
    user: UserDgraphInfoInterface
    chatId: string
    timer: ReturnType<typeof setTimeout>
}

interface removeChannelTypingInterface {
    userId: string
    channelId: string
}
interface removeChatTypingInterface {
    userId: string
    chatId: string
}

interface userTypingInfoInterface {
    user: UserDgraphInfoInterface,
    userId: string
    timer: ReturnType<typeof setTimeout>
}
export interface ExtendedTypingState {
    [key: string]:  userTypingInfoInterface[];
}

const initialState = {
    chatTyping : {} as ExtendedTypingState,
    channelTyping: {} as ExtendedTypingState,
}

export const typingSlice = createSlice({
    name: 'typing',
    initialState,
    reducers: {
        addChannelTyping: (state, action: {payload: addChannelTypingInterface}) => {
            const {user, channelId, timer} = action.payload
            if(!state.channelTyping[channelId]) {
                state.channelTyping[channelId] = [] as userTypingInfoInterface[]
            }

            let userExistInList = false
            for(const typingUserInfo of state.channelTyping[channelId]) {
                if(typingUserInfo.userId ==  user.user_uuid) {
                    clearTimeout(typingUserInfo.timer)
                    typingUserInfo.timer = timer
                    userExistInList = true
                    break
                }
            }

            if(!userExistInList) {
                state.channelTyping[channelId].push({userId: user.user_uuid, user:user, timer: timer})
            }
        },

        addChatTyping: (state, action: {payload: addChatTypingInterface}) => {
            const {user, chatId, timer} = action.payload
            if(!state.chatTyping[chatId]) {
                state.chatTyping[chatId] = [] as userTypingInfoInterface[]
            }

            let userExistInList = false
            for(const typingUserInfo of state.chatTyping[chatId]) {
                if(typingUserInfo.userId ==  user.user_uuid) {
                    clearTimeout(typingUserInfo.timer)
                    typingUserInfo.timer = timer
                    userExistInList = true
                    break
                }
            }

            if(!userExistInList) {
                state.chatTyping[chatId].push({userId: user.user_uuid, user:user, timer:timer})
            }
        },

        RemoveChatTyping: (state, action: {payload: removeChatTypingInterface}) => {
            const {userId, chatId} = action.payload

            state.chatTyping[chatId] = state.chatTyping[chatId].filter((userTyping) => {
                return userTyping.userId != userId
            })

        },

        RemoveChannelTyping: (state, action: {payload: removeChannelTypingInterface}) => {
            const {userId, channelId} = action.payload
            state.channelTyping[channelId] = state.channelTyping[channelId].filter((userTyping) => {
                return userTyping.userId !== userId
            })
        },

    }

});

export const { addChannelTyping, addChatTyping, RemoveChatTyping, RemoveChannelTyping } = typingSlice.actions

export default typingSlice;
