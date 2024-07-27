import { Tab } from "@headlessui/react";
import React, {ReactNode, useState} from "react";
import MentionList from "../../components/Activity/MentionActivity.tsx";
import CommentList from "../../components/Activity/CommentActivity.tsx";
import ReactionList from "../../components/Activity/ReactionActivity.tsx";
import ActivityWelcome from "../../components/Activity/ActivityWelcome.tsx";
import PostComponent from "../../components/Post/PostComponent.tsx";
import ChatComponent from "../../components/Chat/ChatComponent.tsx";
import profileService from "../../services/ProfileService.ts";
import {getOtherUserId} from "../../utils/Helper.ts";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../store/store.ts";
import {updateSideBarState} from "../../store/slice/sidebarSlice.ts";
import {useTranslation} from "react-i18next";


enum ACTIVITY_MSG_TYPES {
  CHAT,
  POST,
  NULL
}

interface postActivityInfo {
  postId: string
  channelId: string
}

interface chatActivityInfo {
  dmId: string
  chatId: string
}


const Activity: React.FC = () => {

  const [activityChatInfo, setActivityChatInfo] = useState<chatActivityInfo>({dmId:'', chatId:''})
  const [activityPostInfo, setActivityPostInfo] = useState<postActivityInfo>({postId: '', channelId:''})
  const [activityMsgType, setActivityMsgType] = useState<ACTIVITY_MSG_TYPES>(ACTIVITY_MSG_TYPES.NULL)
  const extendedSideBarActiveState = useSelector((state:RootState)=>state.sidebar.sideBarActive)
  const dispatch=useDispatch();
  const {t} = useTranslation()
  const TABS = [t('mentionsTab'), t('commentsTab'), t('reactionsTab')]


  const userProfile = profileService.getSelfUserProfile()

  if(userProfile.userData && userProfile.isLoading && userProfile.isError) {
    return (<></>)
  }

  let mainScreen: ReactNode

  switch(activityMsgType) {

    case ACTIVITY_MSG_TYPES.CHAT:
      mainScreen = <ChatComponent dmId={activityChatInfo.dmId} chatId={activityChatInfo.chatId}/>
      break

    case ACTIVITY_MSG_TYPES.POST:
      mainScreen = <PostComponent channelId = {activityPostInfo.channelId} postId={activityPostInfo.postId}/>
      break

    default:
      mainScreen = <ActivityWelcome/>
  }

  const updateChatInfo = (fromId: string, toId: string, chatId:string) => {

    const grpId = fromId + ' ' + toId
    const dmId = getOtherUserId(grpId, userProfile.userData?.data.dgraph.user_uuid || '')
    setActivityMsgType(ACTIVITY_MSG_TYPES.CHAT)
    setActivityChatInfo({dmId, chatId})
    dispatch(updateSideBarState({active: false}))
  }

  const updatePostInfo = (postId:string, channelId:string) => {

    setActivityMsgType(ACTIVITY_MSG_TYPES.POST)
    setActivityPostInfo({postId, channelId})
    dispatch(updateSideBarState({active: false}))
  }

  return (
    <div className="flex h-[100%]">
      <div className="grow">
        <div className={`md:flex flex-col h-[94vh] ${!extendedSideBarActiveState ? "flex" : "hidden"}`}>
          {mainScreen}
        </div>
      </div>

      <div className={`grow w-full md:max-w-[20vw] h-[94vh] md:flex flex-col md:border-s-4  py-4 px-3 md:border-solid md:border-sky-300 ${extendedSideBarActiveState ? "flex" : "hidden"}`}>
        <div className="flex flex-col ">
          <div className="h-[5vh] pb-2 flex justify-between">
            <h4 className="font-semibold text-lg text-[#1F2937]">{t('activityTitle')}</h4>
          </div>
          <Tab.Group>
            <Tab.List className="flex max-h-[7vh] space-x-1 text-m rounded-l justify-left pb-2 pt-2">
              {TABS.map((tab, index) => (
                <Tab
                  key={index}
                  className={({ selected }) =>
                    `bg-gray-300 pl-2 pr-2 capitalize hover:cursor-pointer hover:bg-gray-400 rounded-full ${
                      selected ? "bg-gray-400" : "text-gray-600"
                    }`
                  }
                >
                  {tab}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className="mt-2">
                <Tab.Panel className="flex flex-col">
                  <MentionList updatePostInfo={updatePostInfo} updateChatInfo={updateChatInfo}/>
                </Tab.Panel>
              <Tab.Panel className="flex flex-col">
                <CommentList updatePostInfo={updatePostInfo} updateChatInfo={updateChatInfo}/>
              </Tab.Panel>
              <Tab.Panel className="flex flex-col">
                <ReactionList updatePostInfo={updatePostInfo} updateChatInfo={updateChatInfo}/>
              </Tab.Panel>

            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </div>
  );
};

export default Activity;
