import { Dialog, Transition } from "@headlessui/react";
import React, {Fragment, useEffect, useState} from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import ComboboxChannelMemberList from "./ComboboxMemberLIst";
import ChannelMemberList from "./ChannelMemberList";
import channelService from "../../services/ChannelService.ts";
import profileService from "../../services/ProfileService.ts";
import {useTranslation} from "react-i18next";

interface editChannelModalProps {
  modalOpenState: boolean;
  setOpenState: (state: boolean) => void;
  channelUUID: string;
}


const EditChannelMembersModal: React.FC<editChannelModalProps> = ({
                                                                    modalOpenState,
                                                                    setOpenState,
                                                                    channelUUID,
                                                                  }) => {
  const {t} = useTranslation()

  const [ userIsChannelModerator, setUserIsChannelModerator] = useState(false)
  const [ userIsChannelMember, setUserIsChannelMember] = useState(false)
  const [ isChannelPrivate, setIsChannelPrivate] = useState(false)
  const channelInfo = channelService.getChannelInfo(channelUUID)
  const userInfo = profileService.getSelfUserProfile()

  useEffect(() => {
    if(channelInfo.data?.channel_info.ch_members && userInfo.userData?.data) {
      channelInfo.data.channel_info.ch_members.forEach((member) => {
        if(member.user_uuid == userInfo.userData?.data.dgraph.user_uuid) {
          setUserIsChannelMember(true)
        }
      })
    }

    if(channelInfo.data?.channel_info.ch_moderators && userInfo.userData?.data) {
      channelInfo.data.channel_info.ch_moderators.forEach((member) => {
        if(member.user_uuid == userInfo.userData?.data.dgraph.user_uuid) {
          setUserIsChannelModerator(true)
        }
      })
    }

    if(channelInfo.data) {
      setIsChannelPrivate(channelInfo.data.channel_info.ch_private)

    }

  }, [channelInfo.data, userInfo.userData]);

  if(channelInfo.isError || channelInfo.isLoading || userInfo.isError || userInfo.isLoading) {
    return (<></>)
  }

  // Add a focusable element, such as a button, to the Dialog component
  const handleCancel = () => {
    setOpenState(false);
  };

  return (
      <>
        <Transition appear show={modalOpenState} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={handleCancel}>
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
                  <Dialog.Panel className="min-w-[25vw] transform overflow-visible rounded-2xl bg-white p-4 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900"
                    >
                      <div className="flex flex-grow">
                        <div className="flex-1">{t('channelMemberTitleLabel')}</div>
                        <div className="hover:cursor-pointer" onClick={handleCancel}>
                          <XMarkIcon height="1.5rem" width="1.5rem" />
                        </div>
                      </div>
                    </Dialog.Title>
                    <div className="mt-1.5" tabIndex={-1}> {/* Added tabIndex here */}
                      <div className="text-sm text-gray-500 p-3.5">
                        {(userIsChannelMember || isChannelPrivate) && (userIsChannelModerator || !isChannelPrivate)
                            && <ComboboxChannelMemberList channelId={channelUUID}/>}
                        <ChannelMemberList channelId={channelUUID} handleClose={handleCancel}/>
                      </div>
                      <button
                          className={`bg-blue-500 hover:bg-blue-700 mt-4  text-white font-bold py-2 px-4 rounded-full w-full`}
                          onClick={handleCancel}

                      >
                        {t('closeLabel')}
                      </button>
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

export default EditChannelMembersModal;