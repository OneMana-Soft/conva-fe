import { createSlice } from "@reduxjs/toolkit";
import {CancelTokenSource} from "axios";
import { ReactionRes} from "../../services/PostService.ts";
import {UserDgraphInfoInterface} from "../../services/ProfileService.ts";
import {AttachmentMediaReq} from "../../services/MediaService.ts";
import {ChatInterface} from "../../services/DmService.ts";

export interface FileUploaded {
    key: number,
    fileName: string,
    url: string,
}

export interface FilePreview {
    key: number,
    fileName: string,
    progress: number,
    cancelSource: CancelTokenSource
}

export interface MessageInputState {
    inputTextHTML: string,
    filesUploaded: FileUploaded[]
    filePreview: FilePreview[]
}

export interface DmScrollPosition {
    [key: string]:  number;
}
export interface  ExtendedChats {
    [key: string]:  ChatInterface[];
}
export interface ExtendedInputState {
    [key: string]:  MessageInputState;
}

interface AddInputText {
    dmId: string,
    inputTextHTML: string
}

interface AddUploadedFiles {
    dmId: string,
    filesUploaded: FileUploaded
}

interface AddPreviewFiles {
    dmId: string,
    filesUploaded: FilePreview
}

interface RemoveUploadedFiles {
    dmId: string,
    key: number
}

interface ClearInputState {
    dmId: string,
}

interface UpdatePreviewFiles {
    dmId: string,
    key: number,
    progress: number
}

interface UpdateDmChats {
    dmId: string,
    chats: ChatInterface[]
}

interface UpdateChatReaction {
    dmId: string
    reactionId: string,
    chatIndex: number,
    emojiId: string
}

interface UpdatePostReactionByChatId {
    dmId: string
    reactionId: string,
    chatId: string,
    emojiId: string
}

interface RemoveChatReaction {
    dmId: string
    reactionId: string,
    chatIndex: number,
}

interface RemoveChatReactionByChatId {
    dmId: string
    reactionId: string,
    chatId: string,
}

interface UpdateChat {
    dmId: string
    chatIndex: number
    htmlText: string
}

interface UpdateChatCommentCount {
    chatId: string
    dmId: string
}

interface UpdateChatByChatId {
    dmId: string
    chatId: string
    htmlText: string
}

interface RemoveChat {
    dmId: string
    chatIndex: number
}

interface RemoveChatByChatId {
    dmId: string
    chatId: string
}

interface CreateChat {
    chatId: string
    chatText: string
    chatCreatedAt: string
    chatBy: UserDgraphInfoInterface
    chatTo: UserDgraphInfoInterface
    dmId: string
    attachments: AttachmentMediaReq[]
}

interface UpdateChatAsSeen {
    dmId: string
}

interface UpdateDmScrollPosition {
    dmId: string
    scrollTop: number
}

interface CreateChatReaction {
    dmId: string
    reactionId: string,
    chatIndex: number,
    emojiId: string
    addedBy: UserDgraphInfoInterface
}

interface CreateChatReactionByChatId {
    dmId: string
    reactionId: string,
    chatId: string,
    emojiId: string
    addedBy: UserDgraphInfoInterface
}

const initialState = {
    DmInputState: {} as ExtendedInputState,
    DmChats: {} as ExtendedChats,
    DmScrollPosition: {} as DmScrollPosition
}

export const dmSlice = createSlice({
    name: 'dm',
    initialState,
    reducers: {
        updateDmInputText: (state, action: {payload: AddInputText}) => {
            const { dmId, inputTextHTML } = action.payload;
            if (!state.DmInputState[dmId]) {
                state.DmInputState[dmId] = { inputTextHTML: '', filesUploaded: [], filePreview: [] };
            }
            state.DmInputState[dmId].inputTextHTML = inputTextHTML;
        },

        addDmPreviewFiles: (state, action: {payload: AddPreviewFiles}) => {
            const { dmId, filesUploaded } = action.payload;
            if (!state.DmInputState[dmId]) {
                state.DmInputState[dmId] = { inputTextHTML: '', filesUploaded: [], filePreview: [] };
            }
            state.DmInputState[dmId].filePreview.push(filesUploaded);
        },

        deleteDmPreviewFiles: (state, action: {payload: RemoveUploadedFiles}) => {
            const { dmId, key } = action.payload;
            if (state.DmInputState[dmId]) {
                state.DmInputState[dmId].filePreview = state.DmInputState[dmId].filePreview.filter((media) => {
                    if (media.key === key) {
                        if(media.progress != 100 && typeof media.cancelSource.cancel === 'function') {
                            media.cancelSource.cancel(`Stopping file upload: ${media.fileName}`);
                        }
                        return false;
                    } else {
                        return true;
                    }
                });
            }
        },

        updateDmPreviewFiles: (state, action: {payload: UpdatePreviewFiles}) => {
            const { dmId, key, progress } = action.payload;
            if (state.DmInputState[dmId]) {
                state.DmInputState[dmId].filePreview = state.DmInputState[dmId].filePreview.map((item) => {
                    return item.key === key ? { ...item, progress } : item;
                });
            }
        },


        addDmUploadedFiles: (state, action: {payload: AddUploadedFiles}) => {
            const { dmId, filesUploaded } = action.payload;
            if (!state.DmInputState[dmId]) {
                state.DmInputState[dmId] = { inputTextHTML: '', filesUploaded: [], filePreview: [] };
            }
            state.DmInputState[dmId].filesUploaded.push(filesUploaded);
        },

        removeDmUploadedFiles: (state, action: {payload: RemoveUploadedFiles}) => {
            const { dmId, key } = action.payload;
            if (state.DmInputState[dmId]) {
                state.DmInputState[dmId].filesUploaded = state.DmInputState[dmId].filesUploaded.filter((media) => media.key !== key);
            }
        },
        clearDmInputState: (state, action: {payload: ClearInputState}) => {
            const { dmId } = action.payload;
            state.DmInputState[dmId] = { inputTextHTML: '', filesUploaded: [], filePreview: [] };
        },

        updateDmChats: (state, action: {payload: UpdateDmChats}) => {
            const { dmId, chats } = action.payload;

            state.DmChats[dmId] = [...chats];

        },

        updateChatReaction: (state, action: {payload: UpdateChatReaction}) => {
            const { dmId, chatIndex, emojiId, reactionId } = action.payload;

            if (chatIndex > -1 && chatIndex < state.DmChats[dmId].length) {
                state.DmChats[dmId][chatIndex].chat_reactions = state.DmChats[dmId][chatIndex].chat_reactions?.map((reaction) => {
                    if (reaction.uid == reactionId) {
                        reaction.reaction_emoji_id = emojiId
                    }
                    return reaction
                })
            }
        },

        updateChatReactionByChatId: (state, action: {payload: UpdatePostReactionByChatId}) => {
            const { dmId, chatId, emojiId, reactionId } = action.payload;

            state.DmChats[dmId] = state.DmChats[dmId].map((chat) => {
                if(chat.chat_uuid == chatId) {
                    chat.chat_reactions = chat.chat_reactions?.map((reaction) => {
                        if (reaction.uid == reactionId) {
                            reaction.reaction_emoji_id = emojiId
                        }
                        return reaction
                    })
                }

                return chat
            })

        },

        createChatReaction: (state, action: {payload: CreateChatReaction}) => {
            const { dmId, chatIndex, emojiId, reactionId , addedBy} = action.payload;

            if (chatIndex > -1 && chatIndex < state.DmChats[dmId].length) {


                if(!state.DmChats[dmId][chatIndex].chat_reactions) {
                    state.DmChats[dmId][chatIndex].chat_reactions = [] as ReactionRes[]
                }
                state.DmChats[dmId][chatIndex].chat_reactions?.push({
                    reaction_emoji_id: emojiId,
                    uid: reactionId,
                    reaction_added_by: addedBy
                })
            }
        },

        createChatReactionChatId: (state, action: {payload: CreateChatReactionByChatId}) => {
            const { dmId, chatId, emojiId, reactionId , addedBy} = action.payload;

            state.DmChats[dmId] = state.DmChats[dmId].map((chat) => {
                if(chat.chat_uuid == chatId) {
                    if(!chat.chat_reactions) {
                        chat.chat_reactions = [] as ReactionRes[]
                    }
                    chat.chat_reactions.push({
                        reaction_emoji_id: emojiId,
                        uid: reactionId,
                        reaction_added_by: addedBy
                    })
                }

                return chat
            })

        },

        removeChatReaction: (state, action: {payload: RemoveChatReaction}) => {
            const { dmId, chatIndex, reactionId } = action.payload;

            if (chatIndex > -1 && chatIndex < state.DmChats[dmId].length) {
                state.DmChats[dmId][chatIndex].chat_reactions =  state.DmChats[dmId][chatIndex].chat_reactions?.filter((reaction) => {
                    return reaction.uid !== reactionId
                })
            }

        },

        removeChatReactionByChatId: (state, action: {payload: RemoveChatReactionByChatId}) => {
            const { dmId, chatId, reactionId } = action.payload;
            state.DmChats[dmId] = state.DmChats[dmId].map((chat) => {

                if(chat.chat_uuid == chatId) {
                    chat.chat_reactions = chat.chat_reactions?.filter((reaction) => {
                        return reaction.uid !== reactionId
                    })
                }
                return chat
            })
        },

        incrementChatCommentCountByChatID: (state, action: {payload: UpdateChatCommentCount}) => {
            const { chatId , dmId} = action.payload;

            state.DmChats[dmId].map((chat)=> {
                if(chat.chat_uuid == chatId) {
                    chat.chat_comment_count++
                }
                return chat
            })

        },

        decrementChatCommentCountByChatID: (state, action: {payload: UpdateChatCommentCount}) => {
            const {chatId , dmId} = action.payload;

            state.DmChats[dmId].map((post)=> {
                if(post.chat_uuid == chatId) {
                    post.chat_comment_count--
                }
                return post
            })

        },

        updateChat: (state, action: {payload: UpdateChat}) => {
            const { dmId, chatIndex, htmlText } = action.payload;
            if (chatIndex > -1 && chatIndex < state.DmChats[dmId].length) {
                state.DmChats[dmId][chatIndex].chat_body_text = htmlText
            }

        },

        updateChatByChatId: (state, action: {payload: UpdateChatByChatId}) => {
            const { dmId, chatId, htmlText } = action.payload;
            state.DmChats[dmId] = state.DmChats[dmId].map((chat) => {
                if(chatId == chat.chat_uuid) {
                    chat.chat_body_text = htmlText
                }

                return chat
            })
        },

        removeChat: (state, action: {payload: RemoveChat}) => {
            const { dmId, chatIndex } = action.payload;
            if (chatIndex > -1 && chatIndex < state.DmChats[dmId].length) {
                state.DmChats[dmId].splice(chatIndex, 1);
            }
        },

        removeChatByChatId: (state, action: {payload: RemoveChatByChatId}) => {
            const { dmId, chatId } = action.payload;
            state.DmChats[dmId] = state.DmChats[dmId].filter((chat) => {
                return chat.chat_uuid !== chatId
            })
        },

        createChat: (state, action: {payload: CreateChat}) => {
            const {chatId, chatText, chatCreatedAt, dmId, chatBy, chatTo, attachments} = action.payload;
            if(!state.DmChats[dmId]) {
                state.DmChats[dmId] = [] as ChatInterface[]
            }
            state.DmChats[dmId].push({
                chat_to: chatTo,
                chat_from: chatBy,
                chat_created_at: chatCreatedAt,
                chat_body_text: chatText,
                chat_uuid: chatId,
                chat_added_locally: true, // not seen by user yet
                chat_attachments: attachments,
                chat_comment_count: 0
            })
        },

        updateChatAddedLocallyToSeen: (state, action: {payload: UpdateChatAsSeen}) =>{
            const {dmId} = action.payload;
            if(state.DmChats[dmId]) {
                state.DmChats[dmId][state.DmChats[dmId].length-1].chat_added_locally = false
            }
        },

        updateDmScrollPosition: (state, action: {payload: UpdateDmScrollPosition}) =>{
            const {dmId, scrollTop} = action.payload;
            state.DmScrollPosition[dmId] = scrollTop
        }
    }
});

export const {
    updateDmPreviewFiles,
    addDmPreviewFiles,
    deleteDmPreviewFiles,
    updateDmInputText,
    addDmUploadedFiles,
    removeDmUploadedFiles,
    clearDmInputState,
    updateDmChats,
    updateChatReaction,
    updateChatReactionByChatId,
    createChatReaction,
    createChatReactionChatId,
    removeChatReaction,
    removeChatReactionByChatId,
    incrementChatCommentCountByChatID,
    decrementChatCommentCountByChatID,
    updateChat,
    updateChatByChatId,
    removeChat,
    removeChatByChatId,
    createChat,
    updateChatAddedLocallyToSeen,
    updateDmScrollPosition

} = dmSlice.actions

export default dmSlice;
