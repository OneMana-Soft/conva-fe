import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment} from "react";
import FormField from '../Form/FormField.tsx'
import ProfileIcon from '../../assets/user_profile.svg'
import {
    ChatBubbleBottomCenterTextIcon,

    XMarkIcon,
  } from '@heroicons/react/20/solid';
import ProfileService from "../../services/ProfileService.ts";
import mediaService from "../../services/MediaService.ts";
import {useNavigate} from "react-router-dom";
import {URL_CHATS} from "../../constants/routes/appNavigation.ts";
import {useTranslation} from "react-i18next";

interface OtherUserProfileModalProps {
  modalOpenState: boolean;
  setOpenState: (state: boolean) => void;
  userUUID: string;
}

const OtherUserProfileModal: React.FC<OtherUserProfileModalProps> = ({
  modalOpenState,
  setOpenState,
  userUUID,
}) => {

  const userProfile = ProfileService.getUserProfileForID(userUUID)
  const profileMedia = mediaService.getMediaURLForID(userProfile.user?.data.user_profile_object_key || '')
  const navigate = useNavigate()
  const {t} = useTranslation()


  if(userProfile.isLoading || userProfile.isError || userProfile.user == undefined) {
    return (<></>)
  }


  const formatDate = (epochTimestamp: string) => {
    const date = new Date(epochTimestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${day}-${month}-${year}`;
  };
    

  const openUserChat = () => {
    navigate(URL_CHATS + '/' + userUUID)
    closeModal()
  }



  function closeModal() {
    setOpenState(false);
  }

  return (
    <>
      <Transition appear show={modalOpenState} as={Fragment}>
        <Dialog as="div" className="relative z-20" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    <div className="flex flex-grow">
                    <div className="flex-1">{`${userProfile.user.data.user_full_name}`}</div>
                    <div className="hover:cursor-pointer" onClick={closeModal}><XMarkIcon height='1.5rem' width='1.5rem'/></div>
                    </div>
                   
                  </Dialog.Title>
                  <div className="mt-1.5">
                    <div className="text-sm text-gray-500">
                      <form
                        className="mx-auto max-w-lg"
                      >
                        <div className="flex flex-col items-center justify-center">

                            <img
                                className="h-48 w-48 rounded-lg mb-3"
                                src={
                                  profileMedia.mediaData?.url || ProfileIcon
                                }
                                alt="Chatter Logo"
                            />
                          <div
                              className="flex items-center pl-4 pr-4 justify-center bg-sky-500 p-1.5 text-white rounded-full hover:cursor-pointer hover:bg-blue-600" onClick={openUserChat}>
                            {/* <ChatBubbleBottomCenterIcon /> */}
                            <ChatBubbleBottomCenterTextIcon height='2rem' width='2rem' fill="#FFFF"/>
                            <div className="text-s ml-2 font-medium ">{t('messageLabel')}</div>

                          </div>
                        </div>

                        <div className="p-3.5">
                          <FormField
                              label={t('emailLabel')}
                              name="email"
                              value={userProfile.user?.data.user_email_id || ''}
                              onChange={() => {
                              }}
                              readOnly={true}
                              required={false}
                          />
                          <FormField
                              label={t('nameLabel')}
                              name="name"
                              value={userProfile.user?.data.user_full_name || ''}
                              onChange={() => {
                              }}
                              readOnly={true}
                              required={true}
                          />
                          <FormField
                            label={t('usernameLabel')}
                            name="username"
                            value={userProfile.user?.data.user_name || ''}
                            onChange={()=>{}}
                            readOnly={true}
                            required={true}
                          />
                          <FormField
                            label={t('titleLabel')}
                            name="title"
                            value={userProfile.user?.data.user_title|| ''}
                            onChange={()=>{}}
                            readOnly={true}
                            required={true}
                          />
                          <FormField
                            label={t('hobbiesLabel')}
                            name="hobbies"
                            value={userProfile.user?.data.user_hobbies || ''}
                            onChange={()=>{}}
                            readOnly={true}
                            required={true}
                          />
                          <FormField
                            label={t('birthdayLabel')}
                            name="birthday"
                            type="text" // Setting input type to date
                            value={formatDate(userProfile.user?.data.user_birthday || '')} // Format date for input value
                            onChange={()=>{}}
                            readOnly={true}
                            required={true}
                          />
                          
                        </div>
                      </form>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default OtherUserProfileModal;
