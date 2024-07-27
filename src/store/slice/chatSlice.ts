import { createSlice } from "@reduxjs/toolkit";
import {CancelTokenSource} from "axios";
import {CommentRes, ReactionRes} from "../../services/PostService.ts";
import {UserDgraphInfoInterface} from "../../services/ProfileService.ts";
import {AttachmentMediaReq} from "../../services/MediaService.ts";

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

export interface ChatScrollPosition {
    [key: string]:  number;
}
export interface  ExtendedComments {
    [key: string]:  CommentRes[];
}
export interface ExtendedInputState {
    [key: string]:  MessageInputState;
}

interface AddInputText {
    chatId: string,
    inputTextHTML: string
}

interface AddUploadedFiles {
    chatId: string,
    filesUploaded: FileUploaded
}

interface AddPreviewFiles {
    chatId: string,
    filesUploaded: FilePreview
}

interface RemoveUploadedFiles {
    chatId: string,
    key: number
}

interface ClearInputState {
    chatId: string,
}

interface UpdatePreviewFiles {
    chatId: string,
    key: number,
    progress: number
}

interface UpdatePostComment {
    chatId: string,
   comments: CommentRes[]
}

interface UpdateCommentReaction {
    chatId: string
    reactionId: string,
    commentIndex: number,
    emojiId: string
}

interface RemoveCommentReaction {
    chatId: string
    reactionId: string,
    commentIndex: number,
}

interface UpdateComment {
    chatId: string
    commentIndex: number
    htmlText: string
}

interface RemoveComment {
    chatId: string
    commentIndex: number
}

interface CreateComment {
    commentId: string
    commentText: string
    commentCreatedAt: string
    commentBy: UserDgraphInfoInterface
    chatId: string
    attachments: AttachmentMediaReq[]
}

interface UpdateCommentAsSeen {
    chatId: string
}

interface UpdateChatScrollPosition{
    chatId: string
    scrollTop: number
}

interface CreateCommentReaction {
    chatId: string
    reactionId: string,
    commentIndex: number,
    emojiId: string
    addedBy: UserDgraphInfoInterface
}


const initialState = {
    chatInputState: {} as ExtendedInputState,
    chatComments: {} as ExtendedComments,
    chatScrollPosition: {} as ChatScrollPosition,
}

export const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        updateChatInputText: (state, action: {payload: AddInputText}) => {
            const { chatId, inputTextHTML } = action.payload;
            if (!state.chatInputState[chatId]) {
                state.chatInputState[chatId] = { inputTextHTML: '', filesUploaded: [], filePreview: [] };
            }
            state.chatInputState[chatId].inputTextHTML = inputTextHTML;
        },

        addChatPreviewFiles: (state, action: {payload: AddPreviewFiles}) => {
            const { chatId, filesUploaded } = action.payload;
            if (!state.chatInputState[chatId]) {
                state.chatInputState[chatId] = { inputTextHTML: '', filesUploaded: [], filePreview: [] };
            }
            state.chatInputState[chatId].filePreview.push(filesUploaded);
        },

        deleteChatPreviewFiles: (state, action: {payload: RemoveUploadedFiles}) => {
            const { chatId, key } = action.payload;
            if (state.chatInputState[chatId]) {
                state.chatInputState[chatId].filePreview = state.chatInputState[chatId].filePreview.filter((media) => {
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

        updateChatPreviewFiles: (state, action: {payload: UpdatePreviewFiles}) => {
            const { chatId, key, progress } = action.payload;
            if (state.chatInputState[chatId]) {
                state.chatInputState[chatId].filePreview = state.chatInputState[chatId].filePreview.map((item) => {
                    return item.key === key ? { ...item, progress } : item;
                });
            }
        },


        addChatUploadedFiles: (state, action: {payload: AddUploadedFiles}) => {
            const { chatId, filesUploaded } = action.payload;
            if (!state.chatInputState[chatId]) {
                state.chatInputState[chatId] = { inputTextHTML: '', filesUploaded: [], filePreview: [] };
            }
            state.chatInputState[chatId].filesUploaded.push(filesUploaded);
        },

        removeChatUploadedFiles: (state, action: {payload: RemoveUploadedFiles}) => {
            const { chatId, key } = action.payload;
            if (state.chatInputState[chatId]) {
                state.chatInputState[chatId].filesUploaded = state.chatInputState[chatId].filesUploaded.filter((media) => media.key !== key);
            }
        },
        clearChatInputState: (state, action: {payload: ClearInputState}) => {
            const { chatId } = action.payload;
            state.chatInputState[chatId] = { inputTextHTML: '', filesUploaded: [], filePreview: [] };
        },

        updateChatComment: (state, action: {payload: UpdatePostComment}) => {
            const { chatId, comments } = action.payload;

            state.chatComments[chatId] = [...comments];

        },

        updateChatCommentReaction: (state, action: {payload: UpdateCommentReaction}) => {
            const { chatId, commentIndex, emojiId, reactionId } = action.payload;

            if (commentIndex > -1 && commentIndex < state.chatComments[chatId].length) {
                state.chatComments[chatId][commentIndex].comment_reactions = state.chatComments[chatId][commentIndex].comment_reactions?.map((reaction) => {
                    if (reaction.uid == reactionId) {
                        reaction.reaction_emoji_id = emojiId
                    }
                    return reaction
                })
            }

        },

        createChatCommentReaction: (state, action: {payload: CreateCommentReaction}) => {
            const { chatId, commentIndex, emojiId, reactionId , addedBy} = action.payload;

            if (commentIndex > -1 && commentIndex < state.chatComments[chatId].length) {

                if(!state.chatComments[chatId][commentIndex].comment_reactions) {
                    state.chatComments[chatId][commentIndex].comment_reactions = [] as ReactionRes[]
                }
                state.chatComments[chatId][commentIndex].comment_reactions?.push({
                    reaction_emoji_id: emojiId,
                    uid: reactionId,
                    reaction_added_by: addedBy
                })
            }
        },

        removeChatCommentReaction: (state, action: {payload: RemoveCommentReaction}) => {
            const { chatId, commentIndex, reactionId } = action.payload;

            if (commentIndex > -1 && commentIndex < state.chatComments[chatId].length) {
                state.chatComments[chatId][commentIndex].comment_reactions =  state.chatComments[chatId][commentIndex].comment_reactions?.filter((reaction) => {
                    return reaction.uid !== reactionId
                })
            }

        },

        updateCommentByCommentId: (state, action: {payload: UpdateComment}) => {
            const { chatId, commentIndex, htmlText } = action.payload;
            if (commentIndex > -1 && commentIndex < state.chatComments[chatId].length) {
                state.chatComments[chatId][commentIndex].comment_text = htmlText
            }

        },

        removeChatComment: (state, action: {payload: RemoveComment}) => {
            const { chatId, commentIndex } = action.payload;
            if (commentIndex > -1 && commentIndex < state.chatComments[chatId].length) {
                state.chatComments[chatId].splice(commentIndex, 1);
            }
        },

        createChatComment: (state, action: {payload: CreateComment}) => {
            const {chatId, commentText, commentCreatedAt, commentId, commentBy, attachments} = action.payload;
            if(!state.chatComments[chatId]) {
                state.chatComments[chatId] = [] as CommentRes[]
            }
            state.chatComments[chatId].push({
                comment_by: commentBy,
                comment_created_at: commentCreatedAt,
                comment_text: commentText,
                comment_id: commentId,
                comment_added_locally: true, // not seen by user yet
                comment_attachments: attachments,
                comment_updated_at: ""
            })
        },

        updateChatCommentAddedLocallyToSeen: (state, action: {payload: UpdateCommentAsSeen}) =>{
            const {chatId} = action.payload;
            if(state.chatComments[chatId]) {
                state.chatComments[chatId][state.chatComments[chatId].length-1].comment_added_locally = false
            }
        },

        updateChatScrollPosition: (state, action: {payload: UpdateChatScrollPosition}) =>{
            const {chatId, scrollTop} = action.payload;
            state.chatScrollPosition[chatId] = scrollTop
        },

    }
});

export const {
    updateChatPreviewFiles,
    addChatPreviewFiles,
    deleteChatPreviewFiles,
    updateChatInputText,
    addChatUploadedFiles,
    removeChatUploadedFiles,
    clearChatInputState,
    updateChatComment,
    updateChatCommentReaction,
    createChatCommentReaction,
    removeChatCommentReaction,
    updateCommentByCommentId,
    removeChatComment,
    createChatComment,
    updateChatCommentAddedLocallyToSeen,
    updateChatScrollPosition

} = chatSlice.actions

export default chatSlice;
