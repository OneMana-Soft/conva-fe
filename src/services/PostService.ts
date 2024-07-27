import useSWR from "swr";
import {AttachmentMediaReq} from "./MediaService.ts";
import {UserDgraphInfoInterface} from "./ProfileService.ts";
import {ChatInterface} from "./DmService.ts";
import axiosInstance from '../utils/AxiosInstance';
import {ChannelListRes} from "./ChannelService.ts";


interface createPostReq {
  post_text_html: string
  post_attachments: AttachmentMediaReq[]
  channel_id: string
}

interface createPostCommentReq {
  comment_text_html: string
  comment_attachments: AttachmentMediaReq[]
  post_id: string
}

interface createdPostInfo {
  post_id: string
  post_created_at: string
}
export interface createPostRes {
  msg: string
  data: createdPostInfo
}

interface createdCommentInfo {
  comment_id: string
  comment_created_at: string
}
export interface createPostCommentRes {
  msd: string
  data: createdCommentInfo
}

export interface ReactionRes {
  uid: string
  reaction_emoji_id: string
  reaction_added_by: UserDgraphInfoInterface
}

export interface CommentRes {
  comment_id: string
  comment_text: string
  comment_attachments?: AttachmentMediaReq[]
  comment_reactions?: ReactionRes[]
  comment_by: UserDgraphInfoInterface
  comment_created_at: string
  comment_updated_at?: string
  comment_added_locally?: boolean
  comment_chat?: ChatInterface
  comment_post?: PostsRes
}

interface PostWithAllCommentRes {
  msg: string
  data: PostsRes
}

export interface PostsRes {
  post_id: string
  post_text: string
  post_attachments ?: AttachmentMediaReq[]
  post_by: UserDgraphInfoInterface
  post_created_at: string
  post_reactions?: ReactionRes[]
  post_added_locally?: boolean
  post_comments?: CommentRes[]
  post_comment_count: number
  post_channel?: ChannelListRes
}
interface postsDataRes {
  has_more: boolean
  posts?: PostsRes[]
}

interface getPostsRes {
  data: postsDataRes
  msg: string
}

interface postUpdateReq {
  post_text_html: string
  post_id: string
}

interface commentUpdateReq {
  comment_text_html: string
  comment_id: string
}


interface postDeleteReq {
  post_id: string
}

interface commentDeleteReq {
  comment_id: string
}

interface createOrUpdateReactionReq {
  reaction_emoji_id: string
  post_id: string
  reaction_dgraph_id?: string
}

interface createOrUpdateCommentReactionReq {
  reaction_emoji_id: string
  comment_id: string
  reaction_dgraph_id?: string
}

interface removeReactionReq {
  post_id: string
  reaction_dgraph_id: string
}

interface removeCommentReactionReq {
  comment_id: string
  reaction_dgraph_id: string
}

export interface AddReactionRes {
  uid: string
  msg: string
}

class PostService {

   static getPosts(url: string): Promise<getPostsRes> {
    const fetcher: Promise<getPostsRes> = axiosInstance.get(url).then((response) => response.data);
    return fetcher;
  }

  static getPostWithAllComments(url: string): Promise<PostWithAllCommentRes> {
    const fetcher: Promise<PostWithAllCommentRes> = axiosInstance.get(url).then((response) => response.data);
    return fetcher;
  }

  static CreatePost(post: createPostReq) {

    return axiosInstance.post('/api/po/createPost', post).then((res) => res);
  }

  static UpdatePost(post: postUpdateReq) {

    return axiosInstance.put('/api/po/updatePost', post).then((res) => res);
  }

  static DeletePost(post: postDeleteReq) {

    return axiosInstance.put('/api/po/deletePost', post).then((res) => res);
  }

  static CreateOrUpdateReaction(postReaction: createOrUpdateReactionReq) {

    return axiosInstance.put('/api/po/addReaction', postReaction).then((res) => res);
  }

  static RemoveReaction(postReaction: removeReactionReq) {

    return axiosInstance.put('/api/po/removeReaction', postReaction).then((res) => res);
  }


  static getOldPosts(channelId: string, timeStamp: number) {

    const { data, error, isLoading } = useSWR(
        ((channelId !== '' && timeStamp !== 0) ? `/api/po/oldPosts/${channelId}/${timeStamp}`: null),
        PostService.getPosts, { revalidateIfStale: false,
          revalidateOnFocus: false,
          revalidateOnReconnect: false}
    );

    return {
      data,
      isLoading,
      isError: error,
    };
  }

  static getNewPosts(channelId: string, timeStamp: number) {

    const { data, error, isLoading } = useSWR(
        ((channelId !== '' && timeStamp !== 0) ?`/api/po/newPosts/${channelId}/${timeStamp}`: null),
        PostService.getPosts, {revalidateIfStale: true,
          revalidateOnFocus: false,
          revalidateOnReconnect: false}
    );

    return {
      data,
      isLoading,
      isError: error,
    };
  }

  static getLatestPosts(channelId: string) {

    const { data, error, isLoading, mutate } = useSWR(
        (channelId !== '' ? `/api/po/latestPosts/${channelId}`: null),
        PostService.getPosts,
    );

    return {
      data,
      isLoading,
      isError: error,
      mutate
    };
  }

  static postWithAllComments(postId: string) {

    const { data, error, isLoading, mutate } = useSWR(
        (postId !== '' ? `/api/po/allComments/${postId}`: null),
        PostService.getPostWithAllComments,
    );

    return {
      data,
      isLoading,
      isError: error,
      mutate
    };
  }

  static DeleteComment(post: commentDeleteReq) {

    return axiosInstance.put('/api/po/removeComment', post).then((res) => res);
  }

  static UpdateComment(post: commentUpdateReq) {

    return axiosInstance.put('/api/po/updateComment', post).then((res) => res);
  }

  static RemoveCommentReaction(postReaction: removeCommentReactionReq) {

    return axiosInstance.put('/api/po/removeReactionFromComment', postReaction).then((res) => res);
  }

  static CreateOrUpdateCommentReaction(postReaction: createOrUpdateCommentReactionReq) {

    return axiosInstance.put('/api/po/addReactionToComment', postReaction).then((res) => res);
  }

  static CreateComment(postReaction: createPostCommentReq) {

    return axiosInstance.post('/api/po/createComment', postReaction).then((res) => res);
  }

}

export default PostService;
