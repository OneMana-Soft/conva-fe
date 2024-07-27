import React, {useEffect, useRef, useState} from "react";
import postService, {AddReactionRes} from "../../services/PostService.ts";
import MessageOutput from "../MessageOutput/MessageOutput.tsx";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../store/store.ts";
import {ArrowDownCircleIcon} from "@heroicons/react/24/solid";
import profileService from "../../services/ProfileService.ts";
import {throttle} from "../../utils/Helper.ts";
import {
    createCommentReaction, ExtendedComments,
    PostScrollPosition,  removeCommentReaction, updateComment,
    updateCommentAddedLocallyToSeen, updateCommentReaction,
    updatePostComment,
    updatePostScrollPosition
} from "../../store/slice/postSlice.ts";
import {CHANNEL_TYPE, COMMENT_TYPE} from "../../constants/MessageInput.ts";
import {
    ExtendedPosts, removePostByPostId,
    removePostReactionByPostId, updatePostByPostId,
} from "../../store/slice/channelSlice.ts";
import {useNavigate} from "react-router-dom";
import {URL_CHANNEL} from "../../constants/routes/appNavigation.ts";
import {useTranslation} from "react-i18next";


interface PostMessagesProps {
    postId: string
    channelId: string
    isModerator: boolean
    userUUID: string
    isArchived: boolean
}

const PostMessages: React.FC<PostMessagesProps> = ({postId, isModerator, userUUID, channelId, isArchived}) => {

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [disableScrollToBottom, setDisableScrollToBottom] =  useState(false)
    const {t} = useTranslation()


    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollDivRef = useRef<HTMLDivElement>(null);

    const channelPosts = useSelector((state:RootState)=>
        state.channel.channelPosts ? state.channel.channelPosts: {} as ExtendedPosts)

    const postComments = useSelector((state:RootState)=>
        state.post.postComments ? state.post.postComments : {} as ExtendedComments)

    const postScrollPosition = useSelector((state:RootState) =>
        state.post.postScrollPosition ? state.post.postScrollPosition: {} as PostScrollPosition)

    const postWithCommentsResp = postService.postWithAllComments(postId)

    const userProfile = profileService.getSelfUserProfile()

    useEffect(() => {

        if(postWithCommentsResp.data && postWithCommentsResp.data.data.post_comments) {
            dispatch(updatePostComment({postId: postId, comments:postWithCommentsResp.data?.data.post_comments}))
        }



    }, [postWithCommentsResp.data]);


    useEffect(()=>{


        if(postScrollPosition[postId] && scrollDivRef.current) {
            setTimeout(() => {
                if(scrollDivRef.current) {
                    scrollDivRef.current.scrollTop = postScrollPosition[postId]
                }

            }, 300);

        }

        if(!postScrollPosition[postId]) {

                if (messagesEndRef.current) {
                    messagesEndRef.current.scrollIntoView({
                        behavior: "smooth"
                    })
                }

                if (scrollDivRef.current) {
                    const {scrollTop, clientHeight, scrollHeight} = scrollDivRef.current;
                    const scrolledToLastRaw = scrollTop + clientHeight >= scrollHeight - 400;
                    const noOverflow = scrollHeight <= clientHeight;
                    setDisableScrollToBottom(noOverflow || scrolledToLastRaw)
                }


        }

    },[postId])

    useEffect(() => {

        if (scrollDivRef.current) {
            scrollDivRef.current.addEventListener('scroll',handleScroll);
        }

        return () => {
            if (scrollDivRef.current) {
                scrollDivRef.current.removeEventListener('scroll',handleScroll);
            }
        };
    }, [postId]);


    useEffect(() => {

        if(postComments[postId]) {
            const newMessage = postComments[postId] && postComments[postId][postComments[postId].length-1] && postComments[postId][postComments[postId].length-1].comment_added_locally && messagesEndRef.current

            if(newMessage && messagesEndRef.current) {

                setTimeout(() => {
                    if(messagesEndRef.current) {
                        messagesEndRef.current.scrollIntoView({
                            behavior: "smooth"
                        })
                        dispatch(updateCommentAddedLocallyToSeen({postId: postId}))


                    }

                }, 300);

            }
        }



    }, [postComments]);

    if(postWithCommentsResp.isLoading || postWithCommentsResp.isError || userProfile.isLoading || userProfile.isError || !postWithCommentsResp.data) {
        return (<></>)
    }


    const handleScroll = throttle(() => {
        if (scrollDivRef.current) {
            const { scrollTop, clientHeight, scrollHeight } = scrollDivRef.current;
            const scrolledToLastRaw = scrollTop + clientHeight >= scrollHeight - 400;
            setDisableScrollToBottom(scrolledToLastRaw)
            dispatch(updatePostScrollPosition({ postId: postId, scrollTop: scrollTop }));

        }
    }, 100)

    const scrollToBottom = async () => {

        if(messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({
                behavior: "smooth"
            })
        }

    }

    const handleCreateOrUpdateReaction = async (emojiId: string, reactionId: string, commentId:string, commentIndex: number) => {
        const res =  await postService.CreateOrUpdateCommentReaction({
            comment_id: commentId,
            reaction_dgraph_id: reactionId,
            reaction_emoji_id: emojiId
        });

        const resData: AddReactionRes = res.data

        if(res.status == 200 && postComments[postId] &&  userProfile.userData ) {
            if(reactionId) {
                dispatch(updateCommentReaction({postId: postId,  commentIndex: commentIndex, reactionId, emojiId}))
            } else {
                dispatch(createCommentReaction({postId, reactionId: resData.uid, emojiId, commentIndex: commentIndex, addedBy: userProfile.userData.data.dgraph}))
            }

            return true

        }

        return false
    }

    const handleRemoveReaction = async (reactionId: string, commentId: string, commentIndex: number) => {
        const res = await postService.RemoveCommentReaction({comment_id: commentId, reaction_dgraph_id: reactionId})

        if(res.status == 200 &&  postComments[postId] ) {

            dispatch(removeCommentReaction({postId: postId, reactionId, commentIndex}))
            return true
        }

        return false
    }

    const handleRemoveReactionForPost = async (reactionId: string) => {
        const res = await postService.RemoveReaction({post_id: postId, reaction_dgraph_id: reactionId})

        if(res.status == 200 &&  channelPosts[channelId] ) {

            dispatch(removePostReactionByPostId({channelId: channelId, reactionId: reactionId, postId: postId}))
            await postWithCommentsResp.mutate()
            return true
        }

        return false
    }
    const handleCommentUpdate = async (commentText: string, commentId: string, commentIndex: number) => {

        const res = await postService.UpdateComment({comment_id: commentId, comment_text_html: commentText})

        if(res.status == 200 &&  postComments[postId] ) {
            dispatch(updateComment({commentIndex: commentIndex, postId: postId, htmlText: commentText}))
            return true
        }
        return false
    }

    const handlePostUpdatePost = async (postText: string) => {

        const res = await postService.UpdatePost({post_id: postId, post_text_html: postText})

        if(res.status == 200 &&  channelPosts[channelId] ) {
            dispatch(updatePostByPostId({postId: postId, channelId: channelId, htmlText: postText}))
            return true
        }

        return false

    }

    const handleRemovePost = async () => {
        const res = await postService.DeletePost({post_id: postId})
        if(res.status == 200) {
            dispatch(removePostByPostId({channelId: channelId, postId: postId}))
            navigate(URL_CHANNEL)
            return true
        }

        return false
    }

    const handleRemoveCommentPost = async (commentId: string) => {
        const res = await postService.DeleteComment({comment_id: commentId})
        if(res.status == 200) {
            // dispatch(removeComment({postId: postId, commentIndex: commentIndex}))
            // dispatch(decrementPostCommentCountByPostID({postId: postId, channelId: channelId}))
            await postWithCommentsResp.mutate()
            return true
        }
        return false
    }

    const handleCreateOrUpdateReactionForPost = async (emojiId: string, reactionId: string) => {
        const res =  await postService.CreateOrUpdateReaction({
            post_id: postId,
            reaction_dgraph_id: reactionId,
            reaction_emoji_id: emojiId
        });

        // const resData: AddReactionRes = res.data

        if(res.status == 200 && channelPosts[channelId] &&  userProfile.userData ) {
            // if(reactionId) {
            //     dispatch(updatePostReactionPostId({channelId,  postId, reactionId, emojiId}))
            // } else {
            //     dispatch(createPostReactionPostId({channelId, reactionId: resData.uid, emojiId, postId, addedBy: userProfile.userData.data.dgraph}))
            // }

            postWithCommentsResp.mutate()

            return true

        }

        return false
    }

    const postDate = new Date(postWithCommentsResp.data.data.post_created_at);

    return (
        <div className="grow message-output overflow-auto" ref={scrollDivRef}>
            <div className='flex-row'>

                <div className="font-semibold flex flex-col justify-center items-center mt-10 mb-4">
                    <hr className='border border-gray-300 w-full'/>
                    <div
                        className='border-2 border-gray-300 p-1 pl-4 pr-4 rounded-full self-center -mt-4  bg-gray-50 text-sm'>{postDate.toDateString()}</div>
                </div>

                <MessageOutput
                    user_full_name={postWithCommentsResp.data.data.post_by.user_full_name}
                    user_profile_key={postWithCommentsResp.data.data.post_by.user_profile_object_key}
                    content={postWithCommentsResp.data.data.post_text}
                    created_at={postWithCommentsResp.data.data.post_created_at}
                    attachments={postWithCommentsResp.data.data.post_attachments || []}
                    isModerator={isModerator}
                    isCreator={userUUID === postWithCommentsResp.data.data.post_by.user_uuid}
                    user_uuid={postWithCommentsResp.data.data.post_by.user_uuid}
                    handleCreateOrUpdateReaction={(emojiId: string, reactionId: string) => handleCreateOrUpdateReactionForPost(emojiId, reactionId)}
                    handleRemoveReaction={(reactionId: string) => handleRemoveReactionForPost(reactionId)}
                    reactions={postWithCommentsResp.data.data.post_reactions == undefined ? [] : postWithCommentsResp.data.data.post_reactions}
                    handlePostUpdate={(postText: string) => handlePostUpdatePost(postText)}
                    handleRemovePost={() => handleRemovePost()}
                    uniqueId={postWithCommentsResp.data.data.post_id}
                    messageType={CHANNEL_TYPE}
                    commentCount={postWithCommentsResp.data.data.post_comment_count}
                    isArchived={isArchived}

                />

                <div className="font-semibold flex flex-col justify-center items-center mt-10 mb-4">
                    <hr className='border border-gray-200 w-full'/>
                    <div
                        className=' border-gray-300 p-1 pl-4 pr-4 rounded-full self-center -mt-4  bg-gray-50 text-sm'>{t('commentCount', {count: postWithCommentsResp.data.data.post_comment_count})}</div>
                </div>

                {postComments[postId] && postComments[postId]?.map((comment, ind) => {
                    return (
                        <div key={comment.comment_id} className="">
                            <MessageOutput
                                user_full_name={comment.comment_by.user_full_name}
                                user_profile_key={comment.comment_by.user_profile_object_key}
                                content={comment.comment_text}
                                created_at={comment.comment_created_at}
                                attachments={comment.comment_attachments || []}
                                isModerator={isModerator}
                                isCreator={userUUID === comment.comment_by.user_uuid}
                                user_uuid={comment.comment_by.user_uuid}
                                handleCreateOrUpdateReaction={(emojiId: string, reactionId: string) => handleCreateOrUpdateReaction(emojiId, reactionId, comment.comment_id, ind)}
                                handleRemoveReaction={(reactionId: string) => handleRemoveReaction(reactionId, comment.comment_id, ind)}
                                reactions={comment.comment_reactions == undefined ? [] : comment.comment_reactions}
                                handlePostUpdate={(postText: string) => handleCommentUpdate(postText, comment.comment_id, ind)}
                                handleRemovePost={() => handleRemoveCommentPost(comment.comment_id)}
                                uniqueId={comment.comment_id}
                                messageType={COMMENT_TYPE}
                                commentCount={-1}
                                isArchived={isArchived}
                            />


                        </div>

                    )

                })}
                <div className='p-4' ref={messagesEndRef}></div>

            </div>

            <div className={`sticky bottom-10 float-right mr-10  z-10 ${disableScrollToBottom ? "hidden" : ""}`}>
                <ArrowDownCircleIcon
                    className='h-14 hover:cursor-pointer hover:shadow-lg rounded-full hover:border-gray-700 border'
                    fill="" onClick={scrollToBottom}/>
            </div>

        </div>
    );
};

export default PostMessages;

