import { PlusIcon } from "@heroicons/react/20/solid";
import ChannelItem from "../../components/SideBar/Channel/ChannelItem";
import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import ChannelComponent from "../../components/Channel/ChannelComponent.tsx";
import ChannelWelcome from "../../components/Channel/ChannelWelcome.tsx";
import {openCreateChannelPopup} from "../../store/slice/popupSlice.ts";
import {useDispatch, useSelector} from "react-redux";
import channelService, {GetChannelsInterface} from "../../services/ChannelService.ts";
import {URL_CHANNEL} from "../../constants/routes/appNavigation.ts";
import {RootState} from "../../store/store.ts";
import {updateLastSeenChannelId} from "../../store/slice/lastSelectedPersist.ts";
import PostComponent from "../../components/Post/PostComponent.tsx";
import {updateSideBarState} from "../../store/slice/sidebarSlice.ts";
import {useTranslation} from "react-i18next";



const ChannelPage: React.FC = () => {
  const {channelId} = useParams()
    const {postId} = useParams()
  const dispatch=useDispatch();
  const navigate=useNavigate();
    const extendedSideBarActiveState = useSelector((state:RootState)=>state.sidebar.sideBarActive)
    const lastSelectedChannel = useSelector((state:RootState)=>state.lastSelectedPersist.lastSelectedChannel)


    const [channelSearchText, setChannelSearchText] = useState('')
    const [channelNameSearchDebounceTimer, setChannelNameSearchDebounceTimer] = useState< ReturnType<typeof setTimeout> | null>(null);
    const {t} = useTranslation()
    const usersChannels = channelService.getUserChannelInfoWithLatestPost()

    const [searchChannelList, setSearchChannelList ] = useState<GetChannelsInterface | null>(null)


    const handleChannelListOnClick = async (channelId: string) => {
        dispatch(updateLastSeenChannelId({channelId}));
        dispatch(updateSideBarState({active: false}))

        navigate(URL_CHANNEL+'/'+channelId)
    }


    useEffect(() => {
        if(channelId) {
            usersChannels.channelMutate()
        }

        if(channelId == undefined && usersChannels.channelData?.channels_list){
            for(let ind=0; ind<usersChannels.channelData.channels_list.length; ind++){
                if(usersChannels.channelData.channels_list[ind].ch_id == lastSelectedChannel) {
                    handleChannelListOnClick(lastSelectedChannel)

                }
            }
        }

    }, [channelId]);

  const handleChannelSearchOnChange = (channelName: string) => {
      channelName = channelName.trim()
      setChannelSearchText(channelName)

      if(channelNameSearchDebounceTimer) {
          clearTimeout(channelNameSearchDebounceTimer);
      }

      if(channelName !== '') {

          setChannelNameSearchDebounceTimer(setTimeout(async () => {
              // Set new timer
              const rawSearchChannelListRes = await channelService.SearchChannelName(channelName)
              setSearchChannelList(rawSearchChannelListRes.data)
          }, 500));
      }

  }

  if(usersChannels.isError || usersChannels.isLoading || usersChannels.channelData == undefined) {
    return(<div>LOADING...</div>)
  }


  const renderChannelList = channelSearchText && searchChannelList ? searchChannelList: usersChannels.channelData

  return (
    <div className="flex">
      <div className="grow">
        <div className={`md:flex flex-col h-[94vh] ${!extendedSideBarActiveState ? "flex" : "hidden"}`}>
          {channelId ? (postId ? <PostComponent channelId = {channelId} postId={postId}/> : <ChannelComponent channelId = {channelId}/>) : <ChannelWelcome/>}
        </div>
      </div>
      <div className={`grow w-full md:max-w-[20vw] h-[94vh] md:flex flex-col md:border-s-4  py-4 px-3 md:border-solid md:border-sky-300 ${extendedSideBarActiveState ? "flex" : "hidden"}`}>
          <div className="mb-4 pb-2 flex flex-col justify-between">
            <div className="flex flex-row">
              <h4 className="flex flex-1 font-semibold text-lg text-[#1F2937] justify-start items-center align-middle">{t('channelsTitle')}</h4>
              <div className="rounded-lg text-sm p-2 flex justify-center items-center hover:bg-gray-400 hover:cursor-pointer" onClick={() => {
                dispatch(openCreateChannelPopup());
              }}>
                <PlusIcon className="h-6 w-6" />
              </div>
            </div>
            <div className="mb-1 mt-2 w-full">
              <input
                type="text"
                placeholder={t('findChannelsPlaceHolder')}
                value={channelSearchText}
                onChange={(e) => handleChannelSearchOnChange(e.target.value)}
                className="w-full px-2 py-1 border-2 border-gray-300 rounded-full"
              />
            </div>
          </div>
          <div className="overflow-y-auto sidebax-extended-channels h-full">
          {renderChannelList.channels_list && renderChannelList.channels_list.map((channelData, index) => (
              <div key={index}>
                {index !== 0 && <hr className="h-px bg-gray-200 border-0 dark:bg-gray-700"/>}
                <div onClick={() => handleChannelListOnClick(channelData.ch_id)}>
                  <ChannelItem
                      lastMessageTime={channelData.ch_posts ? channelData.ch_posts[0]?.post_created_at : channelData.ch_created_at}
                      lastUserMessage={channelData.ch_posts ? channelData.ch_posts[0]?.post_text : 'created channel'}
                      lastUsername={channelData.ch_posts ? channelData.ch_posts[0]?.post_by.user_full_name : channelData.ch_created_by.user_full_name}
                      channelName={channelData.ch_name}
                      unseenMessageCount={channelData?.unread_post_count||0 }
                      privateChannel={channelData.ch_private}
                      channelProfileKey={channelData.ch_icon}
                      channelSelected={channelId == channelData.ch_id}
                      attachmentCount={channelData.ch_posts && channelData.ch_posts[0]?.post_attachments ? channelData.ch_posts[0].post_attachments.length : 0}
                      key={index}
                  />
                </div>
              </div>

          ))}
              {renderChannelList.channels_list && renderChannelList.channels_list.length == 0 && (<div className='text-red-600'>Channel not available</div>)}
          </div>

      </div>


    </div>
  );
};

export default ChannelPage;




