import React from "react";
import mediaService from "../../../services/MediaService.ts";
import { formatDateForLatestPost, removeHtmlTags } from "../../../utils/Helper.ts";
import {useTranslation} from "react-i18next";
import {UserIcon} from "@heroicons/react/20/solid";

interface DmItemProps {
    lastUsername: string;
    lastUserMessage: string;
    lastMessageTime: string;
    userName: string;
    unseenMessageCount: number;
    userProfileKey: string;
    userSelected: boolean
    attachmentCount: number
    isSelfDm: boolean
    isOnline: boolean
}

const DmItem: React.FC<DmItemProps> = ({
                                                   lastUsername,
                                                   lastUserMessage,
                                                   lastMessageTime,
                                                   userName,
                                                   unseenMessageCount,
                                                   userProfileKey,
                                                   userSelected,
                                                    isSelfDm,
                                                    isOnline,
                                                     attachmentCount
                                                 }) => {
  const rawDmProfileData = mediaService.getMediaURLForID(
      userProfileKey || ""
  );
    const {t} = useTranslation()


    if (rawDmProfileData.isLoading || rawDmProfileData.isError) {
    return <div>LOADING....</div>;
  }




  let message = ''

    if(lastUserMessage == '' && attachmentCount > 0) {

        message = t('sentAttachment', {count: attachmentCount})
    }

    if(lastUserMessage != '') {
        message = removeHtmlTags(lastUserMessage)
    }

  return (
      <div className={`flex pl-2 pr-4 p-2 border-b-slate-300 pt-6 pb-4 hover:cursor-pointer hover:border-blue-500 hover:shadow-xl rounded-lg w-full ${userSelected ? "bg-gray-300": ""}`}>
          <div className="relative">
              {rawDmProfileData.mediaData?.url
                  ? <img
                  className="rounded-lg h-14 w-14"
                  src={rawDmProfileData.mediaData.url}
                  alt=""
              />
                :
                  <div className="rounded-lg h-14 w-14">
                  <UserIcon
                      fill="#616060"
                  />
                  </div>
              }
              <span className={`absolute h-4 w-4 rounded-full right-0 bottom-0 border border-sky-950 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>

          </div>
          <div className="ml-2 flex-1 flex flex-col justify-between">
          <div className="flex justify-between">
            <div className="text-base font-medium overflow-ellipsis overflow-hidden whitespace-nowrap max-w-[15ch] text-sm">
              {isSelfDm ? `(You) ${userName}`: `${userName}`}
            </div>
              {lastMessageTime && <div className="text-xs text-gray-500">{formatDateForLatestPost(lastMessageTime)}</div>}
          </div>
          <div className="flex flex-row mt-1">
            <div className="flex-1 flex items-center text-sm w-14">
                {
                    message ?
                        <>
                            <div className="mr-1 whitespace-nowrap">{lastUsername}:</div>
                            <div className="truncate">{message}</div>
                        </>
                        :
                        (isSelfDm ? <div className="mr-1 whitespace-nowrap">Take notes by sending yourself message </div> :
                            <div className="mr-1 whitespace-nowrap">Start Conversation by saying Hi 👋 </div>)
                }

            </div>
              {unseenMessageCount !== 0 && (
                  <div
                      className="rounded-full flex items-center justify-center w-6 h-6 bg-red-500 text-sm text-gray-50 font-mono text-center">
                  {unseenMessageCount}
                </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default DmItem;
