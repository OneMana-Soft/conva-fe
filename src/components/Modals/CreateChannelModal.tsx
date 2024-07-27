import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment, useState } from "react";
import FormField from '../Form/FormField.tsx'
import FormImageUpload from "../Form/FormImageUpload.tsx";
import {
  XMarkIcon,
} from '@heroicons/react/20/solid';
import SwitchToggle from "./SwitchToggle";
import MembersIcon from "../../assets/members.svg"

import ChannelService, {CheckChannelRes, CreateChannelReq} from "../../services/ChannelService.ts";
import MediaService, {UploadFileInterfaceRes} from "../../services/MediaService.ts";
import channelService from "../../services/ChannelService.ts";
import ConfigService from "../../services/ConfigService.ts";
import {useTranslation} from "react-i18next";



interface editChannelModalProps {
  modalOpenState: boolean;
  setOpenState: (state: boolean) => void;
}

const CreateChannelModal: React.FC<editChannelModalProps> = ({
  modalOpenState,
  setOpenState,
}) => {


    const [formData, setFormData] = useState<CreateChannelReq>({
      channel_name: '',
      channel_handle: '',
      channel_private: false,
      channel_profile_key: ''
      });
      const [selectedImage, setSelectedImage] = useState<string>(MembersIcon);
  const {t} = useTranslation()
  const [channelHandleExist, setChannelHandleExist] = useState(false)
  const userChannelList = channelService.getUserChannelInfoWithLatestPost()
  const mqttConfig = ConfigService.chatWithAllComments()


  const [selectedImageFile, selectedImageSetFile] = useState<File | null>(null);
      const [channelHandleAvailabilityDebounceTimer, setChannelHandleAvailabilityDebounceTimer] = useState< ReturnType<typeof setTimeout> | null>(null);
  const [createChannelDebounceTimer, setCreateChannelDebounceTimer] = useState< ReturnType<typeof setTimeout> | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const imageDataURL = reader.result as string;
            setSelectedImage(imageDataURL);
          };
          reader.readAsDataURL(file);
          selectedImageSetFile(file)
        }
  };

      const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setChannelHandleExist(false)
        const { name, value } = e.target;
        setFormData((prevState) => ({
          ...prevState,
          [name]: value,
        }));
        if(name == 'channel_handle') {

          if(channelHandleAvailabilityDebounceTimer) {
            clearTimeout(channelHandleAvailabilityDebounceTimer);
          }
          const specialCharPattern = /[^a-zA-Z0-9- ]/;
          if (specialCharPattern.test(value) || value.length >= 25) {
            setChannelHandleExist(true)
            return
          }
          setChannelHandleAvailabilityDebounceTimer(setTimeout(async () => { // Set new timer
            const resCheckChannelNameAvailability = await ChannelService.CheckIfChannelHandleIsAvailable(value)
            const isNameAvailable: CheckChannelRes = resCheckChannelNameAvailability.data
            setChannelHandleExist(isNameAvailable.handle_exist)
          }, 500));


        }
      };

      const handleSwitchToggle = (fieldName:string, fieldValue:boolean) => {
        setFormData((prevState) => ({
          ...prevState,
          [fieldName]: fieldValue,
        }));
      };

      const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

        e.preventDefault();
        if(createChannelDebounceTimer) {
          clearTimeout(createChannelDebounceTimer);
        }
        setCreateChannelDebounceTimer(setTimeout(async () => { // Set new timer
          if(selectedImageFile) {
            const imageUploadRes = await MediaService.uploadMedia(selectedImageFile)
            const imageUploadResData: UploadFileInterfaceRes = imageUploadRes.data
            formData.channel_profile_key = imageUploadResData.object_name
          }
          await ChannelService.CreateChannel(formData)
          await userChannelList.channelMutate()
          await mqttConfig.mutate()


        }, 500));
        closeModal();

        // TODO: do something
      };

  function closeModal() {
    setOpenState(false);

    setFormData({
      channel_name: '',
      channel_handle: '',
      channel_private: false,
      channel_profile_key: ''
    });
  }

  const {channel_name, channel_handle} = formData
  const isFormValid = (channel_name !== '' && channel_handle !== '' && !channelHandleExist)



  return (
    <>
      <Transition appear show={modalOpenState} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
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
                    <div className="flex-1">Create Channel</div>
                    <div className="hover:cursor-pointer" onClick={closeModal}><XMarkIcon height='1.5rem' width='1.5rem'/></div>
                    </div>
                  </Dialog.Title>
                  <div className="mt-1.5">
                    <div className="text-sm text-gray-500">
                      <form
                        onSubmit={handleSubmit}
                        className="mx-auto max-w-lg"
                      >
                        <FormImageUpload
                          selectedImage={selectedImage}
                          handleImageUpload={handleImageUpload}
                        />
                        <div className="p-3.5">
                          <FormField
                            label={t('channelNameLabel')}
                            name="channel_name"
                            value={formData.channel_name}
                            onChange={handleChange}
                            readOnly={false}
                            required={true}
                          />

                          <FormField
                              label={t('channelHandleLabel')}
                              name="channel_handle"
                              value={formData.channel_handle}
                              onChange={handleChange}
                              readOnly={false}
                              required={true}
                          />
                          {channelHandleExist && (<div className='text-red-600'>Channel handle not available or channel handle contains special characters ot its length is greater than 25</div>)}

                          <SwitchToggle
                            label={t('channelPrivateLabel')}
                            name="channel_private"
                            value={formData.channel_private}
                            onChange={handleSwitchToggle}
                          />

                          <button
                              className={`${!isFormValid? 'bg-gray-300': 'bg-blue-500 hover:bg-blue-700'} mt-4  text-white font-bold py-2 px-4 rounded-full w-full`}
                              type="submit"
                              disabled={!isFormValid}
                          >
                            {t('createLabel')}
                          </button>
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

export default CreateChannelModal;
