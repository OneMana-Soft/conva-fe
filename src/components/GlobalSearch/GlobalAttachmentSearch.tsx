import React, {useEffect, useRef, useState} from 'react';
import {throttle} from "../../utils/Helper.ts";
import searchService, {searchRes} from "../../services/searchService.ts";
import GlobalSearchItem from "./GlobalSearchItem.tsx";
import profileService from "../../services/ProfileService.ts";
import {useTranslation} from "react-i18next";

interface AttachmentSearchListProp {
    updateChatInfo: (fromId: string, toId: string, chatId:string) => void
    updatePostInfo: (postId:string, channelId:string) => void
    searchQuery: string
}
const AttachmentSearchList: React.FC<AttachmentSearchListProp> = ({updatePostInfo, updateChatInfo, searchQuery}) => {

    const [newSearchAttachmentTime, setNewSearchAttachmentTime] = useState(0)
    const [hasMoreNewAttachment, setHasMoreNewAttachment] = useState(true)

    const scrollDivRef = useRef<HTMLDivElement>(null);

    const userProfile = profileService.getSelfUserProfile()
    const {t} = useTranslation()


    const LatestAttachmentList = searchService.getLatestAttachments({global_search_text: searchQuery})
    const NewAttachmentList = searchService.getLatestAttachmentsBefore({global_search_text: searchQuery, global_search_time_stamp:newSearchAttachmentTime})

    const [scrolledToLast, setScrolledToLast] = useState(false)

    const handleScroll = throttle(() => {
        if (scrollDivRef.current) {
            const { scrollTop, clientHeight, scrollHeight } = scrollDivRef.current;
            const scrolledToLastRaw = scrollTop + clientHeight >= scrollHeight - 400;

            setScrolledToLast(scrolledToLastRaw)

        }
    }, 100)

    const [AttachmentsList, setAttachmentsList] = useState<searchRes[]>([] as searchRes[])

    if(scrolledToLast && AttachmentsList.length > 0 && hasMoreNewAttachment) {

        const epochTime = AttachmentsList[AttachmentsList.length -1].attachment.created_date

        setNewSearchAttachmentTime(epochTime)
        setHasMoreNewAttachment(false)
    }

    useEffect(() => {
        setAttachmentsList([])
    }, [searchQuery]);

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
        if(LatestAttachmentList.data && LatestAttachmentList.data.data && LatestAttachmentList.data.data.page && AttachmentsList.length == 0 && LatestAttachmentList.data.data.page.length > 0) {
            if(LatestAttachmentList.data) {
                setAttachmentsList(LatestAttachmentList.data.data.page)
            }

            setHasMoreNewAttachment(LatestAttachmentList.data.data.has_more)
        }

    }, [LatestAttachmentList.data]);

    useEffect(() => {

        if(NewAttachmentList.data && NewAttachmentList.data.data && hasMoreNewAttachment && AttachmentsList.length > 0) {
            AttachmentsList.push(...NewAttachmentList.data.data.page)
            setAttachmentsList(AttachmentsList)
            setHasMoreNewAttachment(NewAttachmentList.data.data.has_more)
            setNewSearchAttachmentTime(0)
        }

    }, [NewAttachmentList.data]);

    return (
        <div className="overflow-y-auto max-h-[80vh] sidebax-extended-channels" ref={scrollDivRef}>

           {
               AttachmentsList.length != 0 ? AttachmentsList.map((attachment ) => {

                     if(attachment.attachment.attachment_comment_id) {
                         if(attachment.attachment.attachment_post_id) {
                             return <div key={attachment.attachment.attachment_id} onClick={()=>{updatePostInfo(attachment.attachment.attachment_post_id, attachment.attachment.attachment_channel_id)}}>
                                 <GlobalSearchItem mention={{username: attachment.attachment.attachment_by_user_full_name, userImage: attachment.attachment.attachment_by_profile, channel: attachment.attachment.attachment_channel_name, type: "Channel Comment", content: attachment.attachment.attachment_file_name, time:attachment.attachment.created_date}} attachment={true}

                                 /></div>
                         }
                         if(attachment.attachment.attachment_chat_id) {
                             let otherUserName = attachment.attachment.attachment_chat_to_user_name
                             if(userProfile.userData?.data.dgraph.user_uuid == attachment.attachment.attachment_chat_to_user_id){
                                 otherUserName = attachment.attachment.attachment_chat_from_user_name
                             }
                             return <div key={attachment.attachment.attachment_id} onClick={()=>{updateChatInfo(attachment.attachment.attachment_chat_from_user_id, attachment.attachment.attachment_chat_to_user_id, attachment.attachment.attachment_chat_id)}} >
                                 <GlobalSearchItem mention={{username: attachment.attachment.attachment_by_user_full_name, userImage: attachment.attachment.attachment_by_profile, channel: otherUserName , type: "Chat Comment", content: attachment.attachment.attachment_file_name, time:attachment.attachment.created_date}} attachment={true}

                                 /></div>
                         }

                     } else if(attachment.attachment.attachment_post_id) {
                         return <div key={attachment.attachment.attachment_id} onClick={()=>{updatePostInfo(attachment.attachment.attachment_post_id, attachment.attachment.attachment_channel_id)}}>
                             <GlobalSearchItem mention={{username: attachment.attachment.attachment_by_user_full_name, userImage: attachment.attachment.attachment_by_profile, channel: attachment.attachment.attachment_channel_name, type: "Channel", content: attachment.attachment.attachment_file_name,time:attachment.attachment.created_date}} attachment={true}

                             /></div>
                     } else if(attachment.attachment.attachment_chat_id) {
                         let otherUserName = attachment.attachment.attachment_chat_to_user_name
                         if(userProfile.userData?.data.dgraph.user_uuid == attachment.attachment.attachment_chat_to_user_id){
                             otherUserName = attachment.attachment.attachment_chat_from_user_name
                         }
                         return <div key={attachment.attachment.attachment_id} onClick={()=>{updateChatInfo(attachment.attachment.attachment_chat_from_user_id, attachment.attachment.attachment_chat_to_user_id, attachment.attachment.attachment_chat_id)}} >
                             <GlobalSearchItem mention={{username: attachment.attachment.attachment_by_user_full_name, userImage: attachment.attachment.attachment_by_profile, channel: otherUserName , type: "Chat", content: attachment.attachment.attachment_file_name, time:attachment.attachment.created_date}} attachment={true}

                             /></div>
                     }
                    return <></>
                })
               : LatestAttachmentList.isLoading ? <div>{t('loadingLabel')}</div> : <div>No files found</div>

            }


        </div>
    );
};

export default AttachmentSearchList;