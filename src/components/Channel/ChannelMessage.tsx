import React, {useCallback, useEffect, useRef, useState} from "react";
import postService from "../../services/PostService.ts";
import MessageOutput from "../MessageOutput/MessageOutput.tsx";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../store/store.ts";
import {
    ChannelScrollPosition,
     ExtendedPosts,
    updateChannelPosts, updateChannelScrollPosition, updatePostAddedLocallyToSeen,
} from "../../store/slice/channelSlice.ts";
import {ArrowDownCircleIcon} from "@heroicons/react/24/solid";
import profileService from "../../services/ProfileService.ts";
import {throttle} from "../../utils/Helper.ts";
import {CHANNEL_TYPE} from "../../constants/MessageInput.ts";


interface ChannelMessagesProps {
    channelId: string
    isModerator: boolean
    userUUID: string
    channelArchived: boolean
}

const ChannelMessages: React.FC<ChannelMessagesProps> = ({channelId, isModerator, userUUID, channelArchived}) => {

    const dispatch = useDispatch()

    const [newChannelPostsTime, setNewChannelPostsTime] = useState(0)
    const [oldChannelPostTime, setOldChannelPostTime] = useState(0)


    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollDivRef = useRef<HTMLDivElement>(null);

    const [hasMoreOldPost, setHasMoreOldPost] = useState(true)
    const [hasMoreNewPost, setHasMoreNewPost] = useState(true)

    const [scrolledToLast, setScrolledToLast] = useState(false)
    const [scrolledToTop, setScrolledToTop] = useState(false)


    const channelPosts = useSelector((state:RootState)=>
        state.channel.channelPosts ? state.channel.channelPosts: {} as ExtendedPosts)

    const channelScrollPosition = useSelector((state:RootState) =>
        state.channel.channelScrollPosition ? state.channel.channelScrollPosition: {} as ChannelScrollPosition)

    const latestPostsResp = postService.getLatestPosts(channelId)
    const oldPostsResp = postService.getOldPosts(channelId, oldChannelPostTime)
    const newPostsResp = postService.getNewPosts(channelId, newChannelPostsTime)


    if(channelPosts[channelId] && channelPosts[channelId][0] && hasMoreOldPost && scrolledToTop) {
        const lastTimeString = channelPosts[channelId][0].post_created_at
        const epochTime = Math.floor(Date.parse(lastTimeString) / 1000);
        setOldChannelPostTime(epochTime)
        setHasMoreOldPost(false)
    }


    const newMessage = channelPosts[channelId] && channelPosts[channelId][channelPosts[channelId].length-1] && channelPosts[channelId][channelPosts[channelId].length-1].post_added_locally && messagesEndRef.current


    if(channelPosts[channelId] && channelPosts[channelId][channelPosts[channelId].length -1] && hasMoreNewPost && scrolledToLast) {
        const lastTimeString = channelPosts[channelId][channelPosts[channelId].length -1].post_created_at
        const epochTime = Math.ceil(Date.parse(lastTimeString) / 1000);
        setNewChannelPostsTime(epochTime)
        setHasMoreNewPost(false)
    }

    useEffect(()=>{
        if(latestPostsResp.data && latestPostsResp.data.data.posts && latestPostsResp.data.data.posts.length !== 0 && ( channelPosts[channelId] == undefined || channelPosts[channelId].length == 0)) {
            dispatch(updateChannelPosts({channelId: channelId, posts: latestPostsResp.data.data.posts.reverse()}))
            latestPostsResp.data.data.posts.reverse()
        }

        if(newMessage && messagesEndRef.current) {
            setNewChannelPostsTime(0)
            setOldChannelPostTime(0)
            setHasMoreOldPost(false)
            setHasMoreNewPost(false)
            setTimeout(() => {
                if(messagesEndRef.current) {
                    messagesEndRef.current.scrollIntoView({
                        behavior: "smooth"
                    })
                    dispatch(updatePostAddedLocallyToSeen({channelId: channelId}))
                    setHasMoreOldPost(true)
                    setHasMoreNewPost(true)

                }

            }, 300);

        }



    },[latestPostsResp.data, channelPosts])



    useEffect(()=>{

        if(channelPosts[channelId] && newPostsResp.data &&  newChannelPostsTime != 0) {

            setHasMoreNewPost(newPostsResp.data.data.has_more)
            setNewChannelPostsTime(0)

            if(newPostsResp.data.data.posts && newPostsResp.data.data.posts.length != 0 && channelPosts[channelId][channelPosts[channelId].length -1].post_id != newPostsResp.data.data.posts[0].post_id) {
                const posts = channelPosts[channelId].concat(newPostsResp.data.data.posts)
                dispatch(updateChannelPosts({channelId: channelId, posts: posts}))
            }

        }

    },[newPostsResp.data])


    useEffect(() => {

        if(channelPosts[channelId] && oldPostsResp.data && oldChannelPostTime != 0) {
            setHasMoreOldPost(oldPostsResp.data.data.has_more)
            setOldChannelPostTime(0)
            if(oldPostsResp.data.data.posts && oldPostsResp.data.data.posts.length !== 0) {
                const posts = oldPostsResp.data.data.posts.reverse().concat(channelPosts[channelId])
                dispatch(updateChannelPosts({channelId: channelId, posts: posts}))
                oldPostsResp.data.data.posts.reverse()

            }

        }

    }, [ oldPostsResp.data]);

    useEffect(()=>{

        setHasMoreOldPost(false)
        setHasMoreNewPost(false)
        setNewChannelPostsTime(0)
        setOldChannelPostTime(0)

        setTimeout(() => {

            setHasMoreOldPost(true)
            setHasMoreNewPost(true)

        }, 2000);

        if(channelScrollPosition[channelId] && scrollDivRef.current && !newMessage) {
            setTimeout(() => {
                if(scrollDivRef.current) {
                    scrollDivRef.current.scrollTop = channelScrollPosition[channelId]
                }

            }, 300);

        }

        if(!channelScrollPosition[channelId]) {
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




    },[channelId])


    const disableScrollToBottom = (
        (latestPostsResp.data?.data.posts !== undefined ? latestPostsResp.data?.data.posts[0].post_id : undefined) ===
        (channelPosts[channelId]!== undefined && channelPosts[channelId][channelPosts[channelId].length - 1]
            ? channelPosts[channelId][channelPosts[channelId].length - 1].post_id
            : undefined) &&
        (scrolledToLast || channelPosts[channelId] == undefined)
    )

    const handleScroll = useCallback(
        throttle(() => {
        if (scrollDivRef.current) {
            const { scrollTop, clientHeight, scrollHeight } = scrollDivRef.current;
            const scrolledToLastRaw = scrollTop + clientHeight >= scrollHeight - 400;
            const scrolledToTopRaw = scrollTop < 400

            setScrolledToLast(scrolledToLastRaw)
            setScrolledToTop(scrolledToTopRaw)
            dispatch(updateChannelScrollPosition({ channelId: channelId, scrollTop: scrollTop }));

        }
    }, 50),[channelId])


    useEffect(() => {

        if (scrollDivRef.current) {
            scrollDivRef.current.addEventListener('scroll',handleScroll);
        }

        return () => {
            if (scrollDivRef.current) {
                scrollDivRef.current.removeEventListener('scroll',handleScroll);
            }
        };
    }, [channelId]);


    const clearMessages = async () => {
        await latestPostsResp.mutate()

        setNewChannelPostsTime(0)
        setOldChannelPostTime(0)
        setHasMoreOldPost(false)
        setHasMoreNewPost(false)

        dispatch(updateChannelPosts({channelId: channelId, posts:[]}))
        setTimeout(() => {

            setHasMoreOldPost(true)
            setHasMoreNewPost(true)

        }, 3000);

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
    const handleCreateOrUpdateReaction = async (emojiId: string, reactionId: string, postId:string) => {
        const res =  await postService.CreateOrUpdateReaction({
            post_id: postId,
            reaction_dgraph_id: reactionId,
            reaction_emoji_id: emojiId
        });

        // const resData: AddReactionRes = res.data

        if(res.status == 200 && channelPosts[channelId] &&  userProfile.userData ) {
            // if(reactionId) {
            //     dispatch(updatePostReaction({channelId,  postIndex, reactionId, emojiId}))
            // } else {
            //     dispatch(createPostReaction({channelId, reactionId: resData.uid, emojiId, postIndex, addedBy: userProfile.userData.data.dgraph}))
            // }

            return true

        }

        return false
    }

    const handleRemoveReaction = async (reactionId: string, postId: string) => {
        const res = await postService.RemoveReaction({post_id: postId, reaction_dgraph_id: reactionId})

        if(res.status == 200 &&  channelPosts[channelId] ) {

            // dispatch(removePostReaction({channelId: channelId, reactionId, postIndex}))
            return true
        }

        return false
    }

    const handlePostUpdate = async (postText: string, postId: string) => {


        const res = await postService.UpdatePost({post_id: postId, post_text_html: postText})

        if(res.status == 200 &&  channelPosts[channelId] ) {
            // dispatch(updatePost({postIndex: postIndex, channelId: channelId, htmlText: postText}))
            return true
        }


        return false


    }

    const handleRemovePost = async (postId: string) => {
        const res = await postService.DeletePost({post_id: postId})
        if(res.status == 200) {
            // dispatch(removePost({channelId: channelId, postIndex: postIndex}))
            await latestPostsResp.mutate()
            return true
        }
        return false
    }


    let prevDate = "";


    return (
        <div className="grow message-output overflow-auto" ref={scrollDivRef}>
            <div className='flex-row'>
                {(oldPostsResp.isLoading) && <div>Loading...</div>}
                {channelPosts[channelId] && channelPosts[channelId]?.map((post) => {
                    const postDate = new Date(post.post_created_at);
                    const currentDate = postDate.toDateString();
                    const shouldRenderDivider = currentDate !== prevDate;
                    prevDate = currentDate;
                    return (
                        <div key={post.post_id}>
                            {
                                shouldRenderDivider &&
                                <div className="font-semibold flex flex-col justify-center items-center mt-10 mb-4">
                                    <hr className='border border-gray-300 w-full'/>
                                    <div className='border-2 border-gray-300 p-1 pl-4 pr-4 rounded-full self-center -mt-4 bg-gray-50 text-sm'>{currentDate}</div>
                                </div>

                            }

                            <MessageOutput
                                user_full_name={post.post_by.user_full_name}
                                user_profile_key={post.post_by.user_profile_object_key}
                                content={post.post_text}
                                created_at={post.post_created_at}
                                attachments={post.post_attachments || []}
                                isModerator={isModerator}
                                isCreator={userUUID === post.post_by.user_uuid}
                                user_uuid={post.post_by.user_uuid}
                                handleCreateOrUpdateReaction={(emojiId:string, reactionId: string)=> handleCreateOrUpdateReaction(emojiId, reactionId, post.post_id)}
                                handleRemoveReaction={(reactionId: string) => handleRemoveReaction(reactionId,  post.post_id)}
                                reactions={post.post_reactions == undefined? []:post.post_reactions}
                                handlePostUpdate = {(postText: string) => handlePostUpdate(postText, post.post_id)}
                                handleRemovePost = {()=>handleRemovePost(post.post_id)}
                                uniqueId = {post.post_id}
                                messageType = {CHANNEL_TYPE}
                                commentCount = {post.post_comment_count}
                                isArchived={channelArchived}

                            />


                        </div>

                    )

                })}
                {(latestPostsResp.isLoading || newPostsResp.isLoading) && <div>Loading...</div>}
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

export default ChannelMessages;

// className="bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
