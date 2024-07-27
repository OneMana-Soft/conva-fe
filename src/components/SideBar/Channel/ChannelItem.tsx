import React from "react";
import { LockClosedIcon } from "@heroicons/react/20/solid";
import mediaService from "../../../services/MediaService.ts";
import MembersIcon from "../../../assets/members.svg";
import { formatDateForLatestPost, removeHtmlTags } from "../../../utils/Helper.ts";
import {useTranslation} from "react-i18next";

interface ChannelItemProps {
  lastUsername: string;
  lastUserMessage: string;
  lastMessageTime: string;
  channelName: string;
  unseenMessageCount: number;
  channelProfileKey: string;
  privateChannel: boolean;
  channelSelected: boolean
  attachmentCount: number
}

const ChannelItem: React.FC<ChannelItemProps> = ({
                                                   lastUsername,
                                                   lastUserMessage,
                                                   lastMessageTime,
                                                   channelName,
                                                   unseenMessageCount,
                                                   channelProfileKey,
                                                   privateChannel,
                                                   channelSelected,
                                                     attachmentCount
                                                 }) => {
  const rawChannelProfileData = mediaService.getMediaURLForID(
      channelProfileKey || ""
  );
    const {t} = useTranslation()


    if (rawChannelProfileData.isLoading || rawChannelProfileData.isError) {
    return <div>LOADING....</div>;
  }

  let message = ''

    if(lastUserMessage == undefined && attachmentCount > 0) {
        message = t('sentAttachment', {count: attachmentCount})
    }

    if(lastUserMessage !== undefined) {
        message = removeHtmlTags(lastUserMessage)
    }

  return (
      <div className={`flex pl-2 pr-4 p-2 border-b-slate-300 pt-6 pb-4 hover:cursor-pointer hover:border-blue-500 hover:shadow-xl rounded-lg w-full ${channelSelected ? "bg-gray-300": ""}`}>
        <div className="relative">
          <img
              className="rounded-full h-14 w-14"
              src={
                rawChannelProfileData.mediaData != undefined &&
                rawChannelProfileData.mediaData.url != ""
                    ? rawChannelProfileData.mediaData.url
                    : MembersIcon
              }
              alt=""
          />
          {privateChannel && (
              <LockClosedIcon
                  stroke="#3d3d3d"
                  fill=" rgb(125 211 252)"
                  className="h-6 w-6 p-1 rounded-full absolute bg-gray-400 -bottom-2 right-0"
              />
          )}
        </div>
        <div className="ml-2 flex-1 flex flex-col justify-between">
          <div className="flex justify-between">
            <div className="text-base font-medium overflow-ellipsis overflow-hidden whitespace-nowrap max-w-[15ch] text-sm">
              {channelName}
            </div>
            <div className="text-xs text-gray-500">{formatDateForLatestPost(lastMessageTime)}</div>
          </div>
          <div className="flex flex-row mt-1">
            <div className="flex-1 flex items-center text-sm w-14">
              <div className="mr-1 whitespace-nowrap">{lastUsername}:</div>
              <div className="truncate">{message}</div>
            </div>
            {unseenMessageCount !== 0 && (
                <div className="rounded-full flex items-center justify-center w-6 h-6 bg-red-500 text-sm text-gray-50 font-mono text-center">
                  {unseenMessageCount}
                </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default ChannelItem;
