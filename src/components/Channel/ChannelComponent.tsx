import React, {ReactNode, useEffect, useState} from "react";
import {ArrowLeftIcon, PencilSquareIcon} from "@heroicons/react/20/solid";
import MessageInput from "../MessageInput/MessageInput.tsx";
import MembersIcon from "../../assets/members.svg?react";
import {useDispatch, useSelector} from "react-redux";
import {
    openAlertMsgPopup,
    openEditChannelMemberPopup,
    openEditChannelPopup
} from "../../store/slice/popupSlice.ts";
import channelService from "../../services/ChannelService.ts";
import profileService, {
    USER_NOTIFICATION_ALL,
    USER_NOTIFICATION_BLOCK,
    USER_NOTIFICATION_MENTION
} from "../../services/ProfileService.ts";
import {CHANNEL_TYPE} from "../../constants/MessageInput.ts";
import {RootState} from "../../store/store.ts";
import {AttachmentMediaReq} from "../../services/MediaService.ts";
import postService from "../../services/PostService.ts";
import {clearChannelInputState, ExtendedPosts} from "../../store/slice/channelSlice.ts";
import ChannelMessages from "./ChannelMessage.tsx";
import {ExtendedTypingState} from "../../store/slice/typingSlice.ts";
import TypingList from "../Typing/TypingList.tsx";
import {isZeroEpoch,  throttle} from "../../utils/Helper.ts";
import {AtSymbolIcon, BellIcon, BellSlashIcon} from "@heroicons/react/24/outline";
import {updateSideBarState} from "../../store/slice/sidebarSlice.ts";
import {useTranslation} from "react-i18next";


interface GlobalSearchProps {
    channelId: string;
}

const ChannelComponent: React.FC<GlobalSearchProps> = ({ channelId }) => {

    const dispatch = useDispatch();
    const [isProfileChannelModerator, setIsProfileChannelModerator] = useState(false)
    const [isProfileChannelMember, setIsProfileChannelMember] = useState(false)
    const channelInputState = useSelector((state: RootState) => state.channel.channelInputState[channelId])
    const channelInfo = channelService.getChannelInfo(channelId)
    const userProfile = profileService.getSelfUserProfile()
    const usersChannels = channelService.getUserChannelInfoWithLatestPost()
    const [notificationLoadingState, SetNotificationLoadingState] = useState(false)
    const channelPosts = useSelector((state: RootState) =>
        state.channel.channelPosts ? state.channel.channelPosts : {} as ExtendedPosts
    )
    const channelTyping = useSelector((state: RootState) =>
        state.typing.channelTyping ? state.typing.channelTyping : {} as ExtendedTypingState
    )
    const {t} = useTranslation()


    const latestPostsResp = postService.getLatestPosts(channelId)


    const userTypingList: string[] = []

    if (channelTyping && channelTyping[channelId]) {

        for (const userTypingInfo of channelTyping[channelId]) {
            userTypingList.push(userTypingInfo.user.user_name)
        }
    }


    useEffect(() => {
        setIsProfileChannelModerator(false)
        setIsProfileChannelMember(false)
        SetNotificationLoadingState(false)
        if (channelInfo.data?.channel_info.ch_moderators) {
            for (let ind = 0; ind < channelInfo.data.channel_info.ch_moderators.length; ind++) {
                if (userProfile.userData?.data.dgraph.user_uuid == channelInfo.data.channel_info.ch_moderators[ind].user_uuid) {
                    setIsProfileChannelModerator(true)
                }
            }
        }

        if (channelInfo.data?.channel_info.ch_members) {
            for (let ind = 0; ind < channelInfo.data.channel_info.ch_members.length; ind++) {
                if (userProfile.userData?.data.dgraph.user_uuid == channelInfo.data.channel_info.ch_members[ind].user_uuid) {
                    setIsProfileChannelMember(true)
                }
            }
        }

        if (usersChannels.channelData?.channels_list) {
            usersChannels.channelData.channels_list = usersChannels.channelData?.channels_list.map((ch) => {
                return ch.ch_id == channelId ? {...ch, unread_post_count: 0} : ch
            })
        }
    }, [channelInfo.data, userProfile.userData]);

    if (channelInfo.isError || channelInfo.isLoading || userProfile.isLoading || userProfile.isError) {
        return (<></>)
    }


    const handleJoinChannel = async () => {
        const joinChannelRes = await channelService.JoinChannel({channel_id: channelId})
        if (joinChannelRes.status == 200) {
            channelInfo.mutate()

        }
    }
    const handleSendMessage = async () => {
        if (channelInputState && (channelInputState.inputTextHTML.length > 0 || channelInputState.filesUploaded.length > 0) && userProfile.userData) {
            const inputAttachments: AttachmentMediaReq[] = []


            channelInputState.filesUploaded.forEach((file) => {
                inputAttachments.push({
                    attachment_obj_key: file.url,
                    attachment_file_name: file.fileName,
                })
            })

            const createResp = await postService.CreatePost({
                channel_id: channelId,
                post_text_html: channelInputState.inputTextHTML,
                post_attachments: inputAttachments
            })

            if (createResp.status != 200) {
                dispatch(openAlertMsgPopup({
                    msg: "Failed to send message please connect with admin",
                    btnText: "Ok",
                    msgTitle: "Error"
                }))
                return false
            }

            // const res :createPostRes = createResp.data
            if (!(latestPostsResp.data && latestPostsResp.data.data.posts) || (latestPostsResp.data && latestPostsResp.data.data.posts && channelPosts[channelId][channelPosts[channelId].length - 1].post_id == latestPostsResp.data.data.posts[0].post_id)) {
                // dispatch(createPost({postId: res.data.post_id, postCreatedAt: res.data.post_created_at, postText: channelInputState.inputTextHTML, channelId: channelId, postBy: userProfile.userData.data.dgraph, attachments:inputAttachments}))
                await latestPostsResp.mutate()
            }

            dispatch(clearChannelInputState({channelId: channelId}))

            await usersChannels.channelMutate()

            return true

        }

        return false
    }

    const handleNotificationClick = async () => {
        if (channelInfo.data) {
            let newNotificationType = ''
            switch (channelInfo.data?.channel_info.notification_type) {
                case USER_NOTIFICATION_ALL:
                    newNotificationType = USER_NOTIFICATION_MENTION
                    break
                case USER_NOTIFICATION_MENTION:
                    newNotificationType = USER_NOTIFICATION_BLOCK
                    break
                case USER_NOTIFICATION_BLOCK:
                    newNotificationType = USER_NOTIFICATION_ALL
            }

            SetNotificationLoadingState(true)
            await channelService.UpdateChannelNotificationType({
                channel_id: channelId,
                notification_type: newNotificationType
            })
            channelInfo.data.channel_info.notification_type = newNotificationType
            await channelInfo.mutate(channelInfo.data)
            SetNotificationLoadingState(false)
        }

    }

    let notificationIconDiv: ReactNode

    const channelArchived = !isZeroEpoch(channelInfo.data?.channel_info.ch_deleted_at || '')

    switch (channelInfo.data?.channel_info.notification_type) {
        case USER_NOTIFICATION_ALL:
            notificationIconDiv = <BellIcon className="h-6 w-6"/>
            break
        case USER_NOTIFICATION_MENTION:
            notificationIconDiv = <div className='relative flex'><BellIcon className="h-6 w-6"/><AtSymbolIcon
                className="h-4 w-4 m-1 -mt-0.5 -right-1 top-0 absolute bg-gray-100 group-hover:bg-gray-400 rounded-full"/>
            </div>
            break
        case USER_NOTIFICATION_BLOCK:
            notificationIconDiv = <BellSlashIcon className="h-6 w-6"/>
    }


    const handleBackClick = () => {
        dispatch(updateSideBarState({active: true}))
    }


    // <div className='h-1.5 w-1.5 bg-black rounded-full animate-bounce [animation-delay:-0.3s]'></div>
    // <div className='h-1.5 w-1.5 bg-black rounded-full animate-bounce [animation-delay:-0.15s]'></div>
    // <div className='h-1.5 w-1.5 bg-black rounded-full animate-bounce'></div>

    return (
        <>
            <div className="shadow flex flex-row items-center border-b border-gray-400">
                <div className='md:hidden ml-6' onClick={handleBackClick}><ArrowLeftIcon fill="#383838"
                                                                                         className="h-6 w-6"/></div>
                <div className="font-semibold text-lg ml-6 mt-1 mb-2 ">{channelInfo.data?.channel_info.ch_name}</div>
                {isProfileChannelModerator &&
                    <div className="hover:bg-gray-400 rounded-lg hover:cursor-pointer ml-4 p-2 m-2"
                         onClick={() => {
                             dispatch(openEditChannelPopup({channelId: channelId}));
                         }}><PencilSquareIcon fill="#383838" className="h-6 w-6"/></div>}
                <div className="hover:bg-gray-400 rounded-lg hover:cursor-pointer p-2 m-2 mr-4"
                     onClick={() => {
                         dispatch(openEditChannelMemberPopup({channelId: channelId}));
                     }}><MembersIcon fill="#383838" className="h-6 w-6"/></div>

                {
                    notificationLoadingState
                    ?
                        <>
                            <div
                                className='h-1.5 w-1.5 bg-black rounded-full animate-bounce [animation-delay:-0.3s]'></div>
                            <div
                                className='h-1.5 w-1.5 bg-black ml-1 rounded-full animate-bounce [animation-delay:-0.15s]'></div>
                            <div className='h-1.5 w-1.5 bg-black ml-1  rounded-full animate-bounce'></div>
                        </>
                    :
                        channelInfo.data?.channel_info.notification_type &&
                        <div className="hover:bg-gray-400 rounded-lg hover:cursor-pointer p-2 m-2 group"
                             onClick={handleNotificationClick}>{notificationIconDiv}</div>

                }
                {/*{channelInfo.data?.channel_info.notification_type &&*/}
                {/*    <div className="hover:bg-gray-400 rounded-lg hover:cursor-pointer ml-4 p-2 m-2 group"*/}
                {/*         onClick={handleNotificationClick}>{notificationIconDiv}</div>}*/}
            </div>


            <ChannelMessages channelId={channelId} isModerator={isProfileChannelModerator}
                             userUUID={userProfile.userData?.data.dgraph.user_uuid || ''}
                             channelArchived={channelArchived}/>

            {userTypingList.length > 0 && <TypingList userList={userTypingList}/>}

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
                            UniqueId={channelId}
                            Type={CHANNEL_TYPE}
                            HandleSendMessage={handleSendMessage}
                            PublishTypingWithThrottle={() => publishChannelTypingWithThrottle(channelId)}
                        />
                    :
                    <div className="flex justify-center items-center p-6 border-t border-gray-300 shadow-lg">
                        <div className=' items-center'>
                            {t('nonChannelMemberBlockLabel')}
                        </div>
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white ml-4 font-bold py-2 px-4 rounded-full w-fit"
                            onClick={handleJoinChannel}>
                            Join Channel
                        </button>
                    </div>
                }

            </div>
        </>
    );
};

const publishChannelTypingWithThrottle = throttle((channelId: string) => {
    channelService.PublishChannelTyping({channel_id: channelId})
}, 3000)

export default ChannelComponent;
