import React, {useEffect, useRef, useState} from "react";
import {AddReactionRes} from "../../services/PostService.ts";
import MessageOutput from "../MessageOutput/MessageOutput.tsx";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../store/store.ts";
import {ArrowDownCircleIcon} from "@heroicons/react/24/solid";
import profileService from "../../services/ProfileService.ts";
import {isZeroEpoch, throttle} from "../../utils/Helper.ts";
import {
    ExtendedComments,
} from "../../store/slice/chatSlice.ts";
import {COMMENT_TYPE, DM_TYPE} from "../../constants/MessageInput.ts";

import {useNavigate} from "react-router-dom";
import { URL_CHATS} from "../../constants/routes/appNavigation.ts";
import chatService from "../../services/ChatService.ts";
import {
    ChatScrollPosition, createChatCommentReaction, removeChatComment, removeChatCommentReaction,
    updateChatComment,
    updateChatCommentAddedLocallyToSeen, updateChatCommentReaction,
    updateChatScrollPosition, updateCommentByCommentId
} from "../../store/slice/chatSlice.ts";
import dmService from "../../services/DmService.ts";
import {

    decrementChatCommentCountByChatID,
    removeChatByChatId,
    removeChatReactionByChatId,
    updateChatByChatId
} from "../../store/slice/dmSlice.ts";
import {useTranslation} from "react-i18next";


interface ChatMessagesProps {
    chatId: string
    dmId: string
    userUUID: string
}

const ChatMessages: React.FC<ChatMessagesProps> = ({chatId,  userUUID, dmId}) => {

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [disableScrollToBottom, setDisableScrollToBottom] =  useState(false)
    const {t} = useTranslation()


    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollDivRef = useRef<HTMLDivElement>(null);

    const dmChats = useSelector((state:RootState)=>
        state.dm.DmChats ? state.dm.DmChats: {} as ExtendedComments)

    const chatComments = useSelector((state:RootState)=>
        state.chat.chatComments ? state.chat.chatComments : {} as ExtendedComments)


    const chatScrollPosition = useSelector((state:RootState) =>
        state.chat.chatScrollPosition ? state.chat.chatScrollPosition: {} as ChatScrollPosition)

    const chatWithCommentsResp = chatService.chatWithAllComments(chatId)

    const userProfile = profileService.getSelfUserProfile()

    const otherUserProfile = profileService.getUserProfileForID(dmId)

    useEffect(() => {

        if(chatWithCommentsResp.data && chatWithCommentsResp.data.data.chat_comments) {
            dispatch(updateChatComment({chatId: chatId, comments:chatWithCommentsResp.data?.data.chat_comments}))
        }



    }, [chatWithCommentsResp.data]);


    useEffect(()=>{


        if(chatScrollPosition[chatId] && scrollDivRef.current) {
            setTimeout(() => {
                if(scrollDivRef.current) {
                    scrollDivRef.current.scrollTop = chatScrollPosition[chatId]
                }

            }, 300);

        }

        if(!chatScrollPosition[chatId]) {

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

    },[chatId])

    useEffect(() => {

        if (scrollDivRef.current) {
            scrollDivRef.current.addEventListener('scroll',handleScroll);
        }

        return () => {
            if (scrollDivRef.current) {
                scrollDivRef.current.removeEventListener('scroll',handleScroll);
            }
        };
    }, [chatId]);


    useEffect(() => {

        if(chatComments[chatId]) {
            const newMessage = chatComments[chatId] && chatComments[chatId][chatComments[chatId].length-1] && chatComments[chatId][chatComments[chatId].length-1].comment_added_locally && messagesEndRef.current

            if(newMessage && messagesEndRef.current) {

                setTimeout(() => {
                    if(messagesEndRef.current) {
                        messagesEndRef.current.scrollIntoView({
                            behavior: "smooth"
                        })
                        dispatch(updateChatCommentAddedLocallyToSeen({chatId: chatId}))

                    }

                }, 300);

            }
        }



    }, [chatComments]);

    if(chatWithCommentsResp.isLoading || chatWithCommentsResp.isError || userProfile.isLoading || userProfile.isError || !chatWithCommentsResp.data) {
        return (<></>)
    }


    const handleScroll = throttle(() => {
        if (scrollDivRef.current) {
            const { scrollTop, clientHeight, scrollHeight } = scrollDivRef.current;
            const scrolledToLastRaw = scrollTop + clientHeight >= scrollHeight - 400;
            setDisableScrollToBottom(scrolledToLastRaw)
            dispatch(updateChatScrollPosition({ chatId: chatId, scrollTop: scrollTop }));

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
        const res =  await chatService.CreateOrUpdateCommentReaction({
            comment_id: commentId,
            reaction_dgraph_id: reactionId,
            reaction_emoji_id: emojiId
        });

        const resData: AddReactionRes = res.data

        if(res.status == 200 && chatComments[chatId] &&  userProfile.userData ) {
            if(reactionId) {
                dispatch(updateChatCommentReaction({chatId: chatId,  commentIndex: commentIndex, reactionId, emojiId}))
            } else {
                dispatch(createChatCommentReaction({chatId, reactionId: resData.uid, emojiId, commentIndex: commentIndex, addedBy: userProfile.userData.data.dgraph}))
            }

            return true

        }

        return false
    }

    const handleRemoveReaction = async (reactionId: string, commentId: string, commentIndex: number) => {
        const res = await chatService.RemoveCommentReaction({comment_id: commentId, reaction_dgraph_id: reactionId})

        if(res.status == 200 &&  chatComments[chatId] ) {

            dispatch(removeChatCommentReaction({chatId: chatId, reactionId, commentIndex}))
            return true
        }

        return false
    }

    const handleRemoveReactionForChat = async (reactionId: string) => {
        const res = await dmService.RemoveReaction({chat_id: chatId, reaction_dgraph_id: reactionId})

        if(res.status == 200 &&  dmChats[dmId] ) {

            dispatch(removeChatReactionByChatId({dmId: dmId, reactionId: reactionId, chatId: chatId}))
            await chatWithCommentsResp.mutate()
            return true
        }

        return false
    }
    const handleCommentUpdate = async (commentText: string, commentId: string, commentIndex: number) => {

        const res = await chatService.UpdateComment({comment_id: commentId, comment_text_html: commentText, chat_id: chatId})

        if(res.status == 200 && chatComments[chatId] ) {
            dispatch(updateCommentByCommentId({commentIndex: commentIndex, chatId: chatId, htmlText: commentText}))
            return true
        }
        return false
    }

    const handleChatUpdateChat = async (chatText: string) => {

        const res = await dmService.UpdateChat({chat_id: chatId, text_html: chatText})

        if(res.status == 200 &&  dmChats[dmId] ) {
            dispatch(updateChatByChatId({chatId: chatId, dmId: dmId, htmlText: chatText}))
            return true
        }

        return false

    }

    const handleRemoveChat = async () => {
        const res = await dmService.DeleteChat({chat_id: chatId})
        if(res.status == 200) {
            dispatch(removeChatByChatId({dmId: dmId, chatId: chatId}))
            navigate(URL_CHATS)
            return true
        }

        return false
    }

    const handleRemoveCommentChat = async (commentId: string, commentIndex: number) => {
        const res = await chatService.DeleteComment({comment_id: commentId})
        if(res.status == 200) {
            dispatch(removeChatComment({chatId: chatId, commentIndex: commentIndex}))
            dispatch(decrementChatCommentCountByChatID({chatId: chatId, dmId: dmId}))
            return true
        }
        chatWithCommentsResp.mutate()
        return false
    }

    const handleCreateOrUpdateReactionForChat = async (emojiId: string, reactionId: string) => {
        const res =  await dmService.CreateOrUpdateReaction({
            chat_id: chatId,
            reaction_dgraph_id: reactionId,
            reaction_emoji_id: emojiId
        });

        if(res.status == 200 && dmChats[dmId] &&  userProfile.userData ) {
            // if(reactionId) {
            //     dispatch(updateChatReactionByChatId({ dmId,  chatId, reactionId, emojiId}))
            // } else {
            //     dispatch(createChatReactionChatId({dmId, reactionId: resData.uid, emojiId, chatId, addedBy: userProfile.userData.data.dgraph}))
            // }

            chatWithCommentsResp.mutate()

            return true

        }

        return false
    }

    const postDate = new Date(chatWithCommentsResp.data.data.chat_created_at);
    const userDeleted = !isZeroEpoch(otherUserProfile.user?.data.user_deleted_at || '')

    return (
        <div className="grow message-output overflow-auto" ref={scrollDivRef}>
            <div className='flex-row'>

                <div className="font-semibold flex flex-col justify-center items-center mt-10 mb-4">
                    <hr className='border border-gray-300 w-full'/>
                    <div
                        className='border-2 border-gray-300 p-1 pl-4 pr-4 rounded-full self-center -mt-4  bg-gray-50 text-sm'>{postDate.toDateString()}</div>
                </div>

                <MessageOutput
                    user_full_name={chatWithCommentsResp.data.data.chat_from.user_full_name}
                    user_profile_key={chatWithCommentsResp.data.data.chat_from.user_profile_object_key}
                    content={chatWithCommentsResp.data.data.chat_body_text}
                    created_at={chatWithCommentsResp.data.data.chat_created_at}
                    attachments={chatWithCommentsResp.data.data.chat_attachments || []}
                    isModerator={false}
                    isCreator={userUUID === chatWithCommentsResp.data.data.chat_from.user_uuid}
                    user_uuid={chatWithCommentsResp.data.data.chat_from.user_uuid}
                    handleCreateOrUpdateReaction={(emojiId: string, reactionId: string) => handleCreateOrUpdateReactionForChat(emojiId, reactionId)}
                    handleRemoveReaction={(reactionId: string) => handleRemoveReactionForChat(reactionId)}
                    reactions={chatWithCommentsResp.data.data.chat_reactions == undefined ? [] : chatWithCommentsResp.data.data.chat_reactions}
                    handlePostUpdate={(postText: string) => handleChatUpdateChat(postText)}
                    handleRemovePost={() => handleRemoveChat()}
                    uniqueId={chatWithCommentsResp.data.data.chat_uuid}
                    messageType={DM_TYPE}
                    commentCount={chatWithCommentsResp.data.data.chat_comment_count}
                    isArchived={userDeleted}

                />

                <div className="font-semibold flex flex-col justify-center items-center mt-10 mb-4">
                    <hr className='border border-gray-200 w-full'/>
                    <div
                        className=' border-gray-300 p-1 pl-4 pr-4 rounded-full self-center -mt-4  bg-gray-50 text-sm'>{t('commentCount', {count: chatWithCommentsResp.data.data.chat_comment_count})}</div>
                </div>

                {chatComments[chatId] && chatComments[chatId]?.map((comment, ind) => {
                    return (
                        <div key={comment.comment_id} className="">
                            <MessageOutput
                                user_full_name={comment.comment_by.user_full_name}
                                user_profile_key={comment.comment_by.user_profile_object_key}
                                content={comment.comment_text}
                                created_at={comment.comment_created_at}
                                attachments={comment.comment_attachments || []}
                                isModerator={false}
                                isCreator={userUUID === comment.comment_by.user_uuid}
                                user_uuid={comment.comment_by.user_uuid}
                                handleCreateOrUpdateReaction={(emojiId: string, reactionId: string) => handleCreateOrUpdateReaction(emojiId, reactionId, comment.comment_id, ind)}
                                handleRemoveReaction={(reactionId: string) => handleRemoveReaction(reactionId, comment.comment_id, ind)}
                                reactions={comment.comment_reactions == undefined ? [] : comment.comment_reactions}
                                handlePostUpdate={(postText: string) => handleCommentUpdate(postText, comment.comment_id, ind)}
                                handleRemovePost={() => handleRemoveCommentChat(comment.comment_id, ind)}
                                uniqueId={comment.comment_id}
                                messageType={COMMENT_TYPE}
                                commentCount={-1}
                                isArchived={userDeleted}
                            />


                        </div>

                    )

                })}
                <div className='p-4' ref={messagesEndRef}></div>

            </div>

            <div className={`sticky bottom-10 float-right mr-10 z-10 ${disableScrollToBottom ? "hidden" : ""}`}>
                <ArrowDownCircleIcon
                    className='h-14 hover:cursor-pointer hover:shadow-lg bg-gray-100 rounded-full hover:border-gray-700 border'
                    fill="" onClick={scrollToBottom}/>
            </div>

        </div>
    );
};

export default ChatMessages;

