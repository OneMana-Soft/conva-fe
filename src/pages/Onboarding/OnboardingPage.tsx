import React, { useState} from "react";
import FormField from "../../components/Form/FormField.tsx";
import FormImageUpload from "../../components/Form/FormImageUpload.tsx";
import ProfileService, {
  PROFILE_STATUS_SUCCESS,
  UserNameAvailabilityCheckRes,
  UserProfileUpdateRes
} from "../../services/ProfileService";
import {useNavigate} from "react-router-dom";
import {URL_CHANNEL} from "../../constants/routes/appNavigation.ts";
import profileService from "../../services/ProfileService.ts";
import MediaService, {UploadFileInterfaceRes} from "../../services/MediaService.ts";
import ProfileIcon from "../../assets/user_profile.svg"
import {useTranslation} from "react-i18next";


interface EditProfileProps {
  user_full_name: string;
  user_name: string;
  user_title: string;
  user_hobbies: string;
  user_birthday: string;
  user_profile_object_key: string;
}

const OnboardingPage: React.FC = () => {


  const [userNameExist, setUserNameExist] = useState(false)
  const navigate = useNavigate()

  const [formData, setFormData] = useState<EditProfileProps>({
    user_full_name: "",
    user_name: "",
    user_title: "",
    user_hobbies: "",
    user_profile_object_key: "",
    user_birthday: "",
  });
  const [selectedImage, setSelectedImage] = useState<string>(ProfileIcon);
  const [selectedImageFile, selectedImageSetFile] = useState<File | null>(null);
  const [userNameAvailabilityDebounceTimer, setUserNameAvailabilityDebounceTimer] = useState< ReturnType<typeof setTimeout> | null>(null);


  const {userData, isLoading, isError, userMutate} = profileService.getBasicSelfUserProfile()
  const {t} = useTranslation()


  if(isLoading) {
    return(<div>LOADING</div>)
  }

  // TODO: do something make it better
  if(isError || userData == undefined) {
    return(<div>{isError}</div>)
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
    console.log("sdafsdf", e)
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
      userData.data.postgres.user_name = formData.user_name
      await userMutate(userData)
      navigate(URL_CHANNEL)
    }

    // TODO: do something
  };

  // conditions for disabling form submit button

  const {user_full_name, user_name, user_birthday } = formData;
  const isFormValid = (user_full_name !== '' && user_name !== '' && user_birthday !== "" && !userNameExist)


  return (
    <div className="flex h-full flex-col items-center justify-center dark:bg-gray-800 dark:text-slate-200 p-8 pb-2 pt-2 overflow-y-auto">
      <div className="mb-8 font-semibold text-xl">Create Profile</div>
      <form onSubmit={handleSubmit} className="mx-auto md:w-[30vw] w-[80vw]">
        <FormImageUpload
          selectedImage={selectedImage}
          handleImageUpload={handleImageUpload}
        />
        <div className="p-3.5">
          <FormField
            label={t('emailLabel')}
            name="email"
            value={userData?.data.postgres.email_id || ''}
            onChange={() => {}}
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
            required={false}
          />
          <FormField
            label={t('hobbiesLabel')}
            name="user_hobbies"
            value={formData.user_hobbies}
            onChange={handleChange}
            readOnly={false}
            required={false}
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
            {t('submitLabel')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OnboardingPage;
