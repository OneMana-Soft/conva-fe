import React, {useEffect, useState} from "react";
import {ArrowLeftIcon} from "@heroicons/react/20/solid";
import MessageInput from "../MessageInput/MessageInput.tsx";
import {useDispatch, useSelector} from "react-redux";
import {
    openAlertMsgPopup,
} from "../../store/slice/popupSlice.ts";
import channelService from "../../services/ChannelService.ts";
import profileService from "../../services/ProfileService.ts";
import {POST_TYPE} from "../../constants/MessageInput.ts";
import {RootState} from "../../store/store.ts";
import {AttachmentMediaReq} from "../../services/MediaService.ts";
import postService, {createPostCommentRes} from "../../services/PostService.ts";
import PostMessages from "./PostMessages.tsx";
import {clearPostInputState, createComment, ExtendedComments} from "../../store/slice/postSlice.ts";
import {useNavigate} from "react-router-dom";
import {URL_CHANNEL} from "../../constants/routes/appNavigation.ts";
import {useTranslation} from "react-i18next";
import {isZeroEpoch} from "../../utils/Helper.ts";


interface PostComponentProps {
    channelId: string
    postId: string
}

const PostComponent: React.FC<PostComponentProps> = ({ channelId, postId }) => {


    const [isProfileChannelModerator, setIsProfileChannelModerator] = useState(false)
    const [isProfileChannelMember, setIsProfileChannelMember] = useState(false)

    const dispatch = useDispatch()
    const postInputState = useSelector((state:RootState)=>state.post.postInputState[postId])
    const postComments = useSelector((state:RootState)=>
        state.post.postComments ? state.post.postComments: {} as ExtendedComments
    )
    const {t} = useTranslation()


    const navigate = useNavigate()

    const channelInfo = channelService.getChannelInfo(channelId)
    const userProfile = profileService.getSelfUserProfile()

    const postInfoWithAllComments = postService.postWithAllComments(postId)

    useEffect(() => {
        setIsProfileChannelModerator(false)
        setIsProfileChannelMember(false)
        if (channelInfo.data?.channel_info.ch_moderators) {
            for(let ind=0; ind < channelInfo.data.channel_info.ch_moderators.length; ind++) {
                if(userProfile.userData?.data.dgraph.user_uuid == channelInfo.data.channel_info.ch_moderators[ind].user_uuid){
                    setIsProfileChannelModerator(true)
                }
            }
        }

        if (channelInfo.data?.channel_info.ch_members) {
            for(let ind=0; ind < channelInfo.data.channel_info.ch_members.length; ind++) {
                if(userProfile.userData?.data.dgraph.user_uuid == channelInfo.data.channel_info.ch_members[ind].user_uuid){
                    setIsProfileChannelMember(true)
                }
            }
        }

    }, [channelInfo.data,userProfile.userData]);


    if( postInfoWithAllComments.isLoading || postInfoWithAllComments.isError || channelInfo.isLoading || userProfile.isError || !channelInfo.data) {
        return (<></>)
    }

    const handleSendMessage = async ()  => {
        if(postInputState && (postInputState.inputTextHTML || postInputState.filesUploaded) && userProfile.userData  ) {
            const inputAttachments: AttachmentMediaReq[] = []

            postInputState.filesUploaded.forEach((file) => {
                inputAttachments.push({
                    attachment_obj_key: file.url,
                    attachment_file_name: file.fileName,
                })
            })

            const createResp = await postService.CreateComment({post_id: postId, comment_text_html: postInputState.inputTextHTML, comment_attachments: inputAttachments})

            if(createResp.status != 200) {
                dispatch(openAlertMsgPopup({msg: "Failed to send message please connect with admin", btnText: "Ok", msgTitle:"Error"}))
                return false
            }

            const res :createPostCommentRes = createResp.data

            if(!(postInfoWithAllComments.data && postInfoWithAllComments.data.data.post_comments) || (postInfoWithAllComments.data && postInfoWithAllComments.data.data.post_comments && postComments[postId][postComments[postId].length -1].comment_id ==  postInfoWithAllComments.data.data.post_comments[postInfoWithAllComments.data.data.post_comments.length-1].comment_id)) {
                dispatch(createComment({commentId: res.data.comment_id, commentCreatedAt: res.data.comment_created_at, commentText: postInputState.inputTextHTML, postId: postId, commentBy: userProfile.userData.data.dgraph, attachments:inputAttachments}))
                // dispatch(incrementPostCommentCountByPostID({channelId: channelId, postId: postId}))
            }

            dispatch(clearPostInputState({postId: postId}))

            await postInfoWithAllComments.mutate()
            return true

        }

        return false
    }

    const handleJoinChannel = async () => {
        const joinChannelRes = await channelService.JoinChannel({channel_id: channelId})
        if(joinChannelRes.status == 200) {
            channelInfo.mutate()

        }
    }

    const handleChannelOnClick = () => {
        navigate(URL_CHANNEL + '/' + channelId)
    }

    const channelArchived =  !isZeroEpoch(channelInfo.data?.channel_info.ch_deleted_at || '')

    return (
        <>
            <div className="shadow flex flex-row items-center">
                <div className="font-semibold text-lg ml-6 mt-2 mb-2 flex justify-center items-center p-2 hover:cursor-pointer hover:bg-gray-300 rounded-xl pl-2/5 pr-4" onClick={handleChannelOnClick}>
                    <ArrowLeftIcon fill="#383838" className="h-6 w-6"/>
                    <div className='ml-4'>
                        {channelInfo.data.channel_info.ch_name}

                    </div>
                </div>
            </div>


            <PostMessages postId={postId} isModerator={isProfileChannelModerator} userUUID={userProfile.userData?.data.dgraph.user_uuid || ''} channelId={channelId} isArchived={channelArchived}/>

            <div className="message-input">
                {isProfileChannelMember ?
                    channelArchived
                    ?
                    <div className="flex justify-center items-center p-6 border-t border-gray-300 shadow-lg">
                        <div className=' items-center'>
                            {t('archivedChannelLabel')}
                        </div>
                    </div>
                    :
                    <MessageInput
                        UniqueId={postId}
                        Type={POST_TYPE}
                        HandleSendMessage={handleSendMessage}
                        PublishTypingWithThrottle={()=>{}}
                    />
                    :
                    <div className="flex justify-center items-center p-6 border-t border-gray-300 shadow-lg">
                        <div className=' items-center'>
                            {t('nonChannelMemberBlockLabel')}
                        </div>
                        <button className="bg-blue-500 hover:bg-blue-700 text-white ml-4 font-bold py-2 px-4 rounded-full w-fit" onClick={handleJoinChannel}>
                            Join Channel
                        </button>
                    </div>
                }
            </div>
        </>
    );
};

export default PostComponent;