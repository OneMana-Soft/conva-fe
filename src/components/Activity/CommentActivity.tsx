import React, {useEffect, useRef, useState} from 'react';
import activityService from "../../services/activityService.ts";
import {throttle} from "../../utils/Helper.ts";
import ActivityItem from "../SideBar/Activity/ActivityItem.tsx";
import {CommentRes} from "../../services/PostService.ts";
import {useTranslation} from "react-i18next";

interface CommentListProp {
    updateChatInfo: (fromId: string, toId: string, chatId:string) => void
    updatePostInfo: (postId:string, channelId:string) => void
}
const CommentList: React.FC<CommentListProp> = ({updateChatInfo, updatePostInfo}) => {

    const [newActivityCommentTime, setNewActivityCommentTime] = useState(0)
    const [hasMoreNewComment, setHasMoreNewComment] = useState(true)

    const scrollDivRef = useRef<HTMLDivElement>(null);
    const {t} = useTranslation()


    const LatestCommentList = activityService.getLatestComments()
    const NewCommentList = activityService.getNewComments(newActivityCommentTime)

    const [scrolledToLast, setScrolledToLast] = useState(false)

    const handleScroll = throttle(() => {
        if (scrollDivRef.current) {
            const { scrollTop, clientHeight, scrollHeight } = scrollDivRef.current;
            const scrolledToLastRaw = scrollTop + clientHeight >= scrollHeight - 400;

            setScrolledToLast(scrolledToLastRaw)

        }
    }, 100)

    const [commentsList, setCommentsList] = useState<CommentRes[]>([] as CommentRes[])

    if(scrolledToLast && commentsList.length > 0 && hasMoreNewComment) {
        const lastTimeString = commentsList[commentsList.length -1].comment_created_at
        const epochTime = Math.ceil(Date.parse(lastTimeString) / 1000);
        setNewActivityCommentTime(epochTime)
        setHasMoreNewComment(false)
    }

    useEffect(() => {

        setCommentsList([] as CommentRes[])
        if (scrollDivRef.current) {
            scrollDivRef.current.addEventListener('scroll',handleScroll);
        }

        return () => {
            if (scrollDivRef.current) {
                scrollDivRef.current.removeEventListener('scroll',handleScroll);
            }
            setCommentsList([] as CommentRes[])
        };
    }, []);


    useEffect(() => {
        if(LatestCommentList.data && LatestCommentList.data.data && LatestCommentList.data.data.comments && commentsList.length == 0 && LatestCommentList.data.data.comments.length > 0) {
            if(LatestCommentList.data) {
                setCommentsList(LatestCommentList.data.data.comments)
            }

            setHasMoreNewComment(LatestCommentList.data.data.has_more)
        }

    }, [LatestCommentList.data]);

    useEffect(() => {

        if(NewCommentList.data && NewCommentList.data.data && hasMoreNewComment && commentsList.length > 0) {
            commentsList.push(...NewCommentList.data.data.comments)
            setCommentsList(commentsList)
            setHasMoreNewComment(NewCommentList.data.data.has_more)
            setNewActivityCommentTime(0)
        }

    }, [NewCommentList.data]);


    return (
        <div className="overflow-y-auto max-h-[80vh] sidebax-extended-channels" ref={scrollDivRef}>

           {
               commentsList.length != 0 ? commentsList.map((comment ) => {

                    if(comment.comment_post) {
                        return <div key={comment.comment_created_at} onClick={()=>{updatePostInfo(comment.comment_post?.post_id || '', comment.comment_post?.post_channel?.ch_id || '')}}><ActivityItem mention={{username: comment.comment_by.user_full_name, userImage: comment.comment_by.user_profile_object_key, channel: comment.comment_post.post_channel?.ch_name || '', type: "Channel Comment", content: comment.comment_text, timeAgo:''}} index={0}

                        /></div>
                    }else if(comment.comment_chat) {
                        return <div key={comment.comment_created_at} onClick={()=>{updateChatInfo(comment.comment_chat?.chat_from.user_uuid || '', comment.comment_chat?.chat_to.user_uuid || '', comment.comment_chat?.chat_uuid || '')}} ><ActivityItem mention={{username: comment.comment_by.user_full_name, userImage: comment.comment_by.user_profile_object_key, channel: comment.comment_chat.chat_from.user_full_name , type: "Chat Comment", content: comment.comment_text, timeAgo:''}} index={0}

                        /></div>
                    }

                    return <></>
                })
                   : LatestCommentList.isLoading ? <div>{t('loadingLabel')}</div>  : <div>{t('noCommentsLabel')}</div>
           }


        </div>
    );
};

export default CommentList;
