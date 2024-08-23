import HomeIcon from "../../assets/home_black.svg?react";
import ChatIcon from "../../assets/chat_black.svg?react";
import BellIcon from "../../assets/bell_black.svg?react";
import ExitIcon from "../../assets/logout.svg?react";
import Icon from "./NavIcon";
import {
  URL_CHANNEL,
  URL_CHATS,
  URL_ACTIVITY, URL_LOGOUT
} from "../../constants/routes/appNavigation";
import {useLocation} from "react-router-dom";
import {openAlertMsgPopup, openProfilePopup} from "../../store/slice/popupSlice";
import { Cog6ToothIcon } from "@heroicons/react/20/solid";
import { useDispatch } from "react-redux";
import profileService, {USER_STATUS_ONLINE} from "../../services/ProfileService.ts";
import mediaService from "../../services/MediaService.ts";
import ProfileIcon from "../../assets/user_profile.svg"
import DmService from "../../services/DmService.ts";
import {useEffect, useState} from "react";
import channelService from "../../services/ChannelService.ts";
import {useTranslation} from "react-i18next"
import i18n from "../../utils/i18n"

const Sidebar = () => {

  const {t} = useTranslation()
 
  const dispatch=useDispatch();
  const location = useLocation();
  const isTabActive = (tabUrl: string) => {
    return location.pathname.startsWith(tabUrl);
  };

  const userData = profileService.getSelfUserProfile()
  const profileData = mediaService.getMediaURLForID(userData.userData?.data.dgraph.user_profile_object_key || '')

  const userDms = DmService.getUserDmsInfoWithLatestPost()
  const [userNewDmState, setUserNewDmState] = useState(false)

  const usersChannelsLatestPost = channelService.getUserChannelInfoWithLatestPost()
  const [userNewChannelPostState, setUserNewChannelPostState] = useState(false)


  useEffect(() => {
    if(userData.userData) {
      i18n.changeLanguage(userData.userData.data.dgraph.user_app_lang)
    }

  }, [userData.userData]);

  useEffect(() => {

    setUserNewDmState(false)
    if(userDms.dmData?.data.user_dms) {
      for (const dm of userDms.dmData.data.user_dms) {
        if(dm.dm_unread) {
          setUserNewDmState(true)
          break
        }
      }
    }
  }, [userDms.dmData]);

  useEffect(() => {
    setUserNewChannelPostState(false)

    if(usersChannelsLatestPost.channelData?.channels_list) {
      for (const newPost of usersChannelsLatestPost.channelData.channels_list) {
        if(newPost.unread_post_count) {
          setUserNewChannelPostState(true)
          break
        }
      }
    }

  }, [usersChannelsLatestPost.channelData]);

  if(profileData.isLoading || profileData.isError){
    return (<div>
      LOADING....
    </div>)
  }

  const logout = async () => {
    dispatch(openAlertMsgPopup({msg: 'Are you sure you want to logout?', msgTitle:'Alert', btnText:'Logout'}))

  }


  return (
      <div
          className="justify-between items-center bg-sky-300 z-20 md:z-0 w-28 lg:w-20 h-[100vh] fixed top-0 right-0 md:relative"
          style={{boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px"}}
      >
        <div className="flex flex-col items-center gap-8">
          <div
              className="w-16 h-16 md:h-14 md:w-14 my-5 relative hover:cursor-pointer "
              onClick={() => {
                dispatch(openProfilePopup());
              }}
          >

            <img
                className="object-cover absolute md:h-14 md:w-14 w-16 hover:opacity-70 h-16 rounded-lg border border-sky-950"
                src={(profileData.isError || profileData.isLoading || profileData.mediaData == undefined) ? ProfileIcon : profileData.mediaData.url}
                alt="Profile"
            />
            <span
                className={`absolute h-4 w-4 rounded-full border border-sky-950 right-0 bottom-0 ${userData.userData?.data.dgraph.user_status == USER_STATUS_ONLINE ? 'bg-green-500' : 'bg-red-500'}`}></span>

            <div
                className="h-16 w-16 md:h-14 md:w-14 absolute flex justify-center items-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100">
              <Cog6ToothIcon fill="#fff" className="h-4 w-4"/>
            </div>
          </div>

          <div className="flex w-10 h-10 md:w-7 md:h-7 cursor-pointer flex-col gap-6">

            <Icon path={URL_CHANNEL} title={t('channelTitle')}>
              <div className='relative'>
                <HomeIcon
                    fill={isTabActive(URL_CHANNEL) ? "rgb(8 47 73)" : "#eee"}
                    stroke={isTabActive(URL_CHANNEL) ? "rgb(125 211 252)": "rgb(8 47 73)"}

                />
                { userNewChannelPostState && <div className='h-3 w-3 absolute bg-red-500 rounded-full bottom-0 right-0'></div>}
              </div>
            </Icon>


            <Icon path={URL_CHATS} title={t('chatTitle')}>
              <div className='relative'>
                <ChatIcon
                    fill={isTabActive(URL_CHATS) ? "rgb(8 47 73)" : "#eee"}
                    stroke={isTabActive(URL_CHATS) ? "rgb(125 211 252)": "rgb(8 47 73)"}
                />
                { userNewDmState && <div className='h-3 w-3 absolute bg-red-500 rounded-full bottom-0 right-0'></div>}

              </div>
            </Icon>

            <Icon path={URL_ACTIVITY} title={t('activityTitle')}>
              <BellIcon
                  fill={isTabActive(URL_ACTIVITY) ? "rgb(8 47 73)" : "#eee"}
                  stroke={isTabActive(URL_ACTIVITY) ? "rgb(125 211 252)": "rgb(8 47 73)"}
              />
            </Icon>


          </div>

        </div>

        <div className="flex flex-col items-center absolute bottom-0 right-[50%] left-[50%] gap-12 md:gap-10">
          <div className="w-10 h-10 md:w-7 md:h-7 cursor-pointer" onClick={logout}>
            <Icon path={URL_LOGOUT} title={t('logoutTitle')}>
              <ExitIcon fill={"#eee"} stroke={"rgb(8 47 73)"}/>
            </Icon>
          </div>

          <div className="w-14 h-14  rounded-lg overflow-hidden">
            <img
              className="object-cover w-12 hover:opacity-98 h-12"
              src="/pwa-maskable-192x192.png"
              alt="Profile"
            />
          </div>
        </div>

        {/*<div className='mb-2'>*/}

        {/*  <div className='w-14 h-14 mb-4'>*/}
        {/*    <Icon path={URL_ACTIVITY} title="Logout">*/}
        {/*      <ExitIcon*/}
        {/*          fill={isTabActive(URL_ACTIVITY) ? "rgb(125 211 252)" : "#fff"}*/}
        {/*      />*/}
        {/*    </Icon>*/}
        {/*  </div>*/}

        {/*  <div className="w-14 h-14  rounded-lg overflow-hidden">*/}
        {/*    <img*/}
        {/*      className="object-cover w-12 hover:opacity-98 h-12"*/}
        {/*      src="/pwa-maskable-192x192.png"*/}
        {/*      alt="Profile"*/}
        {/*    />*/}
        {/*  </div>*/}
        {/*</div>*/}
      </div>
  );
};
export default Sidebar;
