import React, {useEffect, useRef, useState} from "react";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import Mention from "@tiptap/extension-mention";
import { EditorProvider } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import MenuBar from "./TopMenu";
import MenuBarBottom from "./BottomMenu";
import Link from "@tiptap/extension-link";
import { mentionSuggestionOptions } from "../TipTap/MentionList/MentionList";
// import "./style.scss";
import Attachment from "./Attachment/Attachment";
import {DOMOutputSpec} from "@tiptap/pm/model";
import {mergeAttributes} from "@tiptap/core";
import {useDispatch} from "react-redux";
import {openOtherUserProfilePopup} from "../../store/slice/popupSlice.ts";
import {AttachmentMediaReq} from "../../services/MediaService.ts";
import {ReactionRes} from "../../services/PostService.ts";
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';


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

  const handleMentionClick = (event: MouseEvent) => {
    const target = event.target as HTMLDivElement;
    if (target.classList.contains("mention")) {
      const userId = target.getAttribute("data-id")?.split("@")[0];
      if (userId) {
        dispatch(openOtherUserProfilePopup({userId: userId}));
      }
    }
  };
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

  return (
    <div
      className={`ml-8 mt-4  message-output bg-gray-50 shadow rounded-lg p-3 pb-0 focus-within:ring ring-sky-300 relative inline-block md:max-w-[70vw] max-w-[90vw] text-left ${
        editableState ? "editable" : ""
      }`}
      ref={mentionRef}
    >
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
        <>{!editableState && (attachments.length !== 0 && <Attachment attachmentsObject={attachments} />)}</>
      </EditorProvider>
    </div>
  );
};

export default MessageOutput;
