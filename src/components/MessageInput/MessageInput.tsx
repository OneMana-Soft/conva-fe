import React, {useEffect, useRef} from "react";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import Mention from '@tiptap/extension-mention'
import {EditorProvider} from "@tiptap/react";
import {Editor} from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import MenuBar from "./MenuBar";
import MenuBarBottom from "./MenuBarBottom";
import Link from '@tiptap/extension-link'
import {mentionSuggestionOptions} from '../TipTap/MentionList/MentionList';
import {mergeAttributes} from "@tiptap/core"
import {DOMOutputSpec} from "@tiptap/pm/model";
import {openOtherUserProfilePopup} from "../../store/slice/popupSlice.ts";
import {useDispatch, useSelector} from "react-redux";
import CrossIcon from '../../assets/cross.svg?react'; // Import cross icon
import {
  deleteChannelPreviewFiles,
  ExtendedInputState,
  removeChannelUploadedFiles,
  updateChannelInputText
} from "../../store/slice/channelSlice.ts";
import {RootState} from "../../store/store.ts";
import {CHANNEL_TYPE, CHAT_TYPE, DM_TYPE, POST_TYPE} from "../../constants/MessageInput.ts";
import {deletePostPreviewFiles, removePostUploadedFiles, updatePostInputText} from "../../store/slice/postSlice.ts";
import {deleteDmPreviewFiles, removeDmUploadedFiles, updateDmInputText} from "../../store/slice/dmSlice.ts";
import {deleteChatPreviewFiles, removeChatUploadedFiles, updateChatInputText} from "../../store/slice/chatSlice.ts";
import {CodeBlockLowlight} from "@tiptap/extension-code-block-lowlight";
import {common, createLowlight} from "lowlight";
import { Extension } from "@tiptap/core";
import {getFileSVG, isInStandaloneMode} from "../../utils/Helper.ts";


interface MessageInputProp {
  Type: string
  UniqueId: string
  HandleSendMessage: () => Promise<boolean | undefined>
  PublishTypingWithThrottle: () => void
}
const MessageInput: React.FC<MessageInputProp> = ({Type, UniqueId, HandleSendMessage, PublishTypingWithThrottle}) => {

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



  const isStandAlone = isInStandaloneMode()

  const DisableEnter = Extension.create({
    addKeyboardShortcuts() {
      return {
        "Enter": ({ editor }) => {
          return !editor.view.dom.querySelector('.suggestion');

        }
      };
    },
  });


  const extensions = [
    Color,
    TextStyle,
    Link.configure({
      openOnClick: true,
      autolink: true,
      HTMLAttributes: {
        class: 'ext-link',
      },
    }),
    Mention.configure({
      suggestion: mentionSuggestionOptions,
      HTMLAttributes: {
        class: 'mention',
      },
      renderHTML: (prop): DOMOutputSpec => {
        return['span', mergeAttributes({ class: 'mention hover:cursor-pointer' , 'data-id': prop.node.attrs.id, 'data-label': prop.node.attrs.label, 'data-type': "mention"}), `@${prop.node.attrs.label}`]
      }
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

  if(!isStandAlone) {
    extensions.push(DisableEnter)
  }

  const onUpdate = (editor: Editor) => {
    PublishTypingWithThrottle()

    if(editor.isEmpty) {
      return
    }

    switch(Type) {
      case CHANNEL_TYPE:
        dispatch(updateChannelInputText({channelId: UniqueId, inputTextHTML: editor.getHTML()}))
        break
      case POST_TYPE:
        dispatch(updatePostInputText({postId: UniqueId, inputTextHTML: editor.getHTML()}))
        break
      case DM_TYPE:
        dispatch(updateDmInputText({dmId: UniqueId, inputTextHTML: editor.getHTML()}))
        break
      case CHAT_TYPE:
        dispatch(updateChatInputText({chatId: UniqueId, inputTextHTML: editor.getHTML()}))
        break
    }

  }

  const inputStateFromRedux:  ExtendedInputState =useSelector((state:RootState)=> {

        switch (Type) {

          case CHANNEL_TYPE:
            return state.channel.channelInputState

          case POST_TYPE:
            return state.post.postInputState

          case DM_TYPE:
            return state.dm.DmInputState

          case CHAT_TYPE:
            return state.chat.chatInputState

          default:
            return {} as ExtendedInputState
        }
      }
  )

  const removePreviewFile = (key: number) => {

    switch (Type) {
      case CHANNEL_TYPE:
        dispatch(deleteChannelPreviewFiles({channelId:UniqueId, key}))
        dispatch(removeChannelUploadedFiles({channelId: UniqueId, key}))
        break
      case POST_TYPE:
        dispatch(deletePostPreviewFiles({postId:UniqueId, key}))
        dispatch(removePostUploadedFiles({postId: UniqueId, key}))
        break
      case DM_TYPE:
        dispatch(deleteDmPreviewFiles({dmId:UniqueId, key}))
        dispatch(removeDmUploadedFiles({dmId: UniqueId, key}))
        break
      case CHAT_TYPE:
        dispatch(deleteChatPreviewFiles({chatId:UniqueId, key}))
        dispatch(removeChatUploadedFiles({chatId: UniqueId, key}))
        break
    }

  };

  return (
      <div>
        <div className='md:hidden flex flex-wrap'>
        {inputStateFromRedux[UniqueId]?.filePreview && inputStateFromRedux[UniqueId].filePreview.map((file, index) => (
            <div key={index}
                 className='flex relative justify-center items-center m-1 mt-2 p-1 border rounded-xl border-gray-700'>
              <button
                  className='absolute top-0 right-0 p-1 -mt-2 -mr-2 bg-white rounded-full border-gray-700 border'
                  onClick={() => removePreviewFile(file.key)}
              >
                <CrossIcon height='1rem' width='1rem' fill='#383838'/>
              </button>
              <div>

                <img
                    src={getFileSVG(file.fileName)}
                    alt="file"
                    className='w-10 h-10 m-1 rounded-lg'
                />
              </div>
              <div className='flex-col'>
                <div className='text-ellipsis truncate max-w-40 text-xs '>{file.fileName}</div>
                <div className='text-ellipsis truncate max-w-40 text-xs '>uploading: {file.progress}%</div>
              </div>

            </div>

        ))}
      </div>
  <div ref={mentionRef}
       className="flex pb-4 justify-center md:block shadow-inner message-input bg-gray-100 rounded-lg p-2 pl-2 pr-2 relative">
    <EditorProvider slotBefore={<MenuBar/>}
                    slotAfter={<MenuBarBottom UniqueId={UniqueId} Type={Type}
                                              HandleSendMessage={HandleSendMessage}/>} extensions={extensions}
                    onUpdate={({editor}) => {
                      onUpdate(editor)
                    }}><></>
    </EditorProvider>
  </div>
        </div>
)
  ;
};


export default MessageInput;