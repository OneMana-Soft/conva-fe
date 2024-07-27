import React, { useRef, useState, useEffect } from 'react';
import AttachmentIcon from '../../assets/attachment.svg?react';
import EmojiIcon from '../../assets/emoji.svg?react';
import SendIcon from '../../assets/send.svg?react';
import CrossIcon from '../../assets/cross.svg?react'; // Import cross icon
import EmojiPicker, { EmojiClickData, EmojiStyle } from 'emoji-picker-react';
import { useCurrentEditor } from '@tiptap/react';
import axios, {AxiosRequestConfig} from 'axios';
import mediaService, {UploadFileInterfaceRes} from "../../services/MediaService.ts";
import {useDispatch, useSelector} from "react-redux";
import store, {RootState} from "../../store/store.ts";
import {
  addChannelPreviewFiles, addChannelUploadedFiles,
  deleteChannelPreviewFiles, ExtendedInputState,
  removeChannelUploadedFiles, updateChannelPreviewFiles
} from "../../store/slice/channelSlice.ts";
import {CHANNEL_TYPE, CHAT_TYPE, DM_TYPE, POST_TYPE} from "../../constants/MessageInput.ts";
import {
  addPostPreviewFiles,
  addPostUploadedFiles,
  deletePostPreviewFiles, removePostUploadedFiles,
  updatePostPreviewFiles
} from "../../store/slice/postSlice.ts";
import {
  addDmPreviewFiles,
  addDmUploadedFiles,
  deleteDmPreviewFiles, removeDmUploadedFiles,
  updateDmPreviewFiles
} from "../../store/slice/dmSlice.ts";
import {
  addChatPreviewFiles,
  addChatUploadedFiles,
  deleteChatPreviewFiles, removeChatUploadedFiles,
  updateChatPreviewFiles
} from "../../store/slice/chatSlice.ts";
import {openAlertMsgPopup} from "../../store/slice/popupSlice.ts";
import {getFileSVG, isInStandaloneMode} from "../../utils/Helper.ts";
import {updateMentionOpenedRecently} from "../../store/slice/mentionSlice.ts";


interface MenuBarBottomProp {
  Type: string
  UniqueId: string
  HandleSendMessage: () => Promise<boolean|undefined>
}
const MenuBarBottom: React.FC<MenuBarBottomProp> = ({Type, UniqueId, HandleSendMessage}) => {
  const [emojiPickerState, setEmojiPickerState] = useState(false);
  const refEmojiButton = useRef<HTMLDivElement>(null);
  const refEmojiDiv = useRef<HTMLDivElement>(null);
  const dispatch=useDispatch();
  const sendButtonRef = useRef<HTMLButtonElement>(null);

  const { editor } = useCurrentEditor();


  const handleClickOutside = (event:MouseEvent) => {
    if (emojiPickerState && refEmojiButton.current && refEmojiDiv.current && !refEmojiButton.current.contains(event.target as Node) && !refEmojiDiv.current.contains(event.target as Node)) {
      setEmojiPickerState(false);
    }
  };




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

  const handleKeyPress = (e: KeyboardEvent) => {
    const mentionsRecentlyOpened = store.getState().mention.openedRecently
    if(mentionsRecentlyOpened){
        dispatch(updateMentionOpenedRecently({openedRecently: false}))
        return
      }
      if (e.key == "Enter" && sendButtonRef.current && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
        sendButtonRef.current.click()
      }
  };

  const isStandAlone = isInStandaloneMode()

  useEffect(() => {
    if(isStandAlone) {
      return
    }
    if (editor?.view) {
      editor.view.dom.addEventListener('keydown', handleKeyPress);
    }

    // Clean up the event listener on component unmount
    return () => {
      if(isStandAlone) {
        return
      }
      if (editor?.view) {
        editor.view.dom.removeEventListener('keydown', handleKeyPress);
      }
    };
  }, [editor]);


  useEffect(() => {
        editor?.commands.setContent(inputStateFromRedux[UniqueId]?.inputTextHTML || '')
  }, [UniqueId]);



  useEffect(() => {
    return () => {
      if(inputStateFromRedux) {
        Object.entries(inputStateFromRedux).forEach(([UniqueId, inputState]) => {
          inputState.filePreview.forEach((previewFile) => {
            if(previewFile.progress != 100) {
              switch (Type) {
                case CHANNEL_TYPE:
                  dispatch(deleteChannelPreviewFiles({channelId:UniqueId, key: previewFile.key}))
                      break;
                case POST_TYPE:
                  dispatch(deletePostPreviewFiles({postId:UniqueId, key: previewFile.key}))
                  break;

                case DM_TYPE:
                  dispatch(deleteDmPreviewFiles({dmId:UniqueId, key: previewFile.key}))
                  break;

                case CHAT_TYPE:
                  dispatch(deleteChatPreviewFiles({chatId:UniqueId, key: previewFile.key}))
                  break;
              }

            }
          })
        })
      }
    }
  }, []);




// eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(()=>{
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  },[handleClickOutside, refEmojiButton])


  if (!editor) {
    return <div>No editor available</div>; // Placeholder or error message
  }

  const handleEmojiButtonClick = () => {
    setEmojiPickerState((prev) => !prev);
  };

  const handleEmojiCharacterClick = (emojiData: EmojiClickData) => {
    editor.commands.insertContent(emojiData.emoji);
    setEmojiPickerState(false);
  };

  const previewConfig = { showPreview: false };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const cancelToken = axios.CancelToken.source();
      const uniqueNum = Date.now()
      switch (Type) {
        case CHANNEL_TYPE:
          dispatch(addChannelPreviewFiles({channelId:UniqueId, filesUploaded:{key: uniqueNum, fileName: file.name, progress: 0, cancelSource: cancelToken}}))
          break;
        case POST_TYPE:
          dispatch(addPostPreviewFiles({postId:UniqueId, filesUploaded:{key: uniqueNum, fileName: file.name, progress: 0, cancelSource: cancelToken}}))
          break;

        case DM_TYPE:
          dispatch(addDmPreviewFiles({dmId:UniqueId, filesUploaded:{key: uniqueNum, fileName: file.name, progress: 0, cancelSource: cancelToken}}))
          break;

        case CHAT_TYPE:
          dispatch(addChatPreviewFiles({chatId:UniqueId, filesUploaded:{key: uniqueNum, fileName: file.name, progress: 0, cancelSource: cancelToken}}))
          break;

      }


        const config: AxiosRequestConfig = {
          cancelToken: cancelToken.token,
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded / (progressEvent.total || 100)) * 100);
            switch (Type) {
              case CHANNEL_TYPE:
                dispatch(updateChannelPreviewFiles({channelId:UniqueId, progress: progress, key:uniqueNum}))
                break

              case POST_TYPE:
                dispatch(updatePostPreviewFiles({postId:UniqueId, progress: progress, key:uniqueNum}))
                break

              case DM_TYPE:
                dispatch(updateDmPreviewFiles({dmId:UniqueId, progress: progress, key:uniqueNum}))
                break

              case CHAT_TYPE:
                dispatch(updateChatPreviewFiles({chatId:UniqueId, progress: progress, key:uniqueNum}))
                break

            }

          },
        }
        const res = mediaService.uploadMedia(file, config)
        res.then((res)=>{
          const uploadMediaRes:  UploadFileInterfaceRes = res.data
          switch (Type) {
            case CHANNEL_TYPE:
              dispatch(addChannelUploadedFiles({channelId: UniqueId, filesUploaded:{fileName: file.name, key: uniqueNum, url:  uploadMediaRes.object_name}}))
              break
            case POST_TYPE:
              dispatch(addPostUploadedFiles({postId: UniqueId, filesUploaded:{fileName: file.name, key: uniqueNum, url:  uploadMediaRes.object_name}}))
              break

            case DM_TYPE:
              dispatch(addDmUploadedFiles({dmId: UniqueId, filesUploaded:{fileName: file.name, key: uniqueNum, url:  uploadMediaRes.object_name}}))
              break

            case CHAT_TYPE:
              dispatch(addChatUploadedFiles({chatId: UniqueId, filesUploaded:{fileName: file.name, key: uniqueNum, url:  uploadMediaRes.object_name}}))
              break
          }


        })
        res.catch((error)=>{
          switch (Type) {
            case CHANNEL_TYPE:
              dispatch(deleteChannelPreviewFiles({channelId: UniqueId, key: uniqueNum}))
              break
            case POST_TYPE:
              dispatch(deletePostPreviewFiles({postId: UniqueId, key: uniqueNum}))
              break
            case DM_TYPE:
              dispatch(deleteDmPreviewFiles({dmId: UniqueId, key: uniqueNum}))
              break
            case CHAT_TYPE:
              dispatch(deleteChatPreviewFiles({chatId: UniqueId, key: uniqueNum}))
              break
          }

          console.error("error while uploading file: ", file.name, error)
        })

    }
  };

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

  const handleOnclickMessageSend = async () => {
    if(inputStateFromRedux[UniqueId]?.filePreview && inputStateFromRedux[UniqueId]?.filesUploaded) {
      if(inputStateFromRedux[UniqueId]?.filePreview.length !== inputStateFromRedux[UniqueId]?.filesUploaded.length) {
        dispatch(openAlertMsgPopup({msg: "File upload is in progress please wait", btnText: "Ok", msgTitle: "Alert"}))
        return
      }
    }

    const res = await HandleSendMessage()
    if(res) {
      editor.commands.clearContent()
    }
  }

  return (
      <div className='flex flex-col'>
        <div className='md:flex md:flex-wrap hidden'>
          {inputStateFromRedux[UniqueId]?.filePreview  && inputStateFromRedux[UniqueId].filePreview.map((file, index) => {

            const fileIcon = getFileSVG(file.fileName)
            return (<div key={index}
                         className='flex relative justify-center items-center m-1 mt-2 p-1 border rounded-xl border-gray-700'>
              <button
                  className='absolute top-0 right-0 p-1 -mt-2 -mr-2 bg-white rounded-full border-gray-700 border'
                  onClick={() => removePreviewFile(file.key)}
              >
                <CrossIcon height='1rem' width='1rem' fill='#383838'/>
              </button>
              <div>

                <img
                    src={fileIcon}
                    alt="file"
                    className='w-10 h-10 m-1 rounded-lg'
                />
              </div>
              <div className='flex-col'>
                <div className='text-ellipsis truncate max-w-40 text-xs '>{file.fileName}</div>
                <div className='text-ellipsis truncate max-w-40 text-xs '>uploading: {file.progress}%</div>
              </div>

            </div>)

          })}
        </div>
        <div className='flex bg-gray-100 p-1 rounded-lg'>
          <div className='flex-col'>
            <div className='mt-2 p-2 rounded hover:bg-gray-300'>
              <label htmlFor='file-upload' className='cursor-pointer'>
                <input
                    type='file'
                    key={inputStateFromRedux[UniqueId]?.filePreview && inputStateFromRedux[UniqueId].filePreview.length || 0}
                    id='file-upload'
                    multiple
                    onChange={handleFileUpload}
                    style={{display: 'none'}}
                />
                <AttachmentIcon height='1.4rem' width='1.4rem' fill='#383838'/>
              </label>
            </div>
          </div>
          <div className='flex md:flex-1 justify-end items-end'>
            <div className='mr-2 hidden md:block' ref={refEmojiButton}>
              <button
                  className={`rounded p-2 m-0.5 hover:bg-gray-300 ${
                      emojiPickerState
                          ? 'bg-gray-300 color-grey-700'
                          : 'color-grey-300'
                  }`}
                  onClick={handleEmojiButtonClick}
              >
                <EmojiIcon height='1.4rem' width='1.4rem' fill='#383838'/>
              </button>
            </div>

            <button
                className={`rounded p-2 m-0.5 hover:bg-gray-300 `}
                onClick={handleOnclickMessageSend}
                ref={sendButtonRef}
            >
              <SendIcon height='1.5rem' width='1.5rem' fill='#383838'/>
            </button>
          </div>

          <div className='z-40 absolute -mt-96 right-2' ref={refEmojiDiv}>
            <EmojiPicker
                previewConfig={previewConfig}
                autoFocusSearch={false}
                emojiStyle={EmojiStyle.NATIVE}
                width='20rem'
                height='23rem'
                open={emojiPickerState}
                onEmojiClick={handleEmojiCharacterClick}
            />
          </div>


        </div>
      </div>
  );
};

export default MenuBarBottom;