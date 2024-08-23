import React, {Fragment, useCallback, useEffect, useRef, useState} from "react";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import Mention from "@tiptap/extension-mention";
import { EditorProvider } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import MenuBar from "./TopMenu";
import MenuBarBottom from "./BottomMenu";
import Link from "@tiptap/extension-link";
import { mentionSuggestionOptions } from "../TipTap/MentionList/MentionList";
import AddEmojiIcon from "../../assets/addEmoji.svg?react";
import EditIcon from "../../assets/edit.svg?react";


// import "./style.scss";
import Attachment from "./Attachment/Attachment";
import {DOMOutputSpec} from "@tiptap/pm/model";
import {mergeAttributes} from "@tiptap/core";
import {useDispatch, useSelector} from "react-redux";
import {openAlertMsgPopup, openOtherUserProfilePopup} from "../../store/slice/popupSlice.ts";
import {AttachmentMediaReq} from "../../services/MediaService.ts";
import {ReactionRes} from "../../services/PostService.ts";
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import {CHANNEL_TYPE, COMMENT_TYPE, DM_TYPE} from "@/constants/MessageInput.ts";
import {ChatBubbleOvalLeftEllipsisIcon, LinkIcon} from "@heroicons/react/24/outline";
import EmojiPicker, {EmojiClickData, EmojiStyle} from "emoji-picker-react";
import {URL_CHANNEL, URL_CHATS} from "@/constants/routes/appNavigation.ts";
import {useNavigate} from "react-router-dom";
import {RootState} from "@/store/store.ts";
import profileService from "@/services/ProfileService.ts";
import {Menu, Transition} from "@headlessui/react";
import {EllipsisVerticalIcon, TrashIcon} from "@heroicons/react/20/solid";
import {copyTextToClipboard, getCurrentUrl} from "@/utils/Helper.ts";

interface CustomEmojiPickerCSSProperties extends React.CSSProperties {
  "--epr-emoji-size"?: string;
}

interface MessageOutput {
  user_full_name: string
  user_profile_key: string
  created_at: string
  content: string
  attachments: AttachmentMediaReq[]
  isModerator: boolean,
  isCreator: boolean
  user_uuid: string
  handleCreateOrUpdateReaction: (emojiID: string, reactionId: string) => Promise<boolean>
  handleRemoveReaction: (reactionId: string) => Promise<boolean>
  handlePostUpdate: (postText: string) => Promise<boolean>
  reactions: ReactionRes[]
  handleRemovePost: () => Promise<boolean>
  uniqueId: string
  messageType: string
  commentCount: number
  isArchived: boolean

}
const MessageOutput: React.FC<MessageOutput> = ({
                                                  user_full_name,
                                                  user_profile_key,
                                                  created_at, content,
                                                  attachments,
                                                  isCreator,
                                                  isModerator,
                                                  user_uuid,
                                                  reactions,
                                                  handleCreateOrUpdateReaction,
                                                  handlePostUpdate,
                                                  handleRemovePost,
                                                  uniqueId,
                                                  messageType,
                                                  commentCount,
                                                  isArchived,
                                                  handleRemoveReaction}) => {
  const dispatch = useDispatch();
  const mentionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate()
  const [emojiPickerState, setEmojiPickerState] = useState(false);
  const emojiButtonRef=useRef<HTMLButtonElement>(null);
  const emojiDivRef=useRef<HTMLDivElement>(null);
  const userProfile = profileService.getSelfUserProfile()
  const [selectedReactionId, setSelectedReactionId] = useState('')

  const styleEmoji: CustomEmojiPickerCSSProperties = {};
  styleEmoji["--epr-emoji-size"] = `1.5rem`;

  const lastSelectedDMOrChannel=useSelector((state:RootState)=>{

    switch(messageType) {
      case DM_TYPE:
        return state.lastSelectedPersist.lastSelectedDm

      case CHANNEL_TYPE:
        return state.lastSelectedPersist.lastSelectedChannel
    }
  })

  useEffect(() => {
    setSelectedReactionId('')
    reactions.forEach((reaction)=> {
      if (reaction.reaction_added_by.user_uuid == userProfile.userData?.data.dgraph.user_uuid) {
        setSelectedReactionId(reaction.uid)
      }
    })
  }, [reactions, userProfile.userData]);

  const addReactionByEmojiData = async (emojiData: EmojiClickData) => {
    const res = await handleCreateOrUpdateReaction(emojiData.unified, selectedReactionId)
    if(!res) {
      dispatch(openAlertMsgPopup({msgTitle: "Error", msg: "failed to add/remove emoji reaction", btnText:"ok"}))
    }
    setEmojiPickerState(false)

  };


  const handleClickOutside = (event:MouseEvent) => {
    if (emojiButtonRef.current && !emojiButtonRef.current.contains(event.target as Node) && emojiDivRef.current && !emojiDivRef.current.contains(event.target as Node)) {
      setEmojiPickerState(false);
    }
  };

  const previewConfig = { showPreview: false };



// eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(()=>{
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  },[emojiButtonRef])

  useEffect(() => {
    if (mentionRef.current) {
      mentionRef.current.addEventListener("click", handleMentionClick);
    }
    return () => {
      if (mentionRef.current) {
        mentionRef.current.removeEventListener("click", handleMentionClick);
      }
    };
  }, []);

  const handleMentionClick = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLDivElement;
    if (target.classList.contains("mention")) {
      const userId = target.getAttribute("data-id")?.split("@")[0];
      if (userId) {
        dispatch(openOtherUserProfilePopup({ userId: userId }));
      }
    }
  }, [dispatch]);

  const [editableState, setEditableState] = useState(false);

  const extensions = [
    Color,
    TextStyle,
    Link.configure({
      openOnClick: true,
      autolink: true,
      HTMLAttributes: {
        class: "ext-link",
      },
    }),
    Mention.configure({
      suggestion: mentionSuggestionOptions,
      HTMLAttributes: {
        class: 'mention',
      },
      renderHTML: (prop): DOMOutputSpec => {
        return['span', mergeAttributes({ class: 'mention hover:cursor-pointer' , 'data-id': prop.node.attrs.id, 'data-label': prop.node.attrs.label, 'data-type': "mention"}), `@${prop.node.attrs.label}`]
      },

    }),
    StarterKit.configure({
      bulletList: {
        keepMarks: true,
        keepAttributes: false,
      },
      orderedList: {
        keepMarks: true,
        keepAttributes: false,
      },
      codeBlock: false
    }),
    CodeBlockLowlight.configure({
      lowlight: createLowlight(common)
    })
  ];



  const handleCommentClick = () => {

    let basePath = ''

    switch (messageType) {

      case DM_TYPE:
        basePath = URL_CHATS
        break;

      case CHANNEL_TYPE:
        basePath = URL_CHANNEL
        break;

    }
    navigate( basePath + '/' + lastSelectedDMOrChannel + '/' + uniqueId)
  }


  const handleEmojiButtonClick = () => {
    setEmojiPickerState(!emojiPickerState);
  };

  const handleDeletePost = async () => {
    const res = await handleRemovePost()
    if(!res) {
      dispatch(openAlertMsgPopup({msg:"Failed to delete post", msgTitle:"Error", btnText:"Ok"}))
    }
  }

  const handleCopyLinkToClipboard= () => {

    let text = ''
    const currentUrl = getCurrentUrl() || ''
    switch(messageType) {
      case CHANNEL_TYPE:
        text = `${currentUrl}/${uniqueId}`
        break;
      case DM_TYPE:
        text = `${currentUrl}/${uniqueId}`
        break;
      default:
        text = currentUrl
    }
    copyTextToClipboard(text||'')
  }

  const handleEditButtonClick = () => {
    setEditableState(!editableState);
  };

  return (
      <div
          className={`md:pl-2 group message-output bg-gray-50 border-gray-50 hover:border-t-gray-300 hover:border-b-gray-300 border-t border-b p-3 pb-0 relative inline-block w-full text-left ${
              editableState ? "editable" : ""
          }`}
          ref={mentionRef}
      >

        <div className="z-20 absolute right-2 top-6 msg-output" ref={emojiDivRef}>
          <EmojiPicker
              previewConfig={previewConfig}
              autoFocusSearch={false}
              emojiStyle={EmojiStyle.NATIVE}
              width="18rem"
              height="10rem"
              skinTonesDisabled={true}
              searchDisabled={true}
              open={emojiPickerState}
              onEmojiClick={addReactionByEmojiData}
              allowExpandReactions={false}
              style={styleEmoji}

          />
        </div>
        <div>
          <div
              className="absolute hidden group-hover:inline-flex -mt-9 pl-2 pr-2 rounded-full right-4 bg-gray-50 border-2 border-gray-300 flex flex-wrap flex-row-reverse">

            <div className="">
              <Menu as="div" className=" relative text-left">
                <div>
                  <Menu.Button
                      className="justify-center rounded-full hover:bg-gray-300 px-2 py-4 text-sm font-medium text-white  focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
                    <EllipsisVerticalIcon
                        className="h-4 w-4 text-violet-200 hover:text-violet-100"
                        aria-hidden="true"
                        fill="#383838"
                    />
                  </Menu.Button>
                </div>
                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items
                      className="z-10 absolute right-0 mt-2 w-32 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                    <div className="px-1 py-1">
                      {isCreator && !isArchived && <Menu.Item>
                        {({active}) => (
                            <button
                                className={`${
                                    active ? "bg-gray-300" : "text-gray-900"
                                } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                onClick={handleEditButtonClick}
                            >
                              <EditIcon
                                  className="mr-2 h-5 w-5"
                                  aria-hidden="true"
                                  stroke="#383838"
                              />
                              Edit
                            </button>
                        )}
                      </Menu.Item>}

                      {(isCreator || isModerator) && !isArchived && <Menu.Item>
                        {({active}) => (
                            <button
                                className={`${
                                    active ? "bg-gray-300" : "text-gray-900"
                                } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                onClick={handleDeletePost}
                            >
                              <TrashIcon
                                  className="mr-2 h-5 w-5"
                                  aria-hidden="true"
                                  fill="#383838"
                              />
                              Delete
                            </button>
                        )}
                      </Menu.Item>}
                      <Menu.Item>
                        {({active}) => (
                            <button
                                className={`${
                                    active ? "bg-gray-300" : "text-gray-900"
                                } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                onClick={handleCopyLinkToClipboard}
                            >
                              <LinkIcon
                                  className="mr-2 h-5 w-5"
                                  aria-hidden="true"

                              />
                              Copy Link
                            </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>

            {(messageType != COMMENT_TYPE) && <button
                className={`rounded-full p-2 m-0.5 hover:bg-gray-300 color-grey-300`}
                onClick={handleCommentClick}
            >
              <div className='flex flex-row'>
                <ChatBubbleOvalLeftEllipsisIcon className="h-5 w-5" fillOpacity='0'/>
                {commentCount !== 0 && <span className='ml-1'>{commentCount}</span>}
              </div>


            </button>}
            {!isArchived
                && <button
                    className={`rounded-full p-2 m-0.5 hover:bg-gray-300 ${
                        emojiPickerState ? "bg-gray-300 color-grey-700" : "color-grey-300"
                    }`}
                    onClick={handleEmojiButtonClick}
                    ref={emojiButtonRef}
                >
                  <AddEmojiIcon height="1.2rem" width="1.2rem" fill="#f3f4f6"/>
                </button>}



          </div>
        </div>
        <EditorProvider
            editable={editableState}
            slotBefore={
              <MenuBar
                  setEditableState={setEditableState}
                  editableState={editableState}
                  content={content}
                  userProfileObjectKey={user_profile_key}
                  createdAt={created_at}
                  userFullName={user_full_name}
                  userUUID={user_uuid}
                  isCreator={isCreator}
                  isModerator={isModerator}
                  handleRemovePost={handleRemovePost}
                  isArchived={isArchived}
                  messageType={messageType}
                  uniqueId={uniqueId}
              />
            }
            slotAfter={
              <MenuBarBottom
                  editableState={editableState}
                  setEditableState={setEditableState}
                  handleCreateOrUpdateReaction={handleCreateOrUpdateReaction}
                  handleRemoveReaction={handleRemoveReaction}
                  reactionList={reactions}
                  content={content}
                  handlePostUpdate={handlePostUpdate}
                  uniqueId={uniqueId}
                  messageType={messageType}
                  commentCount={commentCount}
                  isArchived={isArchived}
              />
            }
            content={content}
            extensions={extensions}
        >
          <>{!editableState && (attachments.length !== 0 && <Attachment attachmentsObject={attachments}/>)}</>
        </EditorProvider>
      </div>
  );
};

export default MessageOutput;
