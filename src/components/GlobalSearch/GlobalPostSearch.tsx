import React, {useEffect, useRef, useState} from 'react';
import {throttle} from "../../utils/Helper.ts";
import searchService, { searchRes} from "../../services/searchService.ts";
import GlobalSearchItem from "./GlobalSearchItem.tsx";
import {POST_TYPE} from "../../constants/MessageInput.ts";
import {useTranslation} from "react-i18next";

interface PostSearchListProp {
    updatePostInfo: (postId:string, channelId:string) => void
    searchQuery: string
}
const PostSearchList: React.FC<PostSearchListProp> = ({updatePostInfo, searchQuery}) => {

    const [newSearchPostOrCommentTime, setNewSearchPostOrCommentTime] = useState(0)
    const [hasMoreNewPostOrComment, setHasMoreNewPostOrComment] = useState(true)

    const scrollDivRef = useRef<HTMLDivElement>(null);
    const {t} = useTranslation()


    const LatestPostAndCommentList = searchService.getLatestPostsAndComments({global_search_text: searchQuery})
    const NewPostAndCommentList = searchService.getLatestPostsAndCommentsBefore({global_search_text: searchQuery, global_search_time_stamp:newSearchPostOrCommentTime})

    const [scrolledToLast, setScrolledToLast] = useState(false)

    const handleScroll = throttle(() => {
        if (scrollDivRef.current) {
            const { scrollTop, clientHeight, scrollHeight } = scrollDivRef.current;
            const scrolledToLastRaw = scrollTop + clientHeight >= scrollHeight - 400;

            setScrolledToLast(scrolledToLastRaw)

        }
    }, 100)

    const [postsAndCommentsList, setPostsAndCommentsList] = useState<searchRes[]>([] as searchRes[])

    if(scrolledToLast && postsAndCommentsList.length > 0 && hasMoreNewPostOrComment) {
        let epochTime = 0
        if(postsAndCommentsList[postsAndCommentsList.length -1].type == POST_TYPE) {
            epochTime = postsAndCommentsList[postsAndCommentsList.length -1].post.created_date
        } else {
            epochTime = postsAndCommentsList[postsAndCommentsList.length -1].comment.created_date
        }

        setNewSearchPostOrCommentTime(epochTime)
        setHasMoreNewPostOrComment(false)
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
        setPostsAndCommentsList([])
    }, [searchQuery]);



    useEffect(() => {
        if(LatestPostAndCommentList.data && LatestPostAndCommentList.data.data && LatestPostAndCommentList.data.data.page && postsAndCommentsList.length == 0 && LatestPostAndCommentList.data.data.page.length > 0) {
            if(LatestPostAndCommentList.data) {
                setPostsAndCommentsList(LatestPostAndCommentList.data.data.page)
            }

            setHasMoreNewPostOrComment(LatestPostAndCommentList.data.data.has_more)
        }

    }, [LatestPostAndCommentList.data]);

    useEffect(() => {

        if(NewPostAndCommentList.data && NewPostAndCommentList.data.data && hasMoreNewPostOrComment && postsAndCommentsList.length > 0) {
            postsAndCommentsList.push(...NewPostAndCommentList.data.data.page)
            setPostsAndCommentsList(postsAndCommentsList)
            setHasMoreNewPostOrComment(NewPostAndCommentList.data.data.has_more)
            setNewSearchPostOrCommentTime(0)
        }

    }, [NewPostAndCommentList.data]);


    return (
        <div className="overflow-y-auto max-h-[80vh] sidebax-extended-channels" ref={scrollDivRef}>

           {
               postsAndCommentsList.length != 0 ? postsAndCommentsList.map((postAndComment ) => {

                    if(postAndComment.post) {
                        return <div key={postAndComment.post.post_id} onClick={()=>{updatePostInfo(postAndComment.post.post_id, postAndComment.post.post_ch_id)}}>
                            <GlobalSearchItem mention={{username: postAndComment.post.post_by_user_full_name, userImage: postAndComment.post.post_by_profile, channel: postAndComment.post.post_ch_name, type: "Channel", content: postAndComment.post.post_body, time:postAndComment.post.created_date}} attachment={false}

                        /></div>
                    }else if(postAndComment.comment) {
                        return <div key={postAndComment.comment.comment_id} onClick={()=>{updatePostInfo(postAndComment.comment.comment_post_id, postAndComment.comment.comment_channel_id)}} >
                            <GlobalSearchItem mention={{username: postAndComment.comment.comment_by_user_full_name, userImage: postAndComment.comment.comment_by_profile, channel: postAndComment.comment.comment_channel_name , type: "Channel Comment", content: postAndComment.comment.comment_body, time:postAndComment.comment.created_date}} attachment={false}

                        /></div>
                    }

                    return <></>
                })
               : LatestPostAndCommentList.isLoading ? <div>{t('loadingLabel')}</div> :<div>{t('noPostsLabel')}</div>
            }


        </div>
    );
};

export default PostSearchList;
