import axiosInstance from '../utils/AxiosInstance';
import useSWR from "swr";


export const CHAT_TYPE = "chat"
export const COMMENT_TYPE = "comment"
export const POST_TYPE = "post"
export const ATTACHMENT_TYPE = "attachment"
interface searchAttachmentRes {
    attachment_id: string
    attachment_file_name: string
    attachment_obj_key: string
    attachment_by_user_full_name: string
    attachment_by_profile: string
    attachment_comment_id: string
    attachment_channel_id: string
    attachment_channel_name: string
    attachment_chat_grp_id: string
    attachment_post_id: string
    attachment_chat_id: string
    attachment_chat_to_user_id: string
    attachment_chat_to_user_name: string
    attachment_chat_from_user_id: string
    attachment_chat_from_user_name: string
    created_date: number
}
interface searchCommentRes {
    comment_id: string
    comment_body: string
    comment_by_user_full_name: string
    comment_by_profile: string
    comment_chat_grp_id: string
    comment_chat_from_user_id: string
    comment_chat_to_user_id: string
    comment_chat_to_user_full_name: string
    comment_chat_from_user_full_name:string
    comment_channel_id: string
    comment_channel_name: string
    comment_post_id: string
    comment_chat_id: string
    created_date: number
    updated_date: number
}

interface searchPostRes {
    post_id: string
    post_body: string
    post_by_user_id: string
    post_by_user_full_name: string
    post_ch_name: string
    post_by_profile: string
    post_ch_id: string
    created_date: number
    updated_date: number
}

interface searchChatsRes {
    chat_id: string
    chat_body: string
    chat_by_user_id: string
    chat_by_user_full_name: string
    chat_to_user_full_name: string
    chat_by_profile: string
    chat_to_user_id: string
    chat_grp_id: string
    created_date: number
}

export interface searchRes {
    type: string
    comment: searchCommentRes
    chat: searchChatsRes
    post: searchPostRes
    attachment: searchAttachmentRes
}

interface searchPage {
    page: searchRes[]
    has_more: boolean
}
interface rawSearchRes {
    msg: string
    data: searchPage
}
interface InputData {
    global_search_text: string
    global_search_time_stamp?: number
}

class SearchService {
    private static getSearchFetcher({url, data}: {url: string, data: InputData}) :Promise<rawSearchRes> {
        return axiosInstance.post(url, data).then((response) => response.data);
    }

    static getLatestChatsAndComments(searchParam: InputData) {

        const { data, error, isLoading } = useSWR(
            searchParam.global_search_text == '' ? null : {url:`/api/search/latestChatsAndComments`, data:searchParam},
            SearchService.getSearchFetcher, { revalidateIfStale: false,
                revalidateOnFocus: false,
                revalidateOnReconnect: false}
        );

        return {
            data,
            isLoading,
            isError: error,
        };
    }

    static getLatestChatsAndCommentsBefore(searchParam: InputData) {

        const { data, error, isLoading } = useSWR(
            (searchParam.global_search_time_stamp == 0 || searchParam.global_search_text == '') ? null : {url:`/api/search/latestChatsAndCommentsBefore`, data: searchParam},
            SearchService.getSearchFetcher, { revalidateIfStale: false,
                revalidateOnFocus: false,
                revalidateOnReconnect: false}
        );

        return {
            data,
            isLoading,
            isError: error,
        };
    }

    static getLatestPostsAndComments(searchParam: InputData) {

        const { data, error, isLoading } = useSWR(
            searchParam.global_search_text == '' ? null : {url: `/api/search/latestPostsAndComments`, data: searchParam},
            SearchService.getSearchFetcher, { revalidateIfStale: false,
                revalidateOnFocus: false,
                revalidateOnReconnect: false}
        );

        return {
            data,
            isLoading,
            isError: error,
        };
    }

    static getLatestPostsAndCommentsBefore(searchParam: InputData) {

        const { data, error, isLoading } = useSWR(
            (searchParam.global_search_time_stamp == 0 || searchParam.global_search_text == '') ? null : {url: `/api/search/latestPostsAndCommentsBefore`, data: searchParam},
            SearchService.getSearchFetcher, { revalidateIfStale: false,
                revalidateOnFocus: false,
                revalidateOnReconnect: false}
        );

        return {
            data,
            isLoading,
            isError: error,
        };
    }

    static getLatestAttachments(searchParam: InputData) {

        const { data, error, isLoading } = useSWR(
            searchParam.global_search_text == '' ? null : {url:`/api/search/latestAttachments`, data: searchParam},
            SearchService.getSearchFetcher, { revalidateIfStale: false,
                revalidateOnFocus: false,
                revalidateOnReconnect: false}
        );

        return {
            data,
            isLoading,
            isError: error,
        };
    }

    static getLatestAttachmentsBefore(searchParam: InputData) {

        const { data, error, isLoading } = useSWR(
            (searchParam.global_search_time_stamp == 0 || searchParam.global_search_text == '') ? null : {url:`/api/search/latestAttachmentsBefore`, data: searchParam},
            SearchService.getSearchFetcher, { revalidateIfStale: false,
                revalidateOnFocus: false,
                revalidateOnReconnect: false}
        );

        return {
            data,
            isLoading,
            isError: error,
        };
    }

}

export default SearchService