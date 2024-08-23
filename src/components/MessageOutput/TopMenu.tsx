import React, {useCallback, useEffect} from "react";
import { useCurrentEditor } from "@tiptap/react";
import BoldIcon from "../../assets/bold.svg?react";
import ItalicIcon from "../../assets/italic.svg?react";
import StrikeIcon from "../../assets/strike.svg?react";
import OrderedListIcon from "../../assets/ordered-list-.svg?react";
import BulledtedListIcon from "../../assets/bulleted-list.svg?react";
import BlockquoteIcon from "../../assets/blockquote.svg?react";
import CodeIcon from "../../assets/code-svgrepo-com.svg?react";
import CodeBlockIcon from "../../assets/code-block.svg?react";
import mediaService from "../../services/MediaService.ts";
import {formatDateFortPost} from "../../utils/Helper.ts";
import {useDispatch} from "react-redux";
import { openOtherUserProfilePopup} from "../../store/slice/popupSlice.ts";
import {UserIcon} from "@heroicons/react/20/solid";

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
    editableState,
    userFullName,
    userProfileObjectKey,
    createdAt,
    userUUID
}) => {
    const { editor } = useCurrentEditor();
    const dispatch = useDispatch()
    useEffect(() => {
        editor?.setOptions({ editable: editableState });
    }, [editor, editableState]);

    const openUserProfile = useCallback(() => {
        dispatch(openOtherUserProfilePopup({ userId: userUUID }));
    }, [dispatch, userUUID]);

    const mediaRes = mediaService.getMediaURLForID(userProfileObjectKey || '')
    if(mediaRes.isError || mediaRes.isLoading) {
        return <></>
    }

  if (!editor) {
    return null;
  }

  let FormattingOptions: JSX.Element;

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

  return (
    <div className="min-w-80 bg-gray-50 flex p-1 rounded-lg justify-between">
      <div className="border-solid border-2 border-gray-200 rounded-lg overflow-hidden h-14 w-14 hover:cursor-pointer bg-gray-50" onClick={openUserProfile}>
          {mediaRes.mediaData?.url
              ?
              <img
                src={mediaRes.mediaData?.url}
                alt=""
              />
              :
              <UserIcon
                  fill="#616060"
              />

          }
      </div>
      <div className="flex-col flex-1 justify-start">
        <div className="flex w-full">
          <div className="ml-4 flex flex-row justify-start ">
            <div className="text-slate-700 font-semibold mr-2 hover:cursor-pointer" onClick={openUserProfile}>{userFullName}</div>
            <div className="text-slate-700 text-sm">{formatDateFortPost(createdAt)}</div>
          </div>

        </div>
        {FormattingOptions}
      </div>
    </div>
  );
  
};

export default TopMenu;
