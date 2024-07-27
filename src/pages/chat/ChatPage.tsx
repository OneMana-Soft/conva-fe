import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {URL_CHATS} from "../../constants/routes/appNavigation.ts";
import {RootState} from "../../store/store.ts";
import {updateLastSeenDmId} from "../../store/slice/lastSelectedPersist.ts";
import DmService from "../../services/DmService.ts";
import DmItem from "../../components/SideBar/Chat/DmItem.tsx";
import profileService, {USER_STATUS_ONLINE, UserDgraphInfoInterface} from "../../services/ProfileService.ts";
import ChatComponent from "../../components/Chat/ChatComponent.tsx";
import DmComponent from "../../components/Dm/DmComponent.tsx";
import DmWelcome from "../../components/Dm/DmWelcome.tsx";
import {updateSideBarState} from "../../store/slice/sidebarSlice.ts";
import {useTranslation} from "react-i18next";




const ChatPage: React.FC = () => {
  const {dmId} = useParams()
  const {chatId} = useParams()
  const dispatch=useDispatch();
  const navigate=useNavigate();
  const lastSelectedChat=useSelector((state:RootState)=>state.lastSelectedPersist.lastSelectedDm)

  const extendedSideBarActiveState = useSelector((state:RootState)=>state.sidebar.sideBarActive)
  const {t} = useTranslation()

  const [dmSearchText, setDmSearchText] = useState('')
  const [dmNameSearchDebounceTimer, setDmNameSearchDebounceTimer] = useState< ReturnType<typeof setTimeout> | null>(null);

  const [searchDmList, setSearchDmList ] = useState<UserDgraphInfoInterface[] | null>(null)

  const userDms = DmService.getUserDmsInfoWithLatestPost()
  const userProfile = profileService.getSelfUserProfile()

  const handleDmListOnClick = async (dmId: string) => {
    dispatch(updateSideBarState({active: false}))
    dispatch(updateLastSeenDmId({dmId}));

    navigate(URL_CHATS+'/'+dmId)
  }


  useEffect(() => {
    if(dmId) {
      userDms.dmMutate()
    }

    if(dmId == undefined && lastSelectedChat){
      handleDmListOnClick(lastSelectedChat)
    }

  }, [dmId]);

  const handleDmSearchOnChange = (dmName: string) => {
    dmName = dmName.trim()
    setDmSearchText(dmName)

    if(dmNameSearchDebounceTimer) {
      clearTimeout(dmNameSearchDebounceTimer);
    }

    if(dmName !== '') {

      setDmNameSearchDebounceTimer(setTimeout(async () => {
        // Set new timer
        const rawSearchDmListRes = await DmService.SearchDmByUserName(dmName)
        console.log(rawSearchDmListRes.data)
        setSearchDmList(rawSearchDmListRes.data.data)
      }, 500));
    }

  }

  const userDmListProcessed: UserDgraphInfoInterface[] = [] as UserDgraphInfoInterface[]

  if(userDms.isError || userDms.isLoading || userDms.dmData == undefined || userProfile.isError || userProfile.isLoading || userProfile.userData == undefined) {
    return(<div>LOADING...</div>)
  }



  if(userDms.dmData.data.user_dms) {
    for (const dm of userDms.dmData.data.user_dms) {
      const tempUser: UserDgraphInfoInterface = {} as UserDgraphInfoInterface
      if(dm.dm_chats[0].chat_to.user_uuid == userProfile.userData.data.dgraph.user_uuid) {
        tempUser.user_uuid =  dm.dm_chats[0].chat_from.user_uuid
        tempUser.user_full_name =  dm.dm_chats[0].chat_from.user_full_name
        tempUser.user_profile_object_key =  dm.dm_chats[0].chat_from.user_profile_object_key
        tempUser.user_status = dm.dm_chats[0].chat_from.user_status
        tempUser.user_device_connected =  dm.dm_chats[0].chat_from.user_device_connected

      } else {
        tempUser.user_uuid =  dm.dm_chats[0].chat_to.user_uuid
        tempUser.user_full_name =  dm.dm_chats[0].chat_to.user_full_name
        tempUser.user_profile_object_key =  dm.dm_chats[0].chat_to.user_profile_object_key
        tempUser.user_status = dm.dm_chats[0].chat_to.user_status
        tempUser.user_device_connected =  dm.dm_chats[0].chat_to.user_device_connected
      }



      tempUser.user_dms = [dm]


      userDmListProcessed.push(tempUser)

    }

  }

  const renderDmList = dmSearchText && searchDmList ? searchDmList: userDmListProcessed


  return (
      <div className="flex">
        <div className="grow">
          <div className={`md:flex flex-col h-[94vh] ${!extendedSideBarActiveState ? "flex" : "hidden"}`}>
            {dmId ? (chatId ? <ChatComponent dmId={dmId} chatId={chatId}/> : <DmComponent dmId={dmId}/>) : <DmWelcome/>}
          </div>
        </div>
        <div className={`grow w-full md:max-w-[20vw] h-[94vh] md:flex flex-col md:border-s-4  py-4 px-3 md:border-solid md:border-sky-300 ${extendedSideBarActiveState ? "flex" : "hidden"}`}>
          <div className="mb-4 pb-2 flex flex-col justify-between">
            <div className="flex flex-row">
              <h4 className="flex flex-1 font-semibold text-lg text-[#1F2937] justify-start items-center align-middle">{t('chatsTitle')}</h4>
            </div>
            <div className="mb-1 mt-2 w-full">
              <input
                  type="text"
                  placeholder={t('findColleaguesPlaceHolder')}
                  value={dmSearchText}
                  onChange={(e) => handleDmSearchOnChange(e.target.value)}
                  className="w-full px-2 py-1 border-2 border-gray-300 rounded-full"
              />
            </div>
          </div>
          <div className="overflow-y-auto sidebax-extended-channels h-full">
            {renderDmList && renderDmList.map((dmData, index) => {

              return (<div key={index}>
                {index !== 0 && <hr className="h-px bg-gray-200 border-0 dark:bg-gray-700"/>}
                <div onClick={() => handleDmListOnClick(dmData.user_uuid)}>
                  <DmItem
                      lastMessageTime={dmData.user_dms && dmData.user_dms[0] && dmData.user_dms[0].dm_chats && dmData.user_dms[0].dm_chats[0].chat_created_at || ''}
                      lastUserMessage={dmData.user_dms && dmData.user_dms[0] && dmData.user_dms[0].dm_chats && dmData.user_dms[0].dm_chats[0].chat_body_text ||''}
                      lastUsername={dmData.user_dms && dmData.user_dms[0] && dmData.user_dms[0].dm_chats && dmData.user_dms[0].dm_chats[0].chat_from.user_full_name||''}
                      userName={dmData.user_full_name}
                      unseenMessageCount={dmData.user_dms && dmData.user_dms[0] && dmData.user_dms[0].dm_unread || 0}
                      userProfileKey={dmData.user_profile_object_key}
                      userSelected={dmId == dmData.user_uuid}
                      attachmentCount={dmData.user_dms && dmData.user_dms[0] && dmData.user_dms[0].dm_chats && dmData.user_dms[0].dm_chats[0].chat_attachments?.length || 0}
                      key={index}
                      isSelfDm={dmData.user_uuid === userProfile.userData?.data.dgraph.user_uuid}
                      isOnline={(dmData.user_device_connected && dmData.user_status) ? dmData.user_status == USER_STATUS_ONLINE && dmData.user_device_connected > 0:false}
                  />
                </div>
              </div>)

            })}
            { dmSearchText && searchDmList && searchDmList.length == 0 && (<div className='text-red-600'>Colleague not available</div>)}
          </div>

        </div>


      </div>
  );
};

export default ChatPage;




