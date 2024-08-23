import { createSlice } from "@reduxjs/toolkit";
import {CancelTokenSource} from "axios";
import {PostsRes, ReactionRes} from "../../services/PostService.ts";
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

export interface ChannelScrollPosition {
    [key: string]:  number;
}
export interface  ExtendedPosts {
    [key: string]:  PostsRes[];
}
export interface ExtendedInputState {
    [key: string]:  MessageInputState;
}

interface AddInputText {
    channelId: string,
    inputTextHTML: string
}

interface AddUploadedFiles {
    channelId: string,
    filesUploaded: FileUploaded
}

interface AddPreviewFiles {
    channelId: string,
    filesUploaded: FilePreview
}

interface RemoveUploadedFiles {
    channelId: string,
    key: number
}

interface ClearInputState {
    channelId: string,
}

interface UpdatePreviewFiles {
    channelId: string,
    key: number,
    progress: number
}

interface UpdateChannelPosts {
    channelId: string,
    posts: PostsRes[]
}

interface UpdatePostReaction {
    channelId: string
    reactionId: string,
    postIndex: number,
    emojiId: string
}

interface UpdatePostReactionByPostId {
    channelId: string
    reactionId: string,
    postId: string,
    emojiId: string
}

interface RemovePostReaction {
    channelId: string
    reactionId: string,
    postIndex: number,
}

interface RemovePostReactionByPostId {
    channelId: string
    reactionId: string,
    postId: string,
}

interface UpdatePost {
    channelId: string
    postIndex: number
    htmlText: string
}

interface UpdatePostCommentCount {
    postId: string
    channelId: string
}

interface UpdatePostByPostId {
    channelId: string
    postId: string
    htmlText: string
}

interface RemovePost {
    channelId: string
    postIndex: number
}

interface RemovePostPostId {
    channelId: string
    postId: string
}

interface CreatePost {
    postId: string
    postText: string
    postCreatedAt: string
    postBy: UserDgraphInfoInterface
    channelId: string
    attachments: AttachmentMediaReq[]
}

interface UpdatePostAsSeen {
    channelId: string
}

interface UpdateChannelScrollPosition {
    channelId: string
    scrollTop: number
}

interface CreatePostReaction {
    channelId: string
    reactionId: string,
    postIndex: number,
    emojiId: string
    addedBy: UserDgraphInfoInterface
}

interface CreatePostReactionByPostId {
    channelId: string
    reactionId: string,
    postId: string,
    emojiId: string
    addedBy: UserDgraphInfoInterface
}

const initialState = {
    channelInputState: {} as ExtendedInputState,
    channelPosts: {} as ExtendedPosts,
    channelScrollPosition: {} as ChannelScrollPosition,
}

export const channelSlice = createSlice({
    name: 'channel',
    initialState,
    reducers: {
        updateChannelInputText: (state, action: {payload: AddInputText}) => {
            const { channelId, inputTextHTML } = action.payload;
            if (!state.channelInputState[channelId]) {
                state.channelInputState[channelId] = { inputTextHTML: '', filesUploaded: [], filePreview: [] };
            }
            state.channelInputState[channelId].inputTextHTML = inputTextHTML;
        },

        addChannelPreviewFiles: (state, action: {payload: AddPreviewFiles}) => {
            const { channelId, filesUploaded } = action.payload;
            if (!state.channelInputState[channelId]) {
                state.channelInputState[channelId] = { inputTextHTML: '', filesUploaded: [], filePreview: [] };
            }
            state.channelInputState[channelId].filePreview.push(filesUploaded);
        },

        deleteChannelPreviewFiles: (state, action: {payload: RemoveUploadedFiles}) => {
            const { channelId, key } = action.payload;
            if (state.channelInputState[channelId]) {
                state.channelInputState[channelId].filePreview = state.channelInputState[channelId].filePreview.filter((media) => {
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

        updateChannelPreviewFiles: (state, action: {payload: UpdatePreviewFiles}) => {
            const { channelId, key, progress } = action.payload;
            if (state.channelInputState[channelId]) {
                state.channelInputState[channelId].filePreview = state.channelInputState[channelId].filePreview.map((item) => {
                    return item.key === key ? { ...item, progress } : item;
                });
            }
        },


        addChannelUploadedFiles: (state, action: {payload: AddUploadedFiles}) => {
            const { channelId, filesUploaded } = action.payload;
            if (!state.channelInputState[channelId]) {
                state.channelInputState[channelId] = { inputTextHTML: '', filesUploaded: [], filePreview: [] };
            }
            state.channelInputState[channelId].filesUploaded.push(filesUploaded);
        },

        removeChannelUploadedFiles: (state, action: {payload: RemoveUploadedFiles}) => {
            const { channelId, key } = action.payload;
            if (state.channelInputState[channelId]) {
                state.channelInputState[channelId].filesUploaded = state.channelInputState[channelId].filesUploaded.filter((media) => media.key !== key);
            }
        },
        clearChannelInputState: (state, action: {payload: ClearInputState}) => {
            const { channelId } = action.payload;
            state.channelInputState[channelId] = { inputTextHTML: '', filesUploaded: [], filePreview: [] };
        },

        updateChannelPosts: (state, action: {payload: UpdateChannelPosts}) => {
            const { channelId, posts } = action.payload;

            state.channelPosts[channelId] = [...posts];

        },

        updatePostReaction: (state, action: {payload: UpdatePostReaction}) => {
            const { channelId, postIndex, emojiId, reactionId } = action.payload;

            if (postIndex > -1 && postIndex < state.channelPosts[channelId].length) {
                state.channelPosts[channelId][postIndex].post_reactions = state.channelPosts[channelId][postIndex].post_reactions?.map((reaction) => {
                    if (reaction.uid == reactionId) {
                        reaction.reaction_emoji_id = emojiId
                    }
                    return reaction
                })
            }
        },

        updatePostReactionPostId: (state, action: {payload: UpdatePostReactionByPostId}) => {
            const { channelId, postId, emojiId, reactionId } = action.payload;

            if (!state.channelPosts[channelId]) {
                return
            }

            state.channelPosts[channelId] = state.channelPosts[channelId].map((post) => {
                if(post.post_id == postId) {

                    post.post_reactions = post.post_reactions?.map((reaction) => {
                        if (reaction.uid == reactionId) {
                            reaction.reaction_emoji_id = emojiId
                        }
                        return reaction
                    })
                }

                return post
            })

        },

        createPostReaction: (state, action: {payload: CreatePostReaction}) => {
            const { channelId, postIndex, emojiId, reactionId , addedBy} = action.payload;

            if (postIndex > -1 && postIndex < state.channelPosts[channelId].length) {

                if(!state.channelPosts[channelId][postIndex].post_reactions) {
                    state.channelPosts[channelId][postIndex].post_reactions = [] as ReactionRes[]
                }
                state.channelPosts[channelId][postIndex].post_reactions?.push({
                    reaction_emoji_id: emojiId,
                    uid: reactionId,
                    reaction_added_by: addedBy
                })
            }
        },

        createPostReactionPostId: (state, action: {payload: CreatePostReactionByPostId}) => {
            const { channelId, postId, emojiId, reactionId , addedBy} = action.payload;

            state.channelPosts[channelId] = state.channelPosts[channelId].map((post) => {
                if(post.post_id == postId) {
                    if(!post.post_reactions) {
                        post.post_reactions = [] as ReactionRes[]
                    }
                    post.post_reactions.push({
                        reaction_emoji_id: emojiId,
                        uid: reactionId,
                        reaction_added_by: addedBy
                    })
                }

                return post
            })

        },

        removePostReaction: (state, action: {payload: RemovePostReaction}) => {
            const { channelId, postIndex, reactionId } = action.payload;

            if (postIndex > -1 && postIndex < state.channelPosts[channelId].length) {
                state.channelPosts[channelId][postIndex].post_reactions =  state.channelPosts[channelId][postIndex].post_reactions?.filter((reaction) => {
                    return reaction.uid !== reactionId
                })
            }

        },

        removePostReactionByPostId: (state, action: {payload: RemovePostReactionByPostId}) => {
            const { channelId, postId, reactionId } = action.payload;

            state.channelPosts[channelId] = state.channelPosts[channelId].map((post) => {

                if(post.post_id == postId) {
                    post.post_reactions = post.post_reactions?.filter((reaction) => {
                        return reaction.uid !== reactionId
                    })
                }
                return post
            })
        },

        incrementPostCommentCountByPostID: (state, action: {payload: UpdatePostCommentCount}) => {
            const { postId , channelId} = action.payload;

            state.channelPosts[channelId].map((post)=> {
                if(post.post_id == postId) {
                    post.post_comment_count++
                }
                return post
            })

        },

        decrementPostCommentCountByPostID: (state, action: {payload: UpdatePostCommentCount}) => {
            const { postId , channelId} = action.payload;

            state.channelPosts[channelId].map((post)=> {
                if(post.post_id == postId) {
                    post.post_comment_count--
                }
                return post
            })

        },

        updatePost: (state, action: {payload: UpdatePost}) => {
            const { channelId, postIndex, htmlText } = action.payload;
            if (postIndex > -1 && postIndex < state.channelPosts[channelId].length) {
                state.channelPosts[channelId][postIndex].post_text = htmlText
            }

        },

        updatePostByPostId: (state, action: {payload: UpdatePostByPostId}) => {
            const { channelId, postId, htmlText } = action.payload;
            state.channelPosts[channelId] = state.channelPosts[channelId].map((post) => {
                if(postId == post.post_id) {
                    post.post_text = htmlText
                }

                return post
            })
        },

        removePost: (state, action: {payload: RemovePost}) => {
            const { channelId, postIndex } = action.payload;
            if (postIndex > -1 && postIndex < state.channelPosts[channelId].length) {
                state.channelPosts[channelId].splice(postIndex, 1);
            }
        },

        removePostByPostId: (state, action: {payload: RemovePostPostId}) => {
            const { channelId, postId } = action.payload;
            state.channelPosts[channelId] = state.channelPosts[channelId].filter((post) => {
                return post.post_id !== postId
            })
        },

        createPost: (state, action: {payload: CreatePost}) => {
            const {postId, postText, postCreatedAt, channelId, postBy, attachments} = action.payload;
            if(!state.channelPosts[channelId]) {
                state.channelPosts[channelId] = [] as PostsRes[]
            }
            state.channelPosts[channelId].push({
                post_by: postBy,
                post_created_at: postCreatedAt,
                post_text: postText,
                post_id: postId,
                post_added_locally: true, // not seen by user yet
                post_attachments: attachments,
                post_comment_count: 0,
            })
        },

        updatePostAddedLocallyToSeen: (state, action: {payload: UpdatePostAsSeen}) =>{
            const {channelId} = action.payload;
            if(state.channelPosts[channelId]) {
                state.channelPosts[channelId][state.channelPosts[channelId].length-1].post_added_locally = false
            }
        },

        updateChannelScrollPosition: (state, action: {payload: UpdateChannelScrollPosition}) =>{
            const {channelId, scrollTop} = action.payload;
            state.channelScrollPosition[channelId] = scrollTop
        }
    }
});

export const {
    updateChannelPreviewFiles,
    addChannelPreviewFiles,
    deleteChannelPreviewFiles,
    updateChannelInputText,
    addChannelUploadedFiles,
    removeChannelUploadedFiles,
    clearChannelInputState,
    updateChannelPosts,
    updatePostReaction,
    updatePostReactionPostId,
    createPostReaction,
    createPostReactionPostId,
    removePostReaction,
    removePostReactionByPostId,
    incrementPostCommentCountByPostID,
    decrementPostCommentCountByPostID,
    updatePost,
    updatePostByPostId,
    removePost,
    removePostByPostId,
    createPost,
    updatePostAddedLocallyToSeen,
    updateChannelScrollPosition

} = channelSlice.actions

export default channelSlice;
