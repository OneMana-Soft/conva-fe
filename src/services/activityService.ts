import axiosInstance from '../utils/AxiosInstance';
import {ChatInterface} from "./DmService.ts";
import {CommentRes, PostsRes} from "./PostService.ts";
import useSWR from "swr";
import {UserDgraphInfoInterface} from "./ProfileService.ts";

export interface mentionsRes {
    mention_chat: ChatInterface
    mention_post: PostsRes
    mention_comment: CommentRes
    mention_created_at: string
    mention_updated_at: string
}

export interface reactionsRes {
    reaction_added_at: string
    reaction_emoji_id: string
    reaction_added_by: UserDgraphInfoInterface
    chat: ChatInterface
    post: PostsRes
    comment: CommentRes
}

interface commentsPagination {
    has_more: boolean
    comments: CommentRes[]
}
interface mentionsPagination {
    has_more: boolean
    mentions: mentionsRes[]
}

interface reactionsPagination {
    has_more: boolean
    reactions: reactionsRes[]
}

interface rawMentionsRes{
    msg: string
    data: mentionsPagination
}

interface rawCommentsRes {
    msg: string
    data: commentsPagination
}

interface rawReactionsRes {
    msg: string
    data: reactionsPagination
}


class ActivityService {
    private static getMentionsFetcher(url: string) :Promise<rawMentionsRes> {
        return axiosInstance.get(url).then((response) => response.data);
    }

    private static getCommentsFetcher(url: string) :Promise<rawCommentsRes> {
        return axiosInstance.get(url).then((response) => response.data);
    }

    private static getReactionsFetcher(url: string) :Promise<rawReactionsRes> {
        return axiosInstance.get(url).then((response) => response.data);
    }

    static getLatestReactions() {

        const { data, error, isLoading } = useSWR(
            `/api/activity/latestReactions`,
            ActivityService.getReactionsFetcher,
        );

        return {
            data,
            isLoading,
            isError: error,
        };
    }

    static getLatestMentions() {

        const { data, error, isLoading } = useSWR(
            `/api/activity/latestMentions`,
            ActivityService.getMentionsFetcher,
        );

        return {
            data,
            isLoading,
            isError: error,
        };
    }

    static getLatestComments() {

        const { data, error, isLoading } = useSWR(
            `/api/activity/latestComments`,
            ActivityService.getCommentsFetcher,
        );

        return {
            data,
            isLoading,
            isError: error,
        };
    }

    static getNewReactions(timeStamp: number) {
        const { data, error, isLoading } = useSWR(
            ((timeStamp !== 0) ?`/api/activity/latestReactionsBefore/${timeStamp}`: null),
            ActivityService.getReactionsFetcher, { revalidateIfStale: false,
                revalidateOnFocus: false,
                revalidateOnReconnect: false}
        );

        return {
            data,
            isLoading,
            isError: error,
        };
    }

    static getNewMentions(timeStamp: number) {

        const { data, error, isLoading } = useSWR(
            ((timeStamp !== 0) ?`/api/activity/latestMentionsBefore/${timeStamp}`: null),
            ActivityService.getMentionsFetcher, {revalidateIfStale: true,
                revalidateOnFocus: false,
                revalidateOnReconnect: false}
        );

        return {
            data,
            isLoading,
            isError: error,
        };
    }

    static getNewComments(timeStamp: number) {

        const { data, error, isLoading } = useSWR(
            ((timeStamp !== 0) ?`/api/activity/latestCommentsBefore/${timeStamp}`: null),
            ActivityService.getCommentsFetcher, {revalidateIfStale: true,
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

export default ActivityService