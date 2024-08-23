import Sidebar from '../components/SideBar/Sidebarv2';
import {
    closeProfilePopup,
    closeCreateChannelPopup,
    closeOtherUserProfilePopup,
    closeEditChannelPopup, closeEditChannelMemberPopup, closeAlertMsgPopup
} from '../store/slice/popupSlice';
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from "../store/store";
import ProfileModal from '../components/Modals/SelfProfileModal';
import React, {useEffect, useRef, useState} from 'react';
import {Bars3Icon, MagnifyingGlassIcon} from "@heroicons/react/24/outline";
import { useNavigate } from 'react-router-dom';
import {
  URL_SEARCH,
} from '../constants/routes/appNavigation';
import CreateChannelModal from "../components/Modals/CreateChannelModal.tsx";
import OtherUserProfileModal from "../components/Modals/OtherUserProfileModal.tsx";
import EditChannelModal from "../components/Modals/EditChannelModal.tsx";
import EditChannelMembersModal from "../components/Modals/EditChannelMembersModal.tsx";
import AlertMessageModal from "../components/Modals/AlertMessageModal.tsx";
import {updateSearchText} from "../store/slice/globalSearchSlice.ts";
import {useTranslation} from "react-i18next";

type Props = {
  children: JSX.Element;
};

const AuthLayout = ({ children }: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate=useNavigate();
  const profileModal=useSelector((state:RootState)=>state.popup.profilePopup)
  const OthersProfileModal=useSelector((state:RootState)=>state.popup.otherUserProfilePopup)
  const createChannelModal=useSelector((state:RootState)=>state.popup.createChannelPopup)
  const editChannelModal=useSelector((state:RootState)=>state.popup.editChannelPopup)
    const editChannelMemberModal=useSelector((state:RootState)=>state.popup.editChannelMemberPopup)
    const alertMessageModal = useSelector((state:RootState)=>state.popup.alertMessagePopup)
  const dispatch=useDispatch();
    const refSideBar = useRef<HTMLDivElement>(null);
    const {t} = useTranslation()



    const [sideBarActiveState, setSideBarActiveState] = useState(false)



  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleMenuBarClick = () => {
      setSideBarActiveState(true)
  }

  const handleSearch = () => {
    // Perform search action here, for example, navigate to a search results page
      dispatch(updateSearchText({searchText: searchQuery}))
    navigate(URL_SEARCH)
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };


    useEffect(()=>{
        const handleClickOutside = () => {
            if (refSideBar.current) {
                setSideBarActiveState(false);
            }
        }

        document.addEventListener('click', handleClickOutside, true);
        return () => {
            document.removeEventListener('click', handleClickOutside, true);
        };
    },[refSideBar])


    return (
        <div className="flex h-screen overflow-hidden"> {/* Adjusted to h-screen to take full viewport height */}
            <div className="grow flex-grow"> {/* Adjusted to flex-grow to fill available space */}
                <div className="h-[7vh] md:h-[6vh] pr-4 pl-4 pb-2 pt-4 w-full relative flex">
                    <input
                        type="text"
                        placeholder={t('globalSearchPlaceHolder')}
                        className="w-full px-2 py-1 border-2 border-gray-300 rounded-full min-h-7 pl-10"
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                        onKeyDown={handleKeyPress}
                    />
                    <MagnifyingGlassIcon
                        className="absolute  left-6 h-[1.5rem] w-[1.5rem] md:h-5 md:w-5 cursor-pointer translate-y-[30%]"
                        onClick={handleSearch}
                    />
                    <div className='md:hidden ml-2 mr-2' onClick={handleMenuBarClick}>
                        <Bars3Icon className='w-8'/>
                    </div>

                </div>

                <div className='h-[94vh]'>{children}</div>
            </div>
            {/*<div className={`${sideBarActiveState ? "block" : "hidden"} md:block`} ref={refSideBar}>*/}
            {/*    <Sidebar/>*/}
            {/*</div>*/}

            <div  className={`fixed top-0 z-20 right-0 h-full w-1/3 md:max-w-fit md:relative md:block transform transition-transform duration-300 ${
                sideBarActiveState ? "translate-x-0" : "translate-x-full"
            } md:translate-x-0`} ref={refSideBar}>
                <Sidebar/>
            </div>

            <ProfileModal
                modalOpenState={profileModal.isOpen}
                setOpenState={() => dispatch(closeProfilePopup())}
            />
            <OtherUserProfileModal
                modalOpenState={OthersProfileModal.isOpen}
                setOpenState={() => dispatch(closeOtherUserProfilePopup())}
                userUUID={OthersProfileModal.data.userId}
            />

            <CreateChannelModal
                setOpenState={() => dispatch(closeCreateChannelPopup())}
                modalOpenState={createChannelModal.isOpen}
            />
            <EditChannelModal
                setOpenState={() => dispatch(closeEditChannelPopup())}
                modalOpenState={editChannelModal.isOpen}
                channelUUID={editChannelModal.data.channelId}
            />

            <EditChannelMembersModal
                setOpenState={() => dispatch(closeEditChannelMemberPopup())}
                modalOpenState={editChannelMemberModal.isOpen}
                channelUUID={editChannelMemberModal.data.channelId}
            />

            <AlertMessageModal
                setOpenState={() => dispatch(closeAlertMsgPopup())}
                modalOpenState={alertMessageModal.isOpen}
                message={alertMessageModal.data.msg}
                btnText={alertMessageModal.data.btnText}
                msgTitle={alertMessageModal.data.msgTitle}
            />


        </div>
    );
};
export default AuthLayout;
