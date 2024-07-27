import {UserDgraphInfoInterface} from "./ProfileService.ts";
import axiosInstance from '../utils/AxiosInstance';
import useSWR from "swr";
import {AttachmentMediaReq} from "./MediaService.ts";
import {CommentRes, ReactionRes} from "./PostService.ts";

export interface ChatInterface {
    chat_body_text: string,
    chat_from:  UserDgraphInfoInterface,
    chat_to: UserDgraphInfoInterface,
    chat_created_at: string
    chat_attachments: AttachmentMediaReq[]
    chat_uuid: string
    chat_added_locally: boolean
    chat_reactions?: ReactionRes[]
    chat_comment_count: number
    chat_comments?: CommentRes[]

}

export interface createChatRes {
    msg: string
    data: ChatInterface
}
export interface DmInterface {
    dm_grouping_id: string,
    dm_chats: ChatInterface[],
    dm_unread: number
}

interface SearchDmReq {
    search_text: string
}

interface DmPaginationResp {
    chats: ChatInterface[],
    has_more: boolean
}

interface GetChatsResp {
    msg: string,
    data: DmPaginationResp
}

interface GetDmListInterface {
    msg: string
    data: UserDgraphInfoInterface
}

interface chatDeleteReq {
    chat_id: string
}

interface removeReactionReq {
    chat_id: string
    reaction_dgraph_id: string
}

interface chatUpdateReq {
    text_html: string
    chat_id: string
}


interface createOrUpdateReactionReq {
    reaction_emoji_id: string
    chat_id: string
    reaction_dgraph_id?: string
}

interface createChatReq {
    text_html: string
    media_attachments: AttachmentMediaReq[]
    to_uuid: string
}

interface UpdateChatNotificationType {
    notification_type: string
    to_user_id: string
}

interface publishChatTypingReq {
    user_uuid: string
}

class DmService {
    private static getDmsFetcher(url: string) :Promise<GetDmListInterface> {
        return axiosInstance.get(url).then((response) => response.data);
    }

    private static getDmChatsFetcher(url: string) :Promise<GetChatsResp> {
        return axiosInstance.get(url).then((response) => response.data);
    }

    static UpdateChatNotificationType(dataReq: UpdateChatNotificationType) {

        return axiosInstance.put('/api/user/updateChatNotification', dataReq)
            .then((res) => res);
    }

    static getUserDmsInfoWithLatestPost() {

        const { data, error, isLoading, mutate } = useSWR(
            `/api/dm/getLatestChatList`,
            DmService.getDmsFetcher
        );

        return {
            dmData: data,
            isLoading,
            isError: error,
            dmMutate: mutate
        };
    }

    static SearchDmByUserName(searchText: string) {

        const dataReq:SearchDmReq = {
            search_text: searchText
        }
        return axiosInstance.post('/api/dm/searchChatWithUser', dataReq)
            .then((res) => res);
    }

    static getLatestDmChats(dmId: string) {

        const { data, error, isLoading, mutate } = useSWR(
            (dmId !== '' ?`/api/dm/latestChat/${dmId}`: null),
            DmService.getDmChatsFetcher
        );

        return {
            chatData: data,
            isLoading,
            isError: error,
            dmMutate: mutate
        };
    }

    static CreateChat(post: createChatReq) {

        return axiosInstance.post('/api/dm/createChat', post).then((res) => res);
    }

    static PublishChatTyping(post: publishChatTypingReq) {

        return axiosInstance.post('/api/dm/publishChatTyping', post).then((res) => res);
    }

    static getOldChats(dmId: string, timeStamp: number) {

        const { data, error, isLoading, mutate } = useSWR(
            ((dmId !== '' && timeStamp !== 0) ? `/api/dm/oldChats/${dmId}/${timeStamp}`: null),
            DmService.getDmChatsFetcher, { revalidateIfStale: false,
                revalidateOnFocus: false,
                revalidateOnReconnect: false}
        );

        return {
            mutate,
            data,
            isLoading,
            isError: error,
        };
    }

    static getNewChats(dmId: string, timeStamp: number) {

        const { data, error, isLoading, mutate } = useSWR(
            ((dmId !== '' && timeStamp !== 0) ?`/api/dm/newChats/${dmId}/${timeStamp}`: null),
            DmService.getDmChatsFetcher, {revalidateIfStale: true,
                revalidateOnFocus: false,
                revalidateOnReconnect: false}
        );

        return {
            mutate,
            data,
            isLoading,
            isError: error,
        };
    }

    static CreateOrUpdateReaction(postReaction: createOrUpdateReactionReq) {

        return axiosInstance.put('/api/dm/addOrCreateReaction', postReaction).then((res) => res);
    }

    static RemoveReaction(postReaction: removeReactionReq) {

        return axiosInstance.put('/api/dm/removeReaction', postReaction).then((res) => res);
    }

    static UpdateChat(post: chatUpdateReq) {

        return axiosInstance.put('/api/dm/updateChat', post).then((res) => res);
    }

    static DeleteChat(post: chatDeleteReq) {

        return axiosInstance.put('/api/dm/deleteChat', post).then((res) => res);
    }

}

export default DmService
