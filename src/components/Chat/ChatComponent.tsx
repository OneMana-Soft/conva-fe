import React from "react";
import {ArrowLeftIcon} from "@heroicons/react/20/solid";
import MessageInput from "../MessageInput/MessageInput.tsx";
import {useDispatch, useSelector} from "react-redux";
import {
    openAlertMsgPopup,
} from "../../store/slice/popupSlice.ts";
import profileService from "../../services/ProfileService.ts";
import {CHAT_TYPE} from "../../constants/MessageInput.ts";
import {RootState} from "../../store/store.ts";
import {AttachmentMediaReq} from "../../services/MediaService.ts";
import {createPostCommentRes} from "../../services/PostService.ts";
import ChatMessages from "./ChatMessages.tsx";
import {ExtendedComments} from "../../store/slice/postSlice.ts";
import {useNavigate} from "react-router-dom";
import { URL_CHATS} from "../../constants/routes/appNavigation.ts";
import chatService from "../../services/ChatService.ts";
import {clearChatInputState, createChatComment} from "../../store/slice/chatSlice.ts";
import {isZeroEpoch} from "../../utils/Helper.ts";

interface PostComponentProps {
    dmId: string
    chatId: string
}

const ChatComponent: React.FC<PostComponentProps> = ({ dmId, chatId }) => {


    const dispatch = useDispatch()
    const chatInputState = useSelector((state:RootState)=>state.chat.chatInputState[chatId])
    const chatComments = useSelector((state:RootState)=>
        state.chat.chatComments ? state.chat.chatComments: {} as ExtendedComments
    )

    const navigate = useNavigate()

    const userProfile = profileService.getSelfUserProfile()

    const chatInfoWithAllComments = chatService.chatWithAllComments(chatId)

    const otherUserProfile = profileService.getUserProfileForID(dmId)


    if( chatInfoWithAllComments.isLoading || chatInfoWithAllComments.isError || userProfile.isLoading || userProfile.isError || otherUserProfile.isLoading || otherUserProfile.isError) {
        return (<></>)
    }


    const handleSendMessage = async ()  => {
        if(chatInputState && (chatInputState.inputTextHTML.length > 0 || chatInputState.filesUploaded.length > 0) && userProfile.userData  ) {
            const inputAttachments: AttachmentMediaReq[] = []

            chatInputState.filesUploaded.forEach((file) => {
                inputAttachments.push({
                    attachment_obj_key: file.url,
                    attachment_file_name: file.fileName,
                })
            })

            const createResp = await chatService.CreateComment({chat_id: chatId, comment_text_html: chatInputState.inputTextHTML, comment_attachments: inputAttachments})

            if(createResp.status != 200) {
                dispatch(openAlertMsgPopup({msg: "Failed to send message please connect with admin", btnText: "Ok", msgTitle:"Error"}))
                return false
            }

            const res :createPostCommentRes = createResp.data

            if(!(chatInfoWithAllComments.data && chatInfoWithAllComments.data.data.chat_comments) || (chatInfoWithAllComments.data && chatInfoWithAllComments.data.data.chat_comments && chatComments[chatId][chatComments[chatId].length -1].comment_id ==  chatInfoWithAllComments.data.data.chat_comments[chatInfoWithAllComments.data.data.chat_comments.length-1].comment_id)) {
                dispatch(createChatComment({commentId: res.data.comment_id, commentCreatedAt: res.data.comment_created_at, commentText: chatInputState.inputTextHTML, chatId: chatId, commentBy: userProfile.userData.data.dgraph, attachments:inputAttachments}))
                // dispatch(incrementChatCommentCountByChatID({dmId: dmId, chatId: chatId}))
            }

            dispatch(clearChatInputState({chatId: chatId}))

            await chatInfoWithAllComments.mutate()
            return true

        }

        return false
    }


    const handleChannelOnClick = () => {
        navigate(URL_CHATS + '/' + dmId)
    }

    return (
        <>
            <div className="shadow flex flex-row items-center border-b border-gray-400">
                <div
                    className="font-semibold text-lg ml-6 mt-2 mb-2 flex justify-center items-center p-2 hover:cursor-pointer hover:bg-gray-300 rounded-xl pl-2/5 pr-4"
                    onClick={handleChannelOnClick}>
                    <ArrowLeftIcon fill="#383838" className="h-6 w-6"/>
                    <div className='ml-4'>
                        {otherUserProfile.user?.data.user_full_name}

                    </div>
                </div>
            </div>


            <ChatMessages chatId={chatId} userUUID={userProfile.userData?.data.dgraph.user_uuid || ''} dmId={dmId}/>

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
                        UniqueId={chatId}
                        Type={CHAT_TYPE}
                        HandleSendMessage={handleSendMessage}
                        PublishTypingWithThrottle={() => {
                        }}
                    />}

            </div>
        </>

    );
};

export default ChatComponent;