import React, {ReactNode, useEffect, useState} from "react";
import MessageInput from "../MessageInput/MessageInput.tsx";
import {useDispatch, useSelector} from "react-redux";
import {
    openAlertMsgPopup,
 openOtherUserProfilePopup
} from "../../store/slice/popupSlice.ts";
import profileService, {
    USER_NOTIFICATION_ALL, USER_NOTIFICATION_BLOCK, USER_NOTIFICATION_MENTION,
    USER_STATUS_ONLINE,
    UserDgraphInfoInterface
} from "../../services/ProfileService.ts";
import { DM_TYPE} from "../../constants/MessageInput.ts";
import {RootState} from "../../store/store.ts";
import mediaService, {AttachmentMediaReq} from "../../services/MediaService.ts";
import dmService, {createChatRes} from "../../services/DmService.ts";
import {clearDmInputState, createChat, ExtendedChats} from "../../store/slice/dmSlice.ts";
import DmService from "../../services/DmService.ts";
import DmMessages from "./DmMessages.tsx";
import {isZeroEpoch, throttle} from "../../utils/Helper.ts";
import {ExtendedTypingState} from "../../store/slice/typingSlice.ts";
import TypingList from "../Typing/TypingList.tsx";
import ConfigService from "../../services/ConfigService.ts";
import {AtSymbolIcon, BellIcon, BellSlashIcon} from "@heroicons/react/24/outline";
import {updateSideBarState} from "../../store/slice/sidebarSlice.ts";
import {ArrowLeftIcon, UserIcon} from "@heroicons/react/20/solid";


interface GlobalSearchProps {
    dmId: string;
}

const DmComponent: React.FC<GlobalSearchProps> = ({ dmId }) => {

    const dispatch = useDispatch();
    const dmInputState = useSelector((state: RootState) => state.dm.DmInputState[dmId])
    const [notificationLoadingState, SetNotificationLoadingState] = useState(false)
    const mqttConfigRes = ConfigService.chatWithAllComments();
    const userProfile = profileService.getSelfUserProfile()
    const dmChats = useSelector((state: RootState) =>
        state.dm.DmChats ? state.dm.DmChats : {} as ExtendedChats
    )

    const latestChatsResp = dmService.getLatestDmChats(dmId)
    const userDms = DmService.getUserDmsInfoWithLatestPost()
    const otherUserProfile = profileService.getUserProfileForID(dmId)
    const profileData = mediaService.getMediaURLForID(otherUserProfile.user?.data.user_profile_object_key || '')
    const userTypingList: string[] = []
    const chatTyping = useSelector((state:RootState)=>
        state.typing.chatTyping ? state.typing.chatTyping: {} as ExtendedTypingState
    )

    useEffect(() => {
        SetNotificationLoadingState(false)
    }, [dmId]);


    if(latestChatsResp.isLoading || latestChatsResp.isError || userDms.isLoading || userDms.isError || otherUserProfile.isLoading || otherUserProfile.isError || profileData.isLoading || profileData.isError) {
        return <>LOADING...</>
    }

    if(chatTyping && chatTyping[dmId]) {

        for(const userTypingInfo of chatTyping[dmId]) {
            userTypingList.push(userTypingInfo.user.user_name)
        }
    }



    const handleSendMessage = async () => {
        if (dmInputState && (dmInputState.inputTextHTML || dmInputState.filesUploaded) && userProfile.userData) {
            const inputAttachments: AttachmentMediaReq[] = []

            dmInputState.filesUploaded.forEach((file) => {
                inputAttachments.push({
                    attachment_obj_key: file.url,
                    attachment_file_name: file.fileName,
                })
            })


            const createResp = await dmService.CreateChat({
                to_uuid: dmId,
                text_html: dmInputState.inputTextHTML,
                media_attachments: inputAttachments
            })

            if (createResp.status != 200) {
                dispatch(openAlertMsgPopup({
                    msg: "Failed to send message please connect with admin",
                    btnText: "Ok",
                    msgTitle: "Error"
                }))
                return false
            }

            const res: createChatRes = createResp.data
            if (!dmChats[dmId]) {
                dispatch(createChat({
                    chatId: res.data.chat_uuid,
                    chatCreatedAt: res.data.chat_created_at,
                    chatText: dmInputState.inputTextHTML,
                    dmId: dmId,
                    chatBy: userProfile.userData.data.dgraph,
                    attachments: inputAttachments,
                    chatTo: otherUserProfile.user?.data || {} as UserDgraphInfoInterface
                }))
                await mqttConfigRes.mutate()
            }

            dispatch(clearDmInputState({dmId: dmId}))

            await userDms.dmMutate()

            return true
        }

        return false
    }

    let notificationIconDiv: ReactNode

    switch(otherUserProfile.user?.data.notification_type) {
        case USER_NOTIFICATION_ALL:
            notificationIconDiv = <BellIcon className="h-6 w-6"/>
            break
        case USER_NOTIFICATION_MENTION:
            notificationIconDiv = <div className='relative flex'><BellIcon className="h-6 w-6"/><AtSymbolIcon className="h-4 w-4 m-1 -mt-0.5 -right-1 top-0 absolute bg-gray-100 group-hover:bg-gray-400 rounded-full"/></div>
            break
        case USER_NOTIFICATION_BLOCK:
            notificationIconDiv = <BellSlashIcon className="h-6 w-6"/>
    }

    const handleNotificationClick = async () => {
        if(otherUserProfile.user) {
            let newNotificationType = ''
            switch(otherUserProfile.user?.data.notification_type) {
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
            await DmService.UpdateChatNotificationType({to_user_id: dmId, notification_type: newNotificationType})
            otherUserProfile.user.data.notification_type = newNotificationType
            await otherUserProfile.mutate(otherUserProfile.user)
            SetNotificationLoadingState(false)
        }

    }
    const handleBackClick = () => {
        dispatch(updateSideBarState({active: true}))
    }



    return (
        <>
            <div className="shadow flex flex-row items-center p-1 border-b border-gray-400">
                <div className='md:hidden ml-4' onClick={handleBackClick}><ArrowLeftIcon fill="#383838" className="h-6 w-6"/></div>
                <div className="w-12 h-12  relative  ml-4">
                    {profileData.mediaData?.url
                        ?<img
                        className="w-12 h-12 hover:opacity-75 hover:cursor-pointer rounded-lg"
                        src={profileData.mediaData.url}
                        alt="Profile"
                        onClick={() => {
                            dispatch(openOtherUserProfilePopup({userId: dmId}));
                        }}
                    /> 
                    :
                        <div className="w-12 h-12 hover:opacity-75 hover:cursor-pointer rounded-lg">
                            <UserIcon
                                fill="#616060"
                            />
                        </div>}
                    <span
                        className={`absolute h-4 w-4 rounded-full right-0 bottom-0 border border-sky-950 ${otherUserProfile.user?.data.user_status == USER_STATUS_ONLINE && otherUserProfile.user?.data.user_device_connected && otherUserProfile.user?.data.user_device_connected > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>

                </div>


                <div className="hover:bg-gray-400 rounded-lg hover:cursor-pointer ml-1 p-2 m-2 mr-2 font-semibold text-lg"
                     onClick={() => {
                         dispatch(openOtherUserProfilePopup({userId: dmId}));
                     }}>
                    {otherUserProfile.user?.data.user_full_name}
                </div>

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
                        otherUserProfile.user?.data.notification_type &&
                        <div className="hover:bg-gray-400 rounded-lg hover:cursor-pointer p-2 m-2 group"
                             onClick={handleNotificationClick}>{notificationIconDiv}</div>
                }

            </div>


            <DmMessages dmId={dmId} userUUID={userProfile.userData?.data.dgraph.user_uuid || ''}/>
            {userTypingList.length > 0 && <TypingList userList={userTypingList}/>}


            <div className="message-input">

                {!isZeroEpoch(otherUserProfile.user?.data.user_deleted_at || '')

                    ?
                    <div className="flex justify-center items-center p-6 border-t border-gray-300 shadow-lg">
                        <div className=' items-center'>
                            User account has been deactivated
                        </div>
                    </div>
                    :

                <MessageInput
                    UniqueId={dmId}
                    Type={DM_TYPE}
                    HandleSendMessage={handleSendMessage}
                    PublishTypingWithThrottle={()=>publishChatTypingWithThrottle(dmId)}
                />}

            </div>
        </>
    );
};

const publishChatTypingWithThrottle =  throttle((dmId: string) => {
    dmService.PublishChatTyping({user_uuid: dmId})
}, 3000)

export default DmComponent;
