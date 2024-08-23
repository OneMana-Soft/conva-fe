import React, {useEffect, useRef, useState} from "react";
import MessageOutput from "../MessageOutput/MessageOutput.tsx";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../store/store.ts";

import {ArrowDownCircleIcon} from "@heroicons/react/24/solid";
import profileService from "../../services/ProfileService.ts";
import {isZeroEpoch, throttle} from "../../utils/Helper.ts";
import {DM_TYPE} from "../../constants/MessageInput.ts";
import dmService from "../../services/DmService.ts";
import {
    DmScrollPosition,
    ExtendedChats,
    updateChatAddedLocallyToSeen,
    updateDmChats,
    updateDmScrollPosition
} from "../../store/slice/dmSlice.ts";


interface ChannelMessagesProps {
    dmId: string
    userUUID: string
}

const DmMessages: React.FC<ChannelMessagesProps> = ({dmId, userUUID}) => {

    const dispatch = useDispatch()

    const [newDmChatTime, setNewDmChatTime] = useState(0)
    const [oldDmChatTime, setOldDmChatTime] = useState(0)


    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollDivRef = useRef<HTMLDivElement>(null);

    const [hasMoreOldChat, setHasMoreOldChat] = useState(true)
    const [hasMoreNewChat, setHasMoreNewChat] = useState(true)

    const [scrolledToLast, setScrolledToLast] = useState(false)
    const [scrolledToTop, setScrolledToTop] = useState(false)


    const dmChats = useSelector((state:RootState)=>
        state.dm.DmChats ? state.dm.DmChats: {} as ExtendedChats)

    const dmScrollPosition = useSelector((state:RootState) =>
        state.dm.DmScrollPosition ? state.dm.DmScrollPosition: {} as DmScrollPosition)

    const latestChatsResp = dmService.getLatestDmChats(dmId)
    const oldChatsResp = dmService.getOldChats(dmId, oldDmChatTime)
    const newChatsResp = dmService.getNewChats(dmId, newDmChatTime)

    const otherUserProfile = profileService.getUserProfileForID(dmId)


    if(dmChats[dmId] && dmChats[dmId][0] && hasMoreOldChat && scrolledToTop) {
        const lastTimeString = dmChats[dmId][0].chat_created_at
        const epochTime = Math.floor(Date.parse(lastTimeString) / 1000);
        setOldDmChatTime(epochTime)
        setHasMoreOldChat(false)
    }


    const newMessage = dmChats[dmId] && dmChats[dmId][dmChats[dmId].length-1] && dmChats[dmId][dmChats[dmId].length-1].chat_added_locally && messagesEndRef.current


    if(dmChats[dmId] && dmChats[dmId][dmChats[dmId].length -1] && hasMoreNewChat && scrolledToLast) {
        const lastTimeString = dmChats[dmId][dmChats[dmId].length -1].chat_created_at
        const epochTime = Math.ceil(Date.parse(lastTimeString) / 1000);
        setNewDmChatTime(epochTime)
        setHasMoreNewChat(false)
    }

    useEffect(()=>{
        if(latestChatsResp.chatData && latestChatsResp.chatData.data.chats && latestChatsResp.chatData.data.chats.length !== 0 && ( dmChats[dmId] == undefined || dmChats[dmId].length == 0)) {
            dispatch(updateDmChats({dmId: dmId, chats: latestChatsResp.chatData.data.chats.reverse()}))
            latestChatsResp.chatData.data.chats.reverse()
        }

        if(newMessage && messagesEndRef.current) {
            setNewDmChatTime(0)
            setOldDmChatTime(0)
            setHasMoreOldChat(false)
            setHasMoreNewChat(false)
            setTimeout(() => {
                if(messagesEndRef.current) {
                    messagesEndRef.current.scrollIntoView({
                        behavior: "smooth"
                    })
                    dispatch(updateChatAddedLocallyToSeen({dmId: dmId}))
                    setHasMoreOldChat(true)
                    setHasMoreNewChat(true)

                }

            }, 300);

        }



    },[latestChatsResp.chatData, dmChats])



    useEffect(()=>{

        if(dmChats[dmId] && newChatsResp.data &&  newDmChatTime != 0) {

            setHasMoreNewChat(newChatsResp.data.data.has_more)
            setNewDmChatTime(0)

            if(newChatsResp.data.data.chats && newChatsResp.data.data.chats.length != 0 && dmChats[dmId][dmChats[dmId].length -1].chat_uuid != newChatsResp.data.data.chats[0].chat_uuid) {
                dispatch(updateDmChats({dmId: dmId, chats: dmChats[dmId].concat(newChatsResp.data.data.chats)}))
            }

        }

    },[newChatsResp.data])


    useEffect(() => {

        if(dmChats[dmId] && oldChatsResp.data && oldDmChatTime != 0) {
            setHasMoreOldChat(oldChatsResp.data.data.has_more)
            setOldDmChatTime(0)
            if(oldChatsResp.data.data.chats && oldChatsResp.data.data.chats.length !== 0) {
                const chats = oldChatsResp.data.data.chats.reverse().concat(dmChats[dmId])
                dispatch(updateDmChats({dmId: dmId, chats: chats}))
                oldChatsResp.data.data.chats.reverse()

            }

        }

    }, [ oldChatsResp.data]);

    useEffect(()=>{

        setHasMoreOldChat(false)
        setHasMoreNewChat(false)
        setNewDmChatTime(0)
        setOldDmChatTime(0)


        setTimeout(async () => {
            await oldChatsResp.mutate()
            await newChatsResp.mutate()
            setHasMoreOldChat(true)
            setHasMoreNewChat(true)

        }, 2000);

        if(dmScrollPosition[dmId] && scrollDivRef.current && !newMessage) {
            setTimeout(() => {
                if(scrollDivRef.current) {
                    scrollDivRef.current.scrollTop = dmScrollPosition[dmId]
                }

            }, 300);

        }

        if(!dmScrollPosition[dmId]) {
            setTimeout(() => {
                if(messagesEndRef.current) {
                    messagesEndRef.current.scrollIntoView({
                        behavior: "smooth"
                    })
                }

                if (scrollDivRef.current) {
                    const {scrollTop, clientHeight, scrollHeight} = scrollDivRef.current;
                    const scrolledToLastRaw = scrollTop + clientHeight >= scrollHeight - 400;
                    const noOverflow = scrollHeight <= clientHeight;
                    setScrolledToLast(noOverflow || scrolledToLastRaw)
                }

            }, 300);
        }




    },[dmId])


    const disableScrollToBottom = (
        (latestChatsResp.chatData?.data.chats !== undefined ? latestChatsResp.chatData?.data.chats[0].chat_uuid : undefined) ===
        (dmChats[dmId]!== undefined && dmChats[dmId][dmChats[dmId].length - 1]
            ? dmChats[dmId][dmChats[dmId].length - 1].chat_uuid
            : undefined) &&
        (scrolledToLast || dmChats[dmId] == undefined)
    )



    const handleScroll = throttle(() => {
        if (scrollDivRef.current) {
            const { scrollTop, clientHeight, scrollHeight } = scrollDivRef.current;
            const scrolledToLastRaw = scrollTop + clientHeight >= scrollHeight - 400;
            const scrolledToTopRaw = scrollTop < 400

            setScrolledToLast(scrolledToLastRaw)
            setScrolledToTop(scrolledToTopRaw)
            dispatch(updateDmScrollPosition({ dmId: dmId, scrollTop: scrollTop }));

        }
    }, 100)


    useEffect(() => {

        if (scrollDivRef.current) {
            scrollDivRef.current.addEventListener('scroll',handleScroll);
        }

        return () => {
            if (scrollDivRef.current) {
                scrollDivRef.current.removeEventListener('scroll',handleScroll);
            }
        };
    }, [dmId]);


    const clearMessages = async () => {
        await latestChatsResp.dmMutate()

        setNewDmChatTime(0)
        setOldDmChatTime(0)
        setHasMoreOldChat(false)
        setHasMoreNewChat(false)

        dispatch(updateDmChats({dmId: dmId, chats:[]}))
        setTimeout(() => {

            setHasMoreOldChat(true)
            setHasMoreNewChat(true)

        }, 1000);

        setTimeout(() => {
            if(messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({
                    behavior: "smooth"
                })
            }

        }, 300);


    }

    const userProfile = profileService.getSelfUserProfile()

    if(userProfile.isLoading || userProfile.isError ) {
        return(<></>)
    }
    const handleCreateOrUpdateReaction = async (emojiId: string, reactionId: string, chatId:string) => {
        const res =  await dmService.CreateOrUpdateReaction({
            chat_id: chatId,
            reaction_dgraph_id: reactionId,
            reaction_emoji_id: emojiId
        });

        if(res.status == 200 && dmChats[dmId] &&  userProfile.userData ) {
            // if(reactionId) {
            //     dispatch(updateChatReaction({dmId,  chatIndex, reactionId, emojiId}))
            // } else {
            //     dispatch(createChatReaction({dmId, reactionId: resData.uid, emojiId, chatIndex, addedBy: userProfile.userData.data.dgraph}))
            // }

            return true

        }

        return false
    }

    const handleRemoveReaction = async (reactionId: string, chatId: string) => {
        const res = await dmService.RemoveReaction({chat_id: chatId, reaction_dgraph_id: reactionId})

        if(res.status == 200 &&  dmChats[dmId] ) {

            // dispatch(removeChatReaction({dmId: dmId, reactionId, chatIndex}))
            return true
        }

        return false
    }

    const handleChatUpdate = async (chatText: string, chatId: string) => {


        const res = await dmService.UpdateChat({chat_id: chatId, text_html: chatText})

        if(res.status == 200 &&  dmChats[dmId] ) {
            // dispatch(updateChat({chatIndex: chatIndex, dmId: dmId, htmlText: chatText}))
            return true
        }

        return false

    }

    const handleRemoveChat = async (chatId: string) => {
        const res = await dmService.DeleteChat({chat_id: chatId})
        if(res.status == 200) {
            // dispatch(removeChat({dmId: dmId, chatIndex: chatIndex}))
            return true
        }
        return false
    }


    let prevDate = "";

    const isUserDeleted = !isZeroEpoch(otherUserProfile.user?.data.user_deleted_at || '')


    return (
        <div className="grow message-output overflow-auto" ref={scrollDivRef}>
            <div className='flex-row'>
                {(oldChatsResp.isLoading) && <div>Loading...</div>}
                {dmChats[dmId] && dmChats[dmId]?.map((chat) => {
                    const postDate = new Date(chat.chat_created_at);
                    const currentDate = postDate.toDateString();
                    const shouldRenderDivider = currentDate !== prevDate;

                    prevDate = currentDate;
                    return (
                        <div key={chat.chat_uuid}>
                            {
                                shouldRenderDivider &&
                                <div className="font-semibold flex flex-col justify-center items-center mt-10 mb-4">
                                    <hr className='border border-gray-300 w-full'/>
                                    <div className='border-2 border-gray-300 p-1 pl-4 pr-4 rounded-full self-center -mt-4  bg-gray-50 text-sm'>{currentDate}</div>
                                </div>

                            }

                            <MessageOutput
                                user_full_name={chat.chat_from.user_full_name}
                                user_profile_key={chat.chat_from.user_profile_object_key}
                                content={chat.chat_body_text}
                                created_at={chat.chat_created_at}
                                attachments={chat.chat_attachments || []}
                                isModerator={false}
                                isCreator={userUUID === chat.chat_from.user_uuid}
                                user_uuid={chat.chat_from.user_uuid}
                                handleCreateOrUpdateReaction={(emojiId:string, reactionId: string)=> handleCreateOrUpdateReaction(emojiId, reactionId, chat.chat_uuid)}
                                handleRemoveReaction={(reactionId: string) => handleRemoveReaction(reactionId,  chat.chat_uuid)}
                                reactions={chat.chat_reactions == undefined? []:chat.chat_reactions}
                                handlePostUpdate = {(postText: string) => handleChatUpdate(postText, chat.chat_uuid)}
                                handleRemovePost = {()=>handleRemoveChat(chat.chat_uuid)}
                                uniqueId = {chat.chat_uuid}
                                messageType = {DM_TYPE}
                                commentCount = {chat.chat_comment_count}
                                isArchived={isUserDeleted}
                            />

                        </div>

                    )

                })}
                {(latestChatsResp.isLoading || newChatsResp.isLoading) && <div>Loading...</div>}
                <div className='p-4' ref={messagesEndRef}></div>

            </div>

            <div className={`sticky bottom-10 float-right mr-10 z-10 ${disableScrollToBottom ? "hidden" : ""}`}>
                <ArrowDownCircleIcon
                    className='h-14 hover:cursor-pointer hover:shadow-lg bg-gray-100 rounded-full hover:border-gray-700 border'
                    fill="" onClick={clearMessages}/>
            </div>

        </div>
    );
};

export default DmMessages;