import axiosInstance from '../utils/AxiosInstance';
import useSWR from "swr";
import {UserDgraphInfoInterface} from "./ProfileService.ts";
import {AttachmentMediaReq} from "./MediaService.ts";

interface ChannelUserRes {
    user_name: string
    user_full_name: string
}
interface ChannelPostRes {
    post_text: string,
    post_created_at: string
    post_by: ChannelUserRes,
    post_attachments?: AttachmentMediaReq[]
}

export interface ChannelListRes {
    ch_id: string,
    ch_name: string,
    ch_icon: string,
    ch_private: boolean,
    unread_post_count ?: number
    ch_created_at: string
    ch_posts: ChannelPostRes[]
    ch_created_by: UserDgraphInfoInterface,
    ch_handle: string,
    ch_members ?: UserDgraphInfoInterface[],
    ch_moderators ?: UserDgraphInfoInterface[],
    ch_deleted_at ?: string
    notification_type ?: string

}

interface JoinChannelReq {
    channel_id: string
}

interface ChannelTypingReq {
    channel_id: string
}
interface ChannelInfoRes {
    channel_info: ChannelListRes,
    msg: string
}

export interface GetChannelsInterface {
    channels_list: ChannelListRes[],
    msg: string,
}

export interface CreateChannelReq {
    channel_name: string,
    channel_handle: string,
    channel_private: boolean,
    channel_profile_key: string,
    channel_uuid?: string
}

interface CheckChannelReq {
    channel_handle: string,
}

export interface CheckChannelRes {
    handle_exist: boolean,
}

interface SearchChannelReq {
    search_text: string,
}

interface UpdateChannelNotificationType {
    notification_type: string
    channel_id: string
}

interface AddChannelMemberReq {
    channel_id: string
    user_id: string
}

class ChannelService {

    private static getChannelsFetcher(url: string) :Promise<GetChannelsInterface> {
        return axiosInstance.get(url).then((response) => response.data);
    }

    private static getChannelInfoFetcher(url: string) :Promise<ChannelInfoRes> {
        return axiosInstance.get(url).then((response) => response.data);
    }
    static CheckIfChannelHandleIsAvailable(channelHandle: string) {

        const dataReq:CheckChannelReq = {
            channel_handle: channelHandle
        }
        return axiosInstance.post('/api/ch/channelHandleIsAvailable', dataReq)
            .then((res) => res);
    }

    static CreateChannel(data: CreateChannelReq) {

        return axiosInstance.post('/api/ch/create', data)
            .then((res) => res);

    }

    static JoinChannel(data: JoinChannelReq) {
        return axiosInstance.post('/api/ch/joinChannel', data)
            .then((res) => res);
    }

    static PublishChannelTyping(data: ChannelTypingReq) {
        return axiosInstance.post('/api/ch/publishChannelTyping', data)
            .then((res) => res);
    }

    static AddMemberToChannel(data: AddChannelMemberReq) {

        return axiosInstance.put('/api/ch/addMember', data)
            .then((res) => res);

    }

    static MakeMemberAdmin(data: AddChannelMemberReq) {

        return axiosInstance.put('/api/ch/addModerator', data)
            .then((res) => res);

    }

    static RemoveMemberAdmin(data: AddChannelMemberReq) {

        return axiosInstance.put('/api/ch/removeModerator', data)
            .then((res) => res);

    }

    static RemoveMemberFromChannel(data: AddChannelMemberReq) {

        return axiosInstance.put('/api/ch/removeMember', data)
            .then((res) => res);

    }

    static UpdateChannelInfo(data: CreateChannelReq) {

        return axiosInstance.put('/api/ch/updateInfo', data)
            .then((res) => res);

    }

    static getUserChannelInfoWithLatestPost() {

        const { data, error, isLoading, mutate } = useSWR(
            `/api/ch/userChannelsWithLatestPost`,
            ChannelService.getChannelsFetcher
        );

        return {
            channelData: data,
            isLoading,
            isError: error,
            channelMutate: mutate
        };
    }

    static SearchChannelName(searchText: string) {

        const dataReq:SearchChannelReq = {
            search_text: searchText
        }
        return axiosInstance.post('/api/ch/channelListWithLatestPostWithSearchText', dataReq)
            .then((res) => res);
    }

    static UpdateChannelNotificationType(dataReq: UpdateChannelNotificationType) {

        return axiosInstance.put('/api/user/updateUserChannelNotification', dataReq)
            .then((res) => res);
    }

    static getChannelInfo(id: string) {

        const { data, error, isLoading, mutate } = useSWR(
            (id!=='' ?`/api/ch/channelInfo/${id}`:null),
            ChannelService.getChannelInfoFetcher
        );


        return {
            data: data,
            isLoading,
            isError: error,
            mutate
        };
    }

}

export default ChannelService
