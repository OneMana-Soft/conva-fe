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

export interface PostScrollPosition {
    [key: string]:  number;
}
export interface  ExtendedComments {
    [key: string]:  CommentRes[];
}
export interface ExtendedInputState {
    [key: string]:  MessageInputState;
}

interface AddInputText {
    postId: string,
    inputTextHTML: string
}

interface AddUploadedFiles {
    postId: string,
    filesUploaded: FileUploaded
}

interface AddPreviewFiles {
    postId: string,
    filesUploaded: FilePreview
}

interface RemoveUploadedFiles {
    postId: string,
    key: number
}

interface ClearInputState {
    postId: string,
}

interface UpdatePreviewFiles {
    postId: string,
    key: number,
    progress: number
}

interface UpdatePostComment {
    postId: string,
   comments: CommentRes[]
}

interface UpdateCommentReaction {
    postId: string
    reactionId: string,
    commentIndex: number,
    emojiId: string
}

interface RemoveCommentReaction {
    postId: string
    reactionId: string,
    commentIndex: number,
}

interface UpdateComment {
    postId: string
    commentIndex: number
    htmlText: string
}

interface RemoveComment {
    postId: string
    commentIndex: number
}

interface CreateComment {
    commentId: string
    commentText: string
    commentCreatedAt: string
    commentBy: UserDgraphInfoInterface
    postId: string
    attachments: AttachmentMediaReq[]
}

interface UpdateCommentAsSeen {
    postId: string
}

interface UpdatePostScrollPosition{
    postId: string
    scrollTop: number
}

interface CreateCommentReaction {
    postId: string
    reactionId: string,
    commentIndex: number,
    emojiId: string
    addedBy: UserDgraphInfoInterface
}


const initialState = {
    postInputState: {} as ExtendedInputState,
    postComments: {} as ExtendedComments,
    postScrollPosition: {} as PostScrollPosition,
}

export const postSlice = createSlice({
    name: 'post',
    initialState,
    reducers: {
        updatePostInputText: (state, action: {payload: AddInputText}) => {
            const { postId, inputTextHTML } = action.payload;
            if (!state.postInputState[postId]) {
                state.postInputState[postId] = { inputTextHTML: '', filesUploaded: [], filePreview: [] };
            }
            state.postInputState[postId].inputTextHTML = inputTextHTML;
        },

        addPostPreviewFiles: (state, action: {payload: AddPreviewFiles}) => {
            const { postId, filesUploaded } = action.payload;
            if (!state.postInputState[postId]) {
                state.postInputState[postId] = { inputTextHTML: '', filesUploaded: [], filePreview: [] };
            }
            state.postInputState[postId].filePreview.push(filesUploaded);
        },

        deletePostPreviewFiles: (state, action: {payload: RemoveUploadedFiles}) => {
            const { postId, key } = action.payload;
            if (state.postInputState[postId]) {
                state.postInputState[postId].filePreview = state.postInputState[postId].filePreview.filter((media) => {
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

        updatePostPreviewFiles: (state, action: {payload: UpdatePreviewFiles}) => {
            const { postId, key, progress } = action.payload;
            if (state.postInputState[postId]) {
                state.postInputState[postId].filePreview = state.postInputState[postId].filePreview.map((item) => {
                    return item.key === key ? { ...item, progress } : item;
                });
            }
        },


        addPostUploadedFiles: (state, action: {payload: AddUploadedFiles}) => {
            const { postId, filesUploaded } = action.payload;
            if (!state.postInputState[postId]) {
                state.postInputState[postId] = { inputTextHTML: '', filesUploaded: [], filePreview: [] };
            }
            state.postInputState[postId].filesUploaded.push(filesUploaded);
        },

        removePostUploadedFiles: (state, action: {payload: RemoveUploadedFiles}) => {
            const { postId, key } = action.payload;
            if (state.postInputState[postId]) {
                state.postInputState[postId].filesUploaded = state.postInputState[postId].filesUploaded.filter((media) => media.key !== key);
            }
        },
        clearPostInputState: (state, action: {payload: ClearInputState}) => {
            const { postId } = action.payload;
            state.postInputState[postId] = { inputTextHTML: '', filesUploaded: [], filePreview: [] };
        },

        updatePostComment: (state, action: {payload: UpdatePostComment}) => {
            const { postId, comments } = action.payload;

            state.postComments[postId] = [...comments];

        },

        updateCommentReaction: (state, action: {payload: UpdateCommentReaction}) => {
            const { postId, commentIndex, emojiId, reactionId } = action.payload;

            if (commentIndex > -1 && commentIndex < state.postComments[postId].length) {
                state.postComments[postId][commentIndex].comment_reactions = state.postComments[postId][commentIndex].comment_reactions?.map((reaction) => {
                    if (reaction.uid == reactionId) {
                        reaction.reaction_emoji_id = emojiId
                    }
                    return reaction
                })
            }

        },

        createCommentReaction: (state, action: {payload: CreateCommentReaction}) => {
            const { postId, commentIndex, emojiId, reactionId , addedBy} = action.payload;

            if (commentIndex > -1 && commentIndex < state.postComments[postId].length) {

                if(!state.postComments[postId][commentIndex].comment_reactions) {
                    state.postComments[postId][commentIndex].comment_reactions = [] as ReactionRes[]
                }
                state.postComments[postId][commentIndex].comment_reactions?.push({
                    reaction_emoji_id: emojiId,
                    uid: reactionId,
                    reaction_added_by: addedBy
                })
            }
        },

        removeCommentReaction: (state, action: {payload: RemoveCommentReaction}) => {
            const { postId, commentIndex, reactionId } = action.payload;

            if (commentIndex > -1 && commentIndex < state.postComments[postId].length) {
                state.postComments[postId][commentIndex].comment_reactions =  state.postComments[postId][commentIndex].comment_reactions?.filter((reaction) => {
                    return reaction.uid !== reactionId
                })
            }

        },

        updateComment: (state, action: {payload: UpdateComment}) => {
            const { postId, commentIndex, htmlText } = action.payload;
            if (commentIndex > -1 && commentIndex < state.postComments[postId].length) {
                state.postComments[postId][commentIndex].comment_text = htmlText
            }

        },

        removeComment: (state, action: {payload: RemoveComment}) => {
            const { postId, commentIndex } = action.payload;
            if (commentIndex > -1 && commentIndex < state.postComments[postId].length) {
                state.postComments[postId].splice(commentIndex, 1);
            }
        },

        createComment: (state, action: {payload: CreateComment}) => {
            const {postId, commentText, commentCreatedAt, commentId, commentBy, attachments} = action.payload;
            if(!state.postComments[postId]) {
                state.postComments[postId] = [] as CommentRes[]
            }
            state.postComments[postId].push({
                comment_updated_at: "",
                comment_by: commentBy,
                comment_created_at: commentCreatedAt,
                comment_text: commentText,
                comment_id: commentId,
                comment_added_locally: true, // not seen by user yet
                comment_attachments: attachments
            })
        },

        updateCommentAddedLocallyToSeen: (state, action: {payload: UpdateCommentAsSeen}) =>{
            const {postId} = action.payload;
            if(state.postComments[postId]) {
                state.postComments[postId][state.postComments[postId].length-1].comment_added_locally = false
            }
        },

        updatePostScrollPosition: (state, action: {payload: UpdatePostScrollPosition}) =>{
            const {postId, scrollTop} = action.payload;
            state.postScrollPosition[postId] = scrollTop
        },

    }
});

export const {
    updatePostPreviewFiles,
    addPostPreviewFiles,
    deletePostPreviewFiles,
    updatePostInputText,
    addPostUploadedFiles,
    removePostUploadedFiles,
    clearPostInputState,
    updatePostComment,
    updateCommentReaction,
    createCommentReaction,
    removeCommentReaction,
    updateComment,
    removeComment,
    createComment,
    updateCommentAddedLocallyToSeen,
    updatePostScrollPosition

} = postSlice.actions

export default postSlice;
