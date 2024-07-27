import React, {useEffect, useRef, useState} from 'react';
import {throttle} from "../../utils/Helper.ts";
import searchService, {CHAT_TYPE, searchRes} from "../../services/searchService.ts";
import GlobalSearchItem from "./GlobalSearchItem.tsx";
import profileService from "../../services/ProfileService.ts";
import {useTranslation} from "react-i18next";

interface ChatSearchListProp {
    updateChatInfo: (fromId: string, toId: string, chatId:string) => void
    searchQuery: string
}
const ChatSearchList: React.FC<ChatSearchListProp> = ({updateChatInfo, searchQuery}) => {

    const userProfile = profileService.getSelfUserProfile()
    const scrollDivRef = useRef<HTMLDivElement>(null);
    const {t} = useTranslation()


    const [newSearchChatOrCommentTime, setNewSearchChatOrCommentTime] = useState(0)
    const [hasMoreNewChatOrComment, setHasMoreNewChatOrComment] = useState(true)



    const LatestChatAndCommentList = searchService.getLatestChatsAndComments({global_search_text: searchQuery})
    const NewChatAndCommentList = searchService.getLatestChatsAndCommentsBefore({global_search_text: searchQuery, global_search_time_stamp:newSearchChatOrCommentTime})

    const [scrolledToLast, setScrolledToLast] = useState(false)


    const handleScroll = throttle(() => {
        if (scrollDivRef.current) {
            const { scrollTop, clientHeight, scrollHeight } = scrollDivRef.current;
            const scrolledToLastRaw = scrollTop + clientHeight >= scrollHeight - 400;

            setScrolledToLast(scrolledToLastRaw)

        }
    }, 100)

    const [chatsAndCommentsList, setChatsAndCommentsList] = useState<searchRes[]>([] as searchRes[])

    if(scrolledToLast && chatsAndCommentsList.length > 0 && hasMoreNewChatOrComment) {
        let epochTime = 0
        if(chatsAndCommentsList[chatsAndCommentsList.length -1].type == CHAT_TYPE) {
            epochTime = chatsAndCommentsList[chatsAndCommentsList.length -1].chat.created_date
        } else {
            epochTime = chatsAndCommentsList[chatsAndCommentsList.length -1].comment.created_date
        }
        setNewSearchChatOrCommentTime(epochTime)
        setHasMoreNewChatOrComment(false)
    }

    useEffect(() => {

        if (scrollDivRef.current) {
            scrollDivRef.current.addEventListener('scroll',handleScroll);
        }

        return () => {
            if (scrollDivRef.current) {
                scrollDivRef.current.removeEventListener('scroll',handleScroll);
            }
        };
    }, []);

    useEffect(() => {
        setChatsAndCommentsList([])
    }, [searchQuery]);


    useEffect(() => {
        if(LatestChatAndCommentList.data && LatestChatAndCommentList.data.data && LatestChatAndCommentList.data.data.page && chatsAndCommentsList.length == 0 && LatestChatAndCommentList.data.data.page.length > 0) {
            if(LatestChatAndCommentList.data) {
                setChatsAndCommentsList(LatestChatAndCommentList.data.data.page)
            }

            setHasMoreNewChatOrComment(LatestChatAndCommentList.data.data.has_more)
        }

    }, [LatestChatAndCommentList.data]);

    useEffect(() => {

        if(NewChatAndCommentList.data && NewChatAndCommentList.data.data && hasMoreNewChatOrComment && chatsAndCommentsList.length > 0) {
            chatsAndCommentsList.push(...NewChatAndCommentList.data.data.page)
            setChatsAndCommentsList(chatsAndCommentsList)
            setHasMoreNewChatOrComment(NewChatAndCommentList.data.data.has_more)
            setNewSearchChatOrCommentTime(0)
        }

    }, [NewChatAndCommentList.data]);


    return (
        <div className="overflow-y-auto max-h-[80vh] sidebax-extended-channels" ref={scrollDivRef}>

           {
               chatsAndCommentsList.length != 0 ? chatsAndCommentsList.map((chatAndComment ) => {

                    if(chatAndComment.chat) {
                        let otherUsername = chatAndComment.chat.chat_to_user_full_name
                        if(userProfile.userData?.data.dgraph.user_uuid == chatAndComment.chat.chat_to_user_id) {
                            otherUsername = chatAndComment.chat.chat_by_user_full_name
                        }
                        return <div key={chatAndComment.chat.chat_id} onClick={()=>{updateChatInfo(chatAndComment.chat.chat_by_user_id, chatAndComment.chat.chat_to_user_id, chatAndComment.chat.chat_id)}}>
                            <GlobalSearchItem mention={{username: chatAndComment.chat.chat_by_user_full_name, userImage: chatAndComment.chat.chat_by_profile, channel: otherUsername, type: "Chat", content: chatAndComment.chat.chat_body, time:chatAndComment.chat.created_date}} attachment={false}

                        /></div>
                    }else if(chatAndComment.comment) {
                        let otherUsername = chatAndComment.comment.comment_chat_to_user_full_name
                        if(userProfile.userData?.data.dgraph.user_uuid == chatAndComment.comment.comment_chat_to_user_id) {
                            otherUsername = chatAndComment.comment.comment_chat_from_user_full_name
                        }
                        return <div key={chatAndComment.comment.comment_id} onClick={()=>{updateChatInfo(chatAndComment.comment.comment_chat_from_user_id, chatAndComment.comment.comment_chat_to_user_id, chatAndComment.comment.comment_chat_id)}} >
                            <GlobalSearchItem mention={{username: chatAndComment.comment.comment_by_user_full_name, userImage: chatAndComment.comment.comment_by_profile, channel: otherUsername , type: "Chat Comment", content: chatAndComment.comment.comment_body, time:chatAndComment.comment.created_date}} attachment={false}

                        /></div>
                    }

                    return <></>
                })
                   : LatestChatAndCommentList.isLoading ? <div>{t('loadingLabel')}</div> :<div>{t('noChatsLabel')}</div>
            }


        </div>
    );
};

export default ChatSearchList;
