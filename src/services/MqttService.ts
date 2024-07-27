import {AttachmentMediaReq} from "./MediaService.ts";

export enum MqttMessageType {
    Post = 0,
    Post_Reaction,
    Channel_Typing,
    Chat,
    Chat_Reaction,
    Chat_Typing,
    Post_Comment_Count,
    Chat_Comment_Count
}

export enum MqttActionType {
    Create = 0,
    Update,
    Delete
}

export interface msgType{
    type: MqttMessageType
}

export interface msgChatInterface {
    type: MqttActionType
    chat_uuid: string
    chat_html_text: string
    user_uuid: string
    chat_grp_id: string
    chat_created_at: string
    chat_updated_at: string
    user_profile_object_key: string
    user_full_name: string
    chat_attachments: AttachmentMediaReq[]
}
export interface msgPostInterface {
    type: MqttActionType
    post_uuid: string
    post_html_text: string
    user_uuid: string
    post_channel_id: string
    post_created_at: string
    post_updated_at: string
    user_profile_object_key: string
    user_full_name: string
    post_attachments: AttachmentMediaReq[]
}


export interface msgChatReactionInterface {
    type: MqttActionType
    reaction_emoji_id: string
    user_uuid: string
    user_name: string
    chat_uuid: string
    chat_grp_id: string
    reaction_id: string
}

export interface msgPostReactionInterface {
    type: MqttActionType
    reaction_emoji_id: string
    user_uuid: string
    user_name: string
    post_uuid: string
    channel_id: string
    reaction_id: string
}

export interface msgChannelTypingInterface {
    user_uuid: string
    user_profile: string
    user_name: string
    channel_id: string
}

export interface msgChatCommentCount {
    type: number
    chat_id: string
    chat_grp_id: string
}
export interface msgPostCommentCount {
    type: number
    post_id: string
    channel_id: string
    user_uuid: string
}
export interface msgDmTypingInterface {
    user_uuid: string
    user_profile: string
    user_name: string
    chat_grp_id: string
}
interface rawMsgPostReactionInterface {
    type: number
    data: msgPostReactionInterface
}

interface rawMsgChatReactionInterface {
    type: number
    data: msgChatReactionInterface
}
interface rawMsgPostInterface {
    type: number
    data: msgPostInterface
}

interface rawMsgChatInterface {
    type: number
    data: msgChatInterface
}

interface rawMsgChannelTypingInterface {
    type: number
    data: msgChannelTypingInterface
}

interface rawMsgChatTypingInterface {
    type: number
    data: msgDmTypingInterface
}

interface rawMsgPostCommentCount {
    type: number
    data: msgPostCommentCount
}

interface rawMsgChatCommentCount {
    type: number
    data: msgChatCommentCount
}

class MqttService {

    static parsePostMsg(json_string: string) {

        const rawPost: rawMsgPostInterface = JSON.parse(json_string)
        return rawPost
    }

    static parsePostReactionMsg(json_string: string) {
        const rawPost: rawMsgPostReactionInterface = JSON.parse(json_string)
        return rawPost
    }

    static parseChannelTypingMsg(json_string: string) {
        const rawTypingInfo:  rawMsgChannelTypingInterface = JSON.parse(json_string)
        return rawTypingInfo
    }

    static parseChatMsg(json_string: string) {
        const rawChat: rawMsgChatInterface = JSON.parse(json_string)
        return rawChat
    }

    static parseChatReactionMsg(json_string: string) {
        const rawPost: rawMsgChatReactionInterface = JSON.parse(json_string)
        return rawPost
    }

    static parseChatTypingMsg(json_string: string) {
        const rawTypingInfo: rawMsgChatTypingInterface = JSON.parse(json_string)
        return rawTypingInfo
    }

    static parsePostCommentCountMsg(json_string: string) {
        const rawTypingInfo: rawMsgPostCommentCount = JSON.parse(json_string)
        return rawTypingInfo
    }

    static parseChatCommentCountMsg(json_string: string) {
        const rawTypingInfo: rawMsgChatCommentCount = JSON.parse(json_string)
        return rawTypingInfo
    }
}

export default MqttService;
