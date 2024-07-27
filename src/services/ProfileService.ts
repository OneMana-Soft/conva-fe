import useSWR from "swr";
import {DmInterface} from "./DmService.ts";
import axiosInstance from "../utils/AxiosInstance.ts";
import axios from "axios";


export interface UserPostgresInfoInterface {
  Id: string,
  email_id: string,
  user_name: string,
  CreatedAt: string,
  UpdatedAt: string,
  DeletedAt: string,
}

export const USER_STATUS_ONLINE = "online"
export const USER_STATUS_OFFLINE = "offline"

export const USER_NOTIFICATION_ALL = "all"
export const USER_NOTIFICATION_MENTION = "mention"
export const USER_NOTIFICATION_BLOCK = "block"


export interface UserDgraphInfoInterface {
  uid ?: string,
  user_uuid : string,
  user_email_id : string,
  user_created_at ?: string,
  user_updated_at ?: string,
  user_deleted_at ?: string,
  user_profile_object_key : string,
  user_full_name : string,
  user_dms ?: DmInterface[],
  user_moderator ?: boolean,
  user_name : string,
  user_title : string,
  user_hobbies : string,
  user_birthday : string,
  user_status?: string
  user_device_connected?: number
  notification_type?:string
  user_app_lang?: string
}

export interface UsersListRes {
  msg: string,
  users: UserDgraphInfoInterface[]
}

interface UserProfileDataInterface {
  postgres: UserPostgresInfoInterface,
  dgraph: UserDgraphInfoInterface,
}

export interface UserProfileInterface {
  data: UserProfileDataInterface,
  status: string
}

export interface UserNameAvailabilityCheckReq {
  user_name: string
}

export interface UserNameAvailabilityCheckRes {
  unameExist: boolean
}

export interface UserProfileUpdateRes {
  msg: string,
  status: string
}

interface UserProfileByIdUpdateRes {
  data: UserDgraphInfoInterface,
  status: string
}

interface UserStatusUpdateReq {
  user_status: string
}

interface UserFCmTokenReq {
  fcm_token: string
}

export const PROFILE_STATUS_SUCCESS = "success"

class ProfileService {
  private static getProfileFetcher(url: string): Promise<UserProfileInterface> {
    const fetcher: Promise<UserProfileInterface> = axiosInstance.get(url).then((response) => response.data);
    return fetcher;
  }

  private static getUserListFetcher(url: string): Promise<UsersListRes> {
    const fetcher: Promise<UsersListRes> = axiosInstance.get(url).then((response) => response.data);
    return fetcher;
  }

  private static getProfileByIdFetcher(url: string): Promise<UserProfileByIdUpdateRes> {
    const fetcher: Promise<UserProfileByIdUpdateRes> = axiosInstance.get(url).then((response) => response.data);
    return fetcher;
  }
  

  static updateProfile(data: any) {

    return axiosInstance.post('/api/updateUserProfile', data)
    .then((res) => res);

  }

  static getBasicSelfUserProfile() {

    const { data, error, isLoading, mutate } = useSWR(
        `/api/basicSelfProfile`,
        ProfileService.getProfileFetcher
    );

    return {
      userData: data,
      isLoading,
      isError: error,
      userMutate: mutate
    };
  }

  static checkIfUserNameIsAvailable(uName: string) {

    const dataReq:UserNameAvailabilityCheckReq = {
      user_name: uName
    }
    return axiosInstance.post('/api/getIfUserNameIsAvailable', dataReq)
        .then((res) => res);

  }

  static updateUserStatus(status: string) {

    const dataReq: UserStatusUpdateReq = {
      user_status: status
    }
    return axiosInstance.put('/api/user/updateStatus', dataReq).then((res) => res);

  }

  static logout() {
    return axios.get(`${import.meta.env.VITE_BACKEND_URL}logout`, {
      withCredentials: true
    }).then((res) => res);
  }


  static getSelfUserProfile() {
    const { data, error, isLoading, mutate} = useSWR(
      `/api/user/profile`,
      ProfileService.getProfileFetcher
    );

    return {
      userData: data,
      isLoading,
      isError: error,
      mutate
    };
  }

  static getUserProfileForID(id: string) {
    const { data, error, mutate, isLoading } = useSWR(
       (id!=='' ?`/api/user/profile/${id}`:null),
      ProfileService.getProfileByIdFetcher
    );

    return {
      user: data,
      isLoading,
      isError: error,
      mutate
    };
  }

  static getUsersListWhoDontExistInChannel(id: string) {

    const { data, error, isLoading, mutate } = useSWR(
        (id!=='' ?`/api/user/usersListNotBelongToChannelId/${id}`:null),
        ProfileService.getUserListFetcher
    );


    return {
      data: data,
      isLoading,
      mutate,
      isError: error,
    };
  }

  static getAllUsersList() {
    return axiosInstance.get('/api/user/allUsers')
        .then((res) => res);

  }

  static UpdateFCMTOken(updateFCMToken: UserFCmTokenReq) {

    return axiosInstance.put('/api/user/updateFCMToken', updateFCMToken).then((res) => res);
  }
}

export default ProfileService;
