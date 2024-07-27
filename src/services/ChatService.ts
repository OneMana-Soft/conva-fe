import useSWR from "swr";
import {AttachmentMediaReq} from "./MediaService.ts";
import axiosInstance from '../utils/AxiosInstance';
import {ChatInterface} from "./DmService.ts";


interface createChatCommentReq {
  comment_text_html: string
  comment_attachments: AttachmentMediaReq[]
  chat_id: string
}

interface ChatWithAllCommentRes {
  msg: string
  data: ChatInterface
}

interface createOrUpdateCommentReactionReq {
  reaction_emoji_id: string
  comment_id: string
  reaction_dgraph_id?: string
}

interface removeCommentReactionReq {
  comment_id: string
  reaction_dgraph_id: string
}

interface commentUpdateReq {
  comment_text_html: string
  comment_id: string
  chat_id: string
}

interface commentDeleteReq {
  comment_id: string
}



class ChatService {

  static getChatWithAllComments(url: string): Promise<ChatWithAllCommentRes> {
    const fetcher: Promise<ChatWithAllCommentRes> =  axiosInstance.get(url).then((response) => response.data);
    return fetcher;
  }

  static CreateComment(postReaction: createChatCommentReq) {

    return axiosInstance.post('/api/dm/createComment', postReaction).then((res) => res);
  }

  static chatWithAllComments(chatId: string) {

    const { data, error, isLoading, mutate } = useSWR(
        (chatId !== '' ? `/api/dm/chatWithAllComments/${chatId}`: null),
        ChatService.getChatWithAllComments,
    );

    return {
      data,
      isLoading,
      isError: error,
      mutate
    };
  }

  static CreateOrUpdateCommentReaction(chatReaction: createOrUpdateCommentReactionReq) {

    return axiosInstance.put('/api/dm/addOrUpdateReactionOnComment', chatReaction).then((res) => res);
  }

  static RemoveCommentReaction(chatReaction: removeCommentReactionReq) {

    return axiosInstance.put('/api/dm/removeReactionOnComment', chatReaction).then((res) => res);
  }

  static UpdateComment(post: commentUpdateReq) {

    return axiosInstance.put('/api/dm/updateComment', post).then((res) => res);
  }

  static DeleteComment(post: commentDeleteReq) {

    return axiosInstance.put('/api/dm/removeComment', post).then((res) => res);
  }


}



export default ChatService;
