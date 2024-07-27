import { Tab } from "@headlessui/react";
import {getOtherUserId} from "../../utils/Helper.ts";
import {useSelector} from "react-redux";
import {RootState} from "../../store/store.ts";
import ChatSearchList from "../../components/GlobalSearch/GlobalChatSearch.tsx";
import PostSearchList from "../../components/GlobalSearch/GlobalPostSearch.tsx";
import AttachmentSearchList from "../../components/GlobalSearch/GlobalAttachmentSearch.tsx";
import profileService from "../../services/ProfileService.ts";
import {URL_CHANNEL, URL_CHATS} from "../../constants/routes/appNavigation.ts";
import {useNavigate} from "react-router-dom";
import GlobalSearchWelcome from "../../components/GlobalSearch/GlobalSearch.tsx";


enum TABS {
  CHANNELS = "Channel",
  DMS = "DMs",
  FILES = "Files"
}

const GlobalSearch = () => {
    const navigate=useNavigate();

    const searchQuery = useSelector((state:RootState)=>state.globalSearch.searchText)

    if(searchQuery == '') {
        return(<GlobalSearchWelcome/>)
    }

    const userProfile = profileService.getSelfUserProfile()

    if(userProfile.isLoading || userProfile.isError) {
        return (<></>)
    }
    const updateChatInfo = (fromId: string, toId: string, chatId:string) => {
        const grpId = fromId + ' ' + toId
        const dmId = getOtherUserId(grpId, userProfile.userData?.data.dgraph.user_uuid || '')
        navigate(`${URL_CHATS}/${dmId}/${chatId}`)
    }

    const updatePostInfo = (postId:string, channelId:string) => {
        navigate(`${URL_CHANNEL}/${channelId}/${postId}`)
    }

  return (
    <div className="flex ml-4 mr-4 pt-2">
      <div className="grow">
        <div className="flex flex-col h-full">
        <Tab.Group>
            <Tab.List className="flex space-x-1 text-m cursor-pointer rounded-full p-2 w-[30vw] justify-between">
              {Object.values(TABS).map((tab, index) => (
                <Tab
                  key={index}
                  className={({ selected }) =>
                    `bg-gray-300 capitalize pl-2 pr-2 hover:cursor-pointer hover:bg-gray-400 rounded-full ${
                      selected ? "bg-gray-400" : "text-gray-600"
                    }`
                  }
                >
                  {tab}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className="mt-2">
                <Tab.Panel className="fle flex-col">
                    <PostSearchList
                        updatePostInfo = {updatePostInfo}
                        searchQuery = {searchQuery}
                    />
                </Tab.Panel>
                <Tab.Panel className="fle flex-col">
                  <ChatSearchList
                    updateChatInfo = {updateChatInfo}
                    searchQuery = {searchQuery}
                  />
                </Tab.Panel>
                <Tab.Panel className="fle flex-col">
                    <AttachmentSearchList
                        updateChatInfo = {updateChatInfo}
                        updatePostInfo = {updatePostInfo}
                        searchQuery = {searchQuery}
                    />
                </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    
    </div>
  );
};

export default GlobalSearch;
