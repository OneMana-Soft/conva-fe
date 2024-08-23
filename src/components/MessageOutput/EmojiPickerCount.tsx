import React from 'react';
import {Emoji, EmojiStyle} from 'emoji-picker-react';
import Tooltip from "../Tooltip/tooltip.tsx";


interface EmojiReactionPickerProps {
  emojiId: string;
  reactionUserNames: string[];
  onClickEmoji: (emojiId: string) => void
    isSelected: boolean
}


const EmojiPickerCount: React.FC<EmojiReactionPickerProps> = ({ emojiId, reactionUserNames, onClickEmoji, isSelected}) => {

    const onClickEmojiHandle = ()=>{
        onClickEmoji(emojiId)
    }

    const truncateString = (str: string, maxLength: number) => {
        return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
    };

    const reactionUserNamesString =  truncateString(reactionUserNames.join(', '), 50);

  return (
    <div className='flex items-center m-0.5'>

        <Tooltip infoText={reactionUserNamesString}>
      <button className={`p-1 rounded-full hover:border-2 hover:border-gray-400 pr-2 ml-2 mr-2 ${isSelected ? "bg-gray-300" : "bg-gray-200"}`}
      onClick={onClickEmojiHandle}
      >
          <div className='flex'>
              <Emoji unified={emojiId} size={25} lazyLoad={true} emojiStyle={EmojiStyle.NATIVE}/>
              <div className='ml-2'>
                  {reactionUserNames.length || 0}
              </div>
          </div>

      </button>
            </Tooltip>
    </div>
  );
};

export default EmojiPickerCount;