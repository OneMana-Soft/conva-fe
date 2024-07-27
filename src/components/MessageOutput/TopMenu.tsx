import React, { Fragment } from "react";
import { useCurrentEditor } from "@tiptap/react";
import EditIcon from "../../assets/edit.svg?react";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon, TrashIcon } from "@heroicons/react/20/solid";
import BoldIcon from "../../assets/bold.svg?react";
import ItalicIcon from "../../assets/italic.svg?react";
import StrikeIcon from "../../assets/strike.svg?react";
import OrderedListIcon from "../../assets/ordered-list-.svg?react";
import BulledtedListIcon from "../../assets/bulleted-list.svg?react";
import BlockquoteIcon from "../../assets/blockquote.svg?react";
import CodeIcon from "../../assets/code-svgrepo-com.svg?react";
import CodeBlockIcon from "../../assets/code-block.svg?react";
import mediaService from "../../services/MediaService.ts";
import {copyTextToClipboard, formatDateFortPost, getCurrentUrl} from "../../utils/Helper.ts";
import ProfileIcon from "../../assets/user_profile.svg"
import {useDispatch} from "react-redux";
import {openAlertMsgPopup, openOtherUserProfilePopup} from "../../store/slice/popupSlice.ts";
import {LinkIcon} from "@heroicons/react/24/outline";
import {CHANNEL_TYPE, DM_TYPE} from "../../constants/MessageInput.ts";

interface topMenuProps {
    setEditableState: (newState: boolean) => void;
    editableState: boolean;
    content: string;
    userFullName: string;
    userProfileObjectKey: string
    createdAt: string
    userUUID: string
    isCreator: boolean
    isModerator: boolean
    handleRemovePost: () => Promise<boolean>
    isArchived: boolean
    messageType: string
    uniqueId:string
}

const TopMenu: React.FC<topMenuProps> = ({
    setEditableState,
    editableState,
    content,
    userFullName,
    userProfileObjectKey,
    createdAt,
    userUUID,
    isModerator,
    isCreator,
    handleRemovePost,
    messageType,
    uniqueId,
    isArchived

}) => {
    const { editor } = useCurrentEditor();
    const dispatch = useDispatch()

    const mediaRes = mediaService.getMediaURLForID(userProfileObjectKey || '')
    if(mediaRes.isError || mediaRes.isLoading) {
        return <></>
    }

  if (!editor) {
    return null;
  }

  const openUserProfile = () => {
      dispatch(openOtherUserProfilePopup({userId:userUUID}))
  }

  const handleDeletePost = async () => {
      const res = await handleRemovePost()
      if(!res) {
          dispatch(openAlertMsgPopup({msg:"Failed to delete post", msgTitle:"Error", btnText:"Ok"}))
      }
  }

  let FormattingOptions: JSX.Element;

  editor.setOptions({ editable: editableState });

  FormattingOptions = <></>;
  if (editableState) {
    FormattingOptions = (
      <div className="mt-4 hidden md:block">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`rounded p-2 m-0.5 hover:bg-gray-300 hover:color-grey-700 ${
            editor.isActive("bold")
              ? "bg-gray-300 color-grey-700"
              : "color-grey-300"
          }`}
        >
          <BoldIcon
            height="1rem"
            width="1rem"
            fill={editor.isActive("bold") ? "#000" : "#383838"}
          />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`rounded p-2 m-0.5 hover:bg-gray-300 hover:color-grey-700 ${
            editor.isActive("italic") ? "bg-gray-300" : ""
          }`}
        >
          <ItalicIcon
            height="1rem"
            width="1rem"
            fill={editor.isActive("italic") ? "#000" : "#383838"}
          />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={`rounded p-2 m-0.5 hover:bg-gray-300 hover:color-grey-700 ${
            editor.isActive("strike") ? "bg-gray-300" : ""
          }`}
        >
          <StrikeIcon
            height="1rem"
            width="1rem"
            fill={editor.isActive("strike") ? "#000" : "#383838"}
          />
        </button>
        <div className="ml-2 mr-2 h-5 w-0.5 inline-block bg-gray-300"></div>

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`rounded p-2 m-0.5 hover:bg-gray-300 hover:color-grey-700 ${
            editor.isActive("bulletList") ? "bg-gray-300" : ""
          }`}
        >
          <BulledtedListIcon
            height="1rem"
            width="1rem"
            fill={editor.isActive("bulletList") ? "#000" : "#383838"}
          />
        </button>
        <div className="ml-2 mr-2 h-5 w-0.5 inline-block bg-gray-300"></div>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`hover:bg-gray-300 hover:color-grey-700 rounded p-2 ${
            editor.isActive("orderedList") ? "bg-gray-300" : ""
          }`}
        >
          <OrderedListIcon
            height="1.5rem"
            width="1.5rem"
            fill={editor.isActive("orderedList") ? "#000" : "#383838"}
          />
        </button>
        <div className="ml-2 mr-2 h-5 w-0.5 inline-block bg-gray-300"></div>

        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          className={`rounded p-2 m-0.5 hover:bg-gray-300 hover:color-grey-700 ${
            editor.isActive("code") ? "bg-gray-300" : ""
          }`}
        >
          <CodeIcon
            height="1rem"
            width="1rem"
            fill={editor.isActive("code") ? "#000" : "#383838"}
          />
        </button>
        <div className="ml-2 mr-2 h-5 w-0.5 inline-block bg-gray-300"></div>

        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`hover:bg-gray-300 hover:color-grey-700 rounded p-2 m-0.5 ${
            editor.isActive("codeBlock") ? "bg-gray-300" : ""
          }`}
        >
          <CodeBlockIcon
            height="1rem"
            width="1rem"
            fill={editor.isActive("codeBlock") ? "#000" : "#383838"}
          />
        </button>
        <div className="ml-2 mr-2 h-5 w-0.5 inline-block bg-gray-300"></div>

        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`hover:bg-gray-300 hover:color-grey-700 rounded p-2 m-0.5 ${
            editor.isActive("blockquote") ? "bg-gray-300" : ""
          }`}
        >
          <BlockquoteIcon
            height="1rem"
            width="1rem"
            fill={editor.isActive("blockquote") ? "#000" : "#383838"}
          />
        </button>
      </div>
    );
  }

  const handleCopyLinkToClipboard= () => {

      let text = ''
      let currentUrl = getCurrentUrl() || ''
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
    editor.setOptions({ editable: editableState });
    if (editableState) {
      editor.commands.setContent(content);
    }
  };

  return (
    <div className="min-w-80 bg-gray-50 flex p-1 rounded-lg items-center justify-between relative">
      <div className="absolute border-solid border-2 border-gray-200 top-0 -ml-10 -mt-4 rounded-full overflow-hidden h-14 w-14 hover:cursor-pointer bg-gray-50" onClick={openUserProfile}>
        <img
            src={mediaRes.mediaData?.url || ProfileIcon}
          alt=""
        />
      </div>
      <div className="flex-col flex-1 justify-between">
        <div className="ml-2 flex w-full">
          <div className="ml-4 flex glex-row justify-between items-center">
            <div className="text-slate-700 font-semibold mr-2 hover:cursor-pointer" onClick={openUserProfile}>{userFullName}</div>
            <div className="text-slate-700 text-sm">{formatDateFortPost(createdAt)}</div>
          </div>
            <div className="flex-1 flex justify-end items-end">
              <Menu as="div" className=" relative inline-block text-left">
              <div>
                <Menu.Button className="inline-flex w-full justify-center rounded-md hover:bg-gray-300 px-2 py-2 text-sm font-medium text-white  focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
                  <EllipsisVerticalIcon
                    className="h-5 w-5 text-violet-200 hover:text-violet-100"
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
                <Menu.Items className="z-10 absolute right-0 mt-2 w-32 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                  <div className="px-1 py-1">
                      { isCreator && !isArchived && <Menu.Item>
                      {({ active }) => (
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
                      {({ active }) => (
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
                          {({ active }) => (
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
        </div>
        {FormattingOptions}
      </div>
    </div>
  );
  
};

export default TopMenu;
