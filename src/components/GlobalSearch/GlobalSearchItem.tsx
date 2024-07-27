// ActivityItem.tsx

import React from "react";
import mediaService from "../../services/MediaService.ts";
import ProfileIcon from "../../assets/user_profile.svg"
import {formatDateForLatestPost, getFileSVGReact} from "../../utils/Helper.ts";

interface Mention {
  username: string;
  content: string;
  time: number;
  channel: string;
  userImage?: string;
  type: string;
}

interface Props {
  mention: Mention;
  attachment: boolean
}

const GlobalSearchItem: React.FC<Props> = ({ mention, attachment}) => {
  const profileImage = mediaService.getMediaURLForID(mention.userImage || '')
  const FileIcon = getFileSVGReact(mention.content)

  return (
    <div className="mr-2 p-2">
      {/*{index !== 0 && <hr className="border-gray-300 my-2" />}*/}
      <div
        className="p-2 cursor-pointer hover:border-blue-500 hover:shadow-xl rounded-2xl"
      >
        <div className="flex justify-between">
          <div className="text-xs text-gray-500">{`${mention.type} - ${mention.channel}`}</div>
          <div className="text-xs text-gray-500">{formatDateForLatestPost(mention.time)}</div>
        </div>
        <div className="flex items-center mb-2 p-2">
          { attachment ?
          <div className='mr-2'>
            <FileIcon height="3rem" width="3em" fill="#383838" />
          </div>

          : <img
            src={profileImage.mediaData?.url || ProfileIcon}
            alt={mention.username}
            className="h-16 w-16 rounded-full mr-2 object-cover"
          />}
          <div className="flex-1">
            <div className="flex justify-between">
              <div className="text-m font-medium text-gray-900">
                {mention.username}
              </div>
            </div>
            <div className="h-18 text-gray-900 text-sm overflow-hidden overflow-ellipsis line-clamp-3">
              {mention.content || ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchItem;
