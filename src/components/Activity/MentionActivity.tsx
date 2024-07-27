import React, {useEffect, useRef, useState} from 'react';
import activityService, {mentionsRes} from "../../services/activityService.ts";
import {throttle} from "../../utils/Helper.ts";
import ActivityItem from "../SideBar/Activity/ActivityItem.tsx";
import {useTranslation} from "react-i18next";

interface mentionListProp {
    updateChatInfo: (fromId: string, toId: string, chatId:string) => void
    updatePostInfo: (postId:string, channelId:string) => void
}
const MentionList: React.FC<mentionListProp> = ({updateChatInfo, updatePostInfo}) => {

    const [newActivityMentionTime, setNewActivityMentionTime] = useState(0)
    const [hasMoreNewMention, setHasMoreNewMention] = useState(true)

    const scrollDivRef = useRef<HTMLDivElement>(null);
    const {t} = useTranslation()


    const LatestMentionList = activityService.getLatestMentions()
    const NewMentionList = activityService.getNewMentions(newActivityMentionTime)

    const [scrolledToLast, setScrolledToLast] = useState(false)

    const handleScroll = throttle(() => {
        if (scrollDivRef.current) {
            const { scrollTop, clientHeight, scrollHeight } = scrollDivRef.current;
            const scrolledToLastRaw = scrollTop + clientHeight >= scrollHeight - 400;

            setScrolledToLast(scrolledToLastRaw)

        }
    }, 100)

    const [mentionsList, setMentionsList] = useState<mentionsRes[]>([] as mentionsRes[])

    if(scrolledToLast && mentionsList.length > 0 && hasMoreNewMention) {
        const lastTimeString = mentionsList[mentionsList.length -1].mention_created_at
        const epochTime = Math.ceil(Date.parse(lastTimeString) / 1000);
        setNewActivityMentionTime(epochTime)
        setHasMoreNewMention(false)
    }

    useEffect(() => {

        setMentionsList([] as mentionsRes[])
        if (scrollDivRef.current) {
            scrollDivRef.current.addEventListener('scroll',handleScroll);
        }

        return () => {
            if (scrollDivRef.current) {
                scrollDivRef.current.removeEventListener('scroll',handleScroll);
            }
            setMentionsList([] as mentionsRes[])
        };
    }, []);


    useEffect(() => {
        if(LatestMentionList.data && LatestMentionList.data.data && LatestMentionList.data.data.mentions && LatestMentionList.data.data.mentions.length > 0) {
            if(LatestMentionList.data) {
                setMentionsList(LatestMentionList.data.data.mentions)
            }

            setHasMoreNewMention(LatestMentionList.data.data.has_more)
        }

    }, [LatestMentionList.data]);

    useEffect(() => {

        if(NewMentionList.data && NewMentionList.data.data && hasMoreNewMention && mentionsList.length > 0) {
            mentionsList.push(...NewMentionList.data.data.mentions)
            setMentionsList(mentionsList)
            setHasMoreNewMention(NewMentionList.data.data.has_more)
            setNewActivityMentionTime(0)
        }

    }, [NewMentionList.data]);


    return (
        <div className="overflow-y-auto max-h-[79vh] sidebax-extended-channels" ref={scrollDivRef}>

           {
               mentionsList.length != 0 ? mentionsList.map((mention ) => {

                    if(mention.mention_post) {
                        return <div key={mention.mention_created_at} onClick={()=>{updatePostInfo(mention.mention_post.post_id, mention.mention_post.post_channel?.ch_id || '')}}><ActivityItem mention={{username: mention.mention_post.post_by.user_full_name, userImage: mention.mention_post.post_by.user_profile_object_key, channel: mention.mention_post.post_channel?.ch_name || '', type: "Channel", content: mention.mention_post.post_text, timeAgo:''}} index={0}

                        /></div>
                    }else if(mention.mention_chat) {
                        return <div key={mention.mention_created_at} onClick={()=>{updateChatInfo(mention.mention_chat.chat_from.user_uuid, mention.mention_chat.chat_to.user_uuid, mention.mention_chat.chat_uuid)}}><ActivityItem mention={{username: mention.mention_chat.chat_from.user_full_name, userImage: mention.mention_chat.chat_from.user_profile_object_key, channel: mention.mention_chat.chat_from.user_full_name , type: "Chat", content: mention.mention_chat.chat_body_text, timeAgo:''}} index={0}

                        /></div>
                    }else if(mention.mention_comment) {

                        if(mention.mention_comment.comment_post){
                            return <div key={mention.mention_created_at} onClick={()=>{updatePostInfo(mention.mention_comment.comment_post?.post_id || '', mention.mention_comment.comment_post?.post_channel?.ch_id || '')}}><ActivityItem mention={{username: mention.mention_comment.comment_by.user_full_name, userImage: mention.mention_comment.comment_by.user_profile_object_key, channel: mention.mention_comment.comment_post.post_channel?.ch_name || '' , type: "Channel comment", content: mention.mention_comment.comment_text, timeAgo:''}} index={0}

                            /></div>
                        }else if(mention.mention_comment.comment_chat){
                            return <div key={mention.mention_created_at} onClick={()=>{updateChatInfo(mention.mention_comment.comment_chat?.chat_from.user_uuid || '', mention.mention_comment.comment_chat?.chat_to.user_uuid || '', mention.mention_comment.comment_chat?.chat_uuid || '')}}><ActivityItem mention={{username: mention.mention_comment.comment_by.user_full_name, userImage: mention.mention_comment.comment_by.user_profile_object_key, channel: mention.mention_comment.comment_by.user_full_name , type: "Chat comment", content: mention.mention_comment.comment_text, timeAgo:''}} index={0}

                            /></div>
                        }
                    }
                    return <></>
                })
               : LatestMentionList.isLoading ? <div>{t('loadingLabel')}</div>  : <div>{t('noMentionsLabel')}</div>
            }


        </div>
    );
};

export default MentionList;
