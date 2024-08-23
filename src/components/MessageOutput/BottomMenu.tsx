import React, {useState, useRef, useEffect, useCallback} from "react";
import {
  useCurrentEditor,
} from "@tiptap/react";
import EmojiPickerCount from "./EmojiPickerCount";
import EmojiPicker, { EmojiClickData, EmojiStyle } from "emoji-picker-react";
import {ReactionRes} from "../../services/PostService.ts";
import profileService from "../../services/ProfileService.ts";
import {useDispatch, useSelector} from "react-redux";
import {openAlertMsgPopup} from "../../store/slice/popupSlice.ts";
import {ChatBubbleOvalLeftEllipsisIcon} from "@heroicons/react/24/outline";
import {useNavigate} from "react-router-dom";
import {URL_CHANNEL, URL_CHATS} from "../../constants/routes/appNavigation.ts";
import {RootState} from "../../store/store.ts";
import {CHANNEL_TYPE, COMMENT_TYPE, DM_TYPE} from "../../constants/MessageInput.ts";
import AddEmojiIcon from "../../assets/addEmoji.svg?react";


interface bottomMenuProps {
  setEditableState: (newState: boolean) => void;
  editableState: boolean;
  handleCreateOrUpdateReaction: (emojiID: string, reactionId: string) =>  Promise<boolean>;
  handleRemoveReaction:  (reactionId: string) =>  Promise<boolean>;
  handlePostUpdate: (reactionText: string) => Promise<boolean>
  reactionList: ReactionRes[]
  content: string
  uniqueId: string
  messageType: string
  commentCount: number
  isArchived: boolean
}
interface CustomEmojiPickerCSSProperties extends React.CSSProperties {
  "--epr-emoji-size"?: string;
}
interface userSelectedOptionInterface {
  reactionId: string,
  emojiId: string
}

const BottomMenu: React.FC<bottomMenuProps> = ({
                                                 setEditableState,
                                                 editableState,
                                                 handleCreateOrUpdateReaction,
                                                 reactionList,
                                                 handleRemoveReaction,
                                                 handlePostUpdate,
                                                 uniqueId,
                                                 messageType,
                                                 commentCount,
                                                 isArchived,
                                                 content
                                               }) => {
  const [userSelectedOption, setUserSelectedOption] = useState<userSelectedOptionInterface>({} as userSelectedOptionInterface)

  const dispatch = useDispatch()
  const {editor} = useCurrentEditor();
  const [reactions, setReactions] = useState<{ [key: string]: string[] }>({});
  const navigate = useNavigate()
  const userProfile = profileService.getSelfUserProfile()
  const [emojiPickerState, setEmojiPickerState] = useState(false);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const emojiDivRef = useRef<HTMLDivElement>(null);
  const styleEmoji: CustomEmojiPickerCSSProperties = {};
  styleEmoji["--epr-emoji-size"] = `1.5rem`;
  const lastSelectedDMOrChannel = useSelector((state: RootState) => {

    switch (messageType) {
      case DM_TYPE:
        return state.lastSelectedPersist.lastSelectedDm

      case CHANNEL_TYPE:
        return state.lastSelectedPersist.lastSelectedChannel
    }
  })

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target as Node) &&
        emojiDivRef.current &&
        !emojiDivRef.current.contains(event.target as Node)
    ) {
      setEmojiPickerState(false);
    }
  }, []);



  useEffect(() => {
    editor?.commands.setContent(content)
  }, [content]);

  useEffect(() => {
    setUserSelectedOption({} as userSelectedOptionInterface)
    setReactions({})
    if (userProfile.userData && reactionList) {
      reactionList.forEach((reaction) => {
        if (reaction.reaction_added_by.user_uuid == userProfile.userData?.data.dgraph.user_uuid) {
          setUserSelectedOption({
            reactionId: reaction.uid,
            emojiId: reaction.reaction_emoji_id
          })
        }
        setReactions(prevReactions => ({
          ...prevReactions,
          [reaction.reaction_emoji_id]: [...(prevReactions[reaction.reaction_emoji_id] || []), reaction.reaction_added_by.user_name]
        }));

      })
    }


  }, [reactionList, userProfile.userData]);


  if (userProfile.isError && userProfile.isLoading) {
    return (<></>)
  }

  const handleEmojiClick = async (emojiId: string) => {
    if (isArchived) {
      return
    }

    let res = false
    if (emojiId == userSelectedOption.emojiId) {
      res = await handleRemoveReaction(userSelectedOption.reactionId)
    } else {
      res = await handleCreateOrUpdateReaction(emojiId, userSelectedOption.reactionId)

    }

    if (!res) {
      dispatch(openAlertMsgPopup({msgTitle: "Error", msg: "failed to add/remove emoji reaction", btnText: "ok"}))
    }

  }


// eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [emojiButtonRef, handleClickOutside]);


  let EditContentOptions: JSX.Element;

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
    navigate(basePath + '/' + lastSelectedDMOrChannel + '/' + uniqueId)
  }

  const handleEmojiButtonClick = () => {
    setEmojiPickerState(!emojiPickerState);
  };

  const previewConfig = {showPreview: false};

  const addReactionByEmojiData = async (emojiData: EmojiClickData) => {
    const res = await handleCreateOrUpdateReaction(emojiData.unified, userSelectedOption.reactionId)
    if (!res) {
      dispatch(openAlertMsgPopup({msgTitle: "Error", msg: "failed to add/remove emoji reaction", btnText: "ok"}))
    }
    setEmojiPickerState(false)

  };


  const handleOnClickSave = async () => {
    const htmlContent = editor?.getHTML()
    if (htmlContent) {
      const res = await handlePostUpdate(htmlContent)
      if (!res) {
        dispatch(openAlertMsgPopup({msg: "Failed to update post", btnText: "Ok", msgTitle: "Error"}))
        editor?.commands.setContent(content)
      }
    }
    setEditableState(false);
  };


  const handleOnClickCancel = () => {
    setEditableState(false);
    editor?.commands.setContent(content)
  };


  EditContentOptions = <></>;
  if (editableState) {
    EditContentOptions = (
        <div className="mb-2 flex">
          <button
              className="ml-2 mr-2 rounded-lg bg-sky-300 hover:bg-sky-400 p-2"
              onClick={handleOnClickSave}
          >
            save
          </button>
          <button
              className="ml-2 mr-2 rounded-lg bg-gray-200 hover:bg-gray-300 p-2"
              onClick={handleOnClickCancel}
          >
            cancel
          </button>
        </div>
    );
  }


  if (!editor) {
    return null;
  }

  return (
      <div className="ml-16 bg-gray-50 p-1 rounded-lg">
        {EditContentOptions}
        <div className="flex flex-wrap">
          {(messageType != COMMENT_TYPE) && commentCount !== 0 && <button
              className={`rounded p-2 m-0.5 hover:bg-gray-300 color-grey-300`}
              onClick={handleCommentClick}
          >
            <div className='flex flex-row'>
              <ChatBubbleOvalLeftEllipsisIcon className="h-6 w-6" fillOpacity='0'/>
              {commentCount !== 0 && <span className='ml-1'>{commentCount}</span>}
            </div>


          </button>}
          {!isArchived
              && Object.entries(reactions).length !== 0 && <button
                  className={`rounded p-2 m-0.5 hover:bg-gray-300 ${
                      emojiPickerState ? "bg-gray-300 color-grey-700" : "color-grey-300"
                  }`}
                  onClick={handleEmojiButtonClick}
                  ref={emojiButtonRef}
              >
                <AddEmojiIcon height="1.4rem" width="1.4rem" fill="#f3f4f6"/>
              </button>}
          {Object.entries(reactions).map(([emojiId, userNames]) => (
              <EmojiPickerCount key={emojiId} emojiId={emojiId} reactionUserNames={userNames}
                                onClickEmoji={handleEmojiClick} isSelected={userSelectedOption.emojiId == emojiId}/>
          ))}


        </div>
        <div className="z-80 absolute left-2 bottom-12 msg-output" ref={emojiDivRef}>
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
      </div>
  );
};

export default BottomMenu;
