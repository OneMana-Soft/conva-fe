import React, {useEffect, useRef, useState} from 'react';
import activityService, {reactionsRes} from "../../services/activityService.ts";
import {throttle} from "../../utils/Helper.ts";
import ActivityItem from "../SideBar/Activity/ActivityItem.tsx";
import {useTranslation} from "react-i18next";

interface ReactionListProp {
    updateChatInfo: (fromId: string, toId: string, chatId:string) => void
    updatePostInfo: (postId:string, channelId:string) => void
}
const ReactionList: React.FC<ReactionListProp> = ({updateChatInfo, updatePostInfo}) => {

    const [newActivityReactionTime, setNewActivityReactionTime] = useState(0)
    const [hasMoreNewReaction, setHasMoreNewReaction] = useState(true)

    const scrollDivRef = useRef<HTMLDivElement>(null);
    const {t} = useTranslation()


    const LatestReactionList = activityService.getLatestReactions()
    const NewReactionList = activityService.getNewReactions(newActivityReactionTime)

    const [scrolledToLast, setScrolledToLast] = useState(false)

    const handleScroll = throttle(() => {
        if (scrollDivRef.current) {
            const { scrollTop, clientHeight, scrollHeight } = scrollDivRef.current;
            const scrolledToLastRaw = scrollTop + clientHeight >= scrollHeight - 400;

            setScrolledToLast(scrolledToLastRaw)

        }
    }, 100)

    const [reactionsList, setReactionsList] = useState<reactionsRes[]>([] as reactionsRes[])

    if(scrolledToLast && reactionsList.length > 0 && hasMoreNewReaction) {
        const lastTimeString = reactionsList[reactionsList.length -1].reaction_added_at
        const epochTime = Math.ceil(Date.parse(lastTimeString) / 1000);
        setNewActivityReactionTime(epochTime)
        setHasMoreNewReaction(false)
    }

    useEffect(() => {

        if (scrollDivRef.current) {
            scrollDivRef.current.addEventListener('scroll',handleScroll);
        }

        return () => {
            if (scrollDivRef.current) {
                scrollDivRef.current.removeEventListener('scroll',handleScroll);
            }
            setReactionsList([] as reactionsRes[])
        };
    }, []);


    useEffect(() => {
        if(LatestReactionList.data && LatestReactionList.data.data && LatestReactionList.data.data.reactions && LatestReactionList.data.data.reactions.length > 0) {
            if(LatestReactionList.data) {
                setReactionsList(LatestReactionList.data.data.reactions)
            }

            setHasMoreNewReaction(LatestReactionList.data.data.has_more)
        }

    }, [LatestReactionList.data]);

    useEffect(() => {

        if(NewReactionList.data && NewReactionList.data.data && hasMoreNewReaction && reactionsList.length > 0) {
            reactionsList.push(...NewReactionList.data.data.reactions)
            setReactionsList(reactionsList)
            setHasMoreNewReaction(NewReactionList.data.data.has_more)
            setNewActivityReactionTime(0)
        }

    }, [NewReactionList.data]);


    return (
        <div className="overflow-y-auto max-h-[79vh] sidebax-extended-channels" ref={scrollDivRef}>

           {
               reactionsList.length != 0 ? reactionsList.map((reaction ) => {

                    if(reaction.post && reaction.post.post_channel) {
                        return <div key={reaction.reaction_added_at} onClick={()=>{updatePostInfo(reaction.post.post_id, reaction.post.post_channel?.ch_id || '')}}><ActivityItem mention={{username: reaction.reaction_added_by.user_full_name, userImage: '', channel: reaction.post.post_channel.ch_name, type: "Post Reaction", content: reaction.post.post_text, timeAgo:''}} index={0}  emojiId={reaction.reaction_emoji_id}

                        /></div>
                    }else if(reaction.chat) {
                        return <div key={reaction.reaction_added_at} onClick={()=>{updateChatInfo(reaction.chat.chat_from.user_uuid, reaction.chat.chat_to.user_uuid, reaction.chat.chat_uuid)}} ><ActivityItem mention={{username: reaction.reaction_added_by.user_full_name, userImage: '', channel: reaction.chat.chat_from.user_full_name, type: "Chat Reaction", content: reaction.chat.chat_body_text, timeAgo:''}} index={0} emojiId={reaction.reaction_emoji_id}

                        /></div>
                    }else if(reaction.comment != undefined) {
                        if(reaction.comment.comment_post) {
                            return <div key={reaction.reaction_added_at} onClick={()=>{updatePostInfo(reaction.comment.comment_post?.post_id || '', reaction.comment.comment_post?.post_channel?.ch_id || '')}}><ActivityItem mention={{username: reaction.reaction_added_by.user_full_name, userImage: '', channel: reaction.comment.comment_post.post_channel?.ch_name || '', type: "Post Comment Reaction", content: reaction.comment.comment_post.post_text, timeAgo:''}} index={0}  emojiId={reaction.reaction_emoji_id}


                            /></div>
                        }else if(reaction.comment.comment_chat) {
                            return <div key={reaction.reaction_added_at} onClick={()=>{updateChatInfo(reaction.chat.chat_from.user_uuid, reaction.chat.chat_to.user_uuid, reaction.chat.chat_uuid)}} ><ActivityItem mention={{username: reaction.reaction_added_by.user_full_name, userImage: '', channel: reaction.comment.comment_chat.chat_from.user_full_name, type: "Chat Comment Reaction", content: reaction.comment.comment_chat.chat_body_text, timeAgo:''}} index={0} emojiId={reaction.reaction_emoji_id}

                            /></div>
                        }

                    }

                    return <></>
                })
               : LatestReactionList.isLoading ? <div>{t('loadingLabel')}</div>  : <div>{t('noReactionsLabel')}</div>
            }


        </div>
    );
};

export default ReactionList;
