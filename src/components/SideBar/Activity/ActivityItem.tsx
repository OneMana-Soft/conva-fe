// ActivityItem.tsx

import React from "react";
import {removeHtmlTags} from "../../../utils/Helper.ts";
import mediaService from "../../../services/MediaService.ts";
import ProfileIcon from "../../../assets/user_profile.svg";
import {Emoji, EmojiStyle} from "emoji-picker-react";
import {UserIcon} from "@heroicons/react/20/solid";

interface Mention {
  username: string;
  content: string;
  timeAgo: string;
  channel: string;
  userImage: string;
  type: string;
}

interface Props {
  mention: Mention;
  index: number;
  emojiId ?: string
}

const ActivityItem: React.FC<Props> = ({ mention, index,  emojiId }) => {
  const profileImage = mediaService.getMediaURLForID(mention.userImage || '')

  return (
    <div key={index} className="mr-2 p-2">
      {index !== 0 && <hr className="border-gray-300 my-2" />}
      <div
        className="p-2 cursor-pointer hover:border-blue-500 hover:shadow-xl rounded-2xl"
      >
        <div className="flex justify-between">
          <div className="text-xs text-gray-500">{`${mention.type} - ${mention.channel}`}</div>
          <div className="text-xs text-gray-500">{mention.timeAgo}</div>
        </div>
        <div className="flex items-center mb-2 p-2">
          {emojiId ?
              <div className="mr-4"><Emoji unified={emojiId||''} size={40} lazyLoad={true} emojiStyle={EmojiStyle.GOOGLE}/></div>
          :
              (profileImage.mediaData?.url
                  ? <img
            src={profileImage.mediaData?.url || ProfileIcon}
            alt={mention.username}
            className="h-12 w-12 rounded-lg mr-2 object-cover"
          />
              : <div className="h-12 w-12 rounded-lg mr-2 object-cover">

                      <UserIcon
                      fill="#616060"
                  />
                      </div>
              )}
          <div className="flex-1">
            <div className="flex justify-between">
              <div className="text-m font-medium text-gray-900">
                {mention.username}
              </div>
            </div>
            <div className="max-w-52 h-18 text-gray-900 text-sm overflow-hidden overflow-ellipsis line-clamp-3">
              { removeHtmlTags(mention.content || '')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityItem;
