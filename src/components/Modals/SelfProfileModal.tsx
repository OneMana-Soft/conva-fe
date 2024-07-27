import { Dialog, Transition } from "@headlessui/react";
import React, {Fragment, useEffect, useState} from "react";
import FormField from '../Form/FormField.tsx'
import FormImageUpload from "../Form/FormImageUpload.tsx";
import {
  XMarkIcon,
} from '@heroicons/react/20/solid';
import profileService, {
  PROFILE_STATUS_SUCCESS, USER_STATUS_OFFLINE, USER_STATUS_ONLINE,
  UserNameAvailabilityCheckRes,
  UserProfileUpdateRes
} from "../../services/ProfileService.ts";
import mediaService, {UploadFileInterfaceRes} from "../../services/MediaService.ts";
import ProfileIcon from "../../assets/user_profile.svg"
import MediaService from "../../services/MediaService.ts";
import ProfileService from "../../services/ProfileService.ts";
import SwitchToggle from "./SwitchToggle.tsx";
import dmService from "../../services/DmService.ts";
import {useTranslation} from "react-i18next";
import ComboboxAppLangList from "./ComboboxAppLangList.tsx";


interface SelfProfileModalProps {
  modalOpenState: boolean;
  setOpenState: (state: boolean) => void;
}

interface EditProfileProps {
  user_full_name: string;
  user_name: string;
  user_title: string;
  user_hobbies: string;
  user_birthday: string;
  user_profile_object_key: string;
  user_app_lang: string
  }

const SelfProfileModal: React.FC<SelfProfileModalProps> = ({
  modalOpenState,
  setOpenState,
}) => {

  const {t} = useTranslation()

  const [selectedImage, setSelectedImage] = useState<string>(ProfileIcon);
  const [selectedImageFile, selectedImageSetFile] = useState<File | null>(null);
  const [userNameAvailabilityDebounceTimer, setUserNameAvailabilityDebounceTimer] = useState< ReturnType<typeof setTimeout> | null>(null);
  const [userNameExist, setUserNameExist] = useState(false)
  const [formData, setFormData] = useState<EditProfileProps>({
    user_full_name: "",
    user_name: "",
    user_title: "",
    user_hobbies: "",
    user_profile_object_key: "",
    user_birthday: '',
    user_app_lang: '',
  });

  const userProfile = profileService.getSelfUserProfile()
      const userImage = mediaService.getMediaURLForID(userProfile.userData?.data.dgraph.user_profile_object_key || '')


      useEffect(() => {
        if (userProfile.userData) {
          setFormData({
            user_full_name: userProfile.userData?.data.dgraph.user_full_name ,
            user_name: userProfile.userData?.data.dgraph.user_name ,
            user_title: userProfile.userData?.data.dgraph.user_title,
            user_hobbies: userProfile.userData?.data.dgraph.user_hobbies ,
            user_profile_object_key: userProfile.userData?.data.dgraph.user_profile_object_key || '',
            user_birthday: userProfile.userData?.data.dgraph.user_birthday,
            user_app_lang: userProfile.userData?.data.dgraph.user_app_lang || ''
          });
        }
      }, [userProfile.userData]);

  const latestDmList = dmService.getUserDmsInfoWithLatestPost()

  useEffect(() => {
    if (userImage.mediaData) {
      setSelectedImage(userImage.mediaData.url || ProfileIcon)
    }
  }, [userImage.mediaData]);

      if(userImage.isError || userImage.isLoading || userProfile.isError || userProfile.isLoading || userProfile.userData == undefined) {
        return(<></>)
      }

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
    const { name, value } = e.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    if(name == 'user_name') {

      if(userNameAvailabilityDebounceTimer) {
        clearTimeout(userNameAvailabilityDebounceTimer);
      }

      const specialCharPattern = /[^a-zA-Z0-9- ]/;
      if (specialCharPattern.test(value) || value.length >= 25) {
        setUserNameExist(true)
        return
      }
      setUserNameAvailabilityDebounceTimer(setTimeout(async () => { // Set new timer
        const resCheckUnameAvailability = await profileService.checkIfUserNameIsAvailable(value)
        const isNameAvailable: UserNameAvailabilityCheckRes = resCheckUnameAvailability.data
        setUserNameExist(isNameAvailable.unameExist)
      }, 500));

    }
  };

  const formatDate = (epochTimestamp: string) => {
    const date = new Date(epochTimestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleBirthdayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: new Date(value).toISOString(), // Convert date string to epoch
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(selectedImageFile) {
      const imageUploadRes = await MediaService.uploadMedia(selectedImageFile)
      const imageUploadResData: UploadFileInterfaceRes = imageUploadRes.data
      formData.user_profile_object_key =  imageUploadResData.object_name
    }
    const submitResRaw = await ProfileService.updateProfile(formData)
    const submitRes : UserProfileUpdateRes = submitResRaw.data
    if(submitRes.status == PROFILE_STATUS_SUCCESS) {
      if (userProfile.userData) {

        userProfile.mutate({...userProfile.userData,

        })
      }
      closeModal()
    }



    // TODO: do something
  };

  const handleSwitchToggle = async (_:string, fieldValue:boolean) => {
    let status = USER_STATUS_ONLINE
    if(!fieldValue) {
      status = USER_STATUS_OFFLINE
    }
    await profileService.updateUserStatus(status)
    await userProfile.mutate()
    await latestDmList.dmMutate()
  };

  // conditions for disabling form submit button

  const {user_full_name, user_name, user_birthday } = formData;
  const isFormValid = (user_full_name !== '' && user_name !== '' && user_birthday !== '' && !userNameExist)

  function closeModal() {

    setOpenState(false);

    if(userProfile.userData) {
      setFormData({
        user_full_name: userProfile.userData?.data.dgraph.user_full_name ,
        user_name: userProfile.userData?.data.dgraph.user_name ,
        user_title: userProfile.userData?.data.dgraph.user_title,
        user_hobbies: userProfile.userData?.data.dgraph.user_hobbies ,
        user_profile_object_key: userProfile.userData?.data.dgraph.user_profile_object_key || '',
        user_birthday: userProfile.userData?.data.dgraph.user_birthday,
        user_app_lang: userProfile.userData?.data.dgraph.user_app_lang || ''
      });
      if (userImage.mediaData) {
        setSelectedImage(userImage.mediaData.url || ProfileIcon)
      }
    }

  }

  const handleUpdateForm = (fieldName:string, fieldValue:string) => {
    setFormData((prevState) => ({
      ...prevState,
      [fieldName]: fieldValue,
    }));
  };

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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-2.5 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    <div className="flex flex-grow">
                    <div className="flex-1">{t('editProfileTitle')}</div>
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
                        <div className='flex justify-center'>
                          <SwitchToggle
                              label={t('onlineLabel')}
                              name="user_status"
                              value={userProfile.userData.data.dgraph.user_status == USER_STATUS_ONLINE}
                              onChange={handleSwitchToggle}
                          />
                        </div>

                        <div className="p-1">
                          <FormField
                            label={t('emailLabel')}
                            name="email"
                            value={userProfile.userData.data.dgraph.user_email_id}
                            onChange={handleChange}
                            readOnly={true}
                            required={false}
                          />
                          <FormField
                            label={t('nameLabel')}
                            name="user_full_name"
                            value={formData.user_full_name}
                            onChange={handleChange}
                            readOnly={false}
                            required={true}
                          />
                          <FormField
                            label={t('usernameLabel')}
                            name="user_name"
                            value={formData.user_name}
                            onChange={handleChange}
                            readOnly={false}
                            required={true}
                          />
                          {userNameExist && (<div className='text-red-600'>Username not available or username contains special characters or its length is grater than 25</div>)}
                          <FormField
                            label={t('titleLabel')}
                            name="user_title"
                            value={formData.user_title}
                            onChange={handleChange}
                            readOnly={false}
                            required={true}
                          />
                          <ComboboxAppLangList
                              selectedLang={formData.user_app_lang || 'en'}
                              updateLang={(lang: string)=>handleUpdateForm('user_app_lang', lang)}
                          />
                          <FormField
                            label={t('hobbiesLabel')}
                            name="user_hobbies"
                            value={formData.user_hobbies}
                            onChange={handleChange}
                            readOnly={false}
                            required={true}
                          />
                          <FormField
                            label={t('birthdayLabel')}
                            name="user_birthday"
                            type="date" // Setting input type to date
                            value={formatDate(formData.user_birthday)} // Format date for input value
                            onChange={handleBirthdayChange}
                            readOnly={false}
                            required={true}
                          />
                          <button
                              className={`${!isFormValid? 'bg-gray-300': 'bg-blue-500 hover:bg-blue-700'} mt-4  text-white font-bold py-2 px-4 rounded-full w-full`}
                              type="submit"
                              disabled={!isFormValid}
                          >
                            {t('updateLabel')}
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

export default SelfProfileModal;
