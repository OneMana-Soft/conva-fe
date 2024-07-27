// WebSocketComponent.tsx
import React, {useEffect, useState} from 'react';
import mqtt, {ISubscriptionMap} from 'mqtt';
import ConfigService from "../../services/ConfigService.ts";
import mqttService, {
    MqttActionType,
    MqttMessageType,
    msgChatInterface,
    msgPostInterface,
    msgType
} from "../../services/MqttService.ts";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../store/store.ts";
import {
    createPost,
    createPostReactionPostId, decrementPostCommentCountByPostID,
    ExtendedPosts, incrementPostCommentCountByPostID,
    removePostByPostId,
    removePostReactionByPostId,
    updatePostByPostId,
    updatePostReactionPostId
} from "../../store/slice/channelSlice.ts";
import postService from "../../services/PostService.ts";
import profileService, {UserDgraphInfoInterface} from "../../services/ProfileService.ts";
import {addChannelTyping, addChatTyping, RemoveChannelTyping, RemoveChatTyping} from "../../store/slice/typingSlice.ts";
import dmService from "../../services/DmService.ts";
import {
    createChat,
    createChatReactionChatId, decrementChatCommentCountByChatID,
    ExtendedChats, incrementChatCommentCountByChatID,
    removeChatByChatId,
    removeChatReactionByChatId,
    updateChatByChatId,
    updateChatReactionByChatId
} from "../../store/slice/dmSlice.ts";
import {getOtherUserId} from "../../utils/Helper.ts";


const WebSocketComponent: React.FC = () => {
    const dispatch = useDispatch()
    const mqttConfigRes = ConfigService.chatWithAllComments();
    const [mqttClientId, setMqttClientId] = useState<string>('')
    const [newMqttPost, setNewMqttPost] = useState<msgPostInterface>({} as msgPostInterface)
    const [newMqttChat, setNewMqttChat] = useState<msgChatInterface>({} as msgChatInterface)
    const channelPosts = useSelector((state:RootState)=>
        state.channel.channelPosts ? state.channel.channelPosts: {} as ExtendedPosts)
    const dmChats = useSelector((state:RootState)=>
        state.dm.DmChats ? state.dm.DmChats: {} as ExtendedChats)
    const latestChannelPost = postService.getLatestPosts(newMqttPost.post_channel_id || '')
    const userProfile = profileService.getSelfUserProfile()
    const dmChatsId= getOtherUserId(newMqttChat.chat_grp_id || '', userProfile.userData?.data.dgraph.user_uuid || '')
    const latestDmChat = dmService.getLatestDmChats(dmChatsId || '')
    let dmId = ''
    let wsPort = 8083
    if (import.meta.env.MODE !== 'dev') {
        wsPort = 8084
    }


    useEffect(() => {
        let mqttClient: mqtt.MqttClient | null = null;

        if (userProfile.userData && userProfile.userData.data && mqttConfigRes.data && mqttConfigRes.data.data) {
            const { clientId, username, password, topics } = mqttConfigRes.data.data;
            const wsUrl = import.meta.env.VITE_WS_URL;

            if(!mqttClientId) {
                setMqttClientId(clientId)
            }

            mqttClient = mqtt.connect(wsUrl, {
                clientId: mqttClientId,
                username,
                password,
                clean: true,
                path: "/mqtt",
                port: wsPort
            });

            mqttClient.on('connect', () => {
                console.log('MQTT client connected');
                const subscriptions: ISubscriptionMap = {};
                if(!mqttConfigRes.data?.data.topics) {
                    return
                }
                topics.forEach((topic: string) => {
                    subscriptions[topic] = { qos: 0 }; // Set QoS to 1, you can change this to 0 or 2 based on your requirement
                });
                mqttClient?.unsubscribe(topics, (err) => {
                    if (err) {
                        // console.error('Failed to unsubscribe:', err);
                    }
                });
                mqttClient?.subscribe(subscriptions, (err) => {
                    if (err) {
                        // console.error('Failed to subscribe:', err);
                    }
                });
            });

            mqttClient.on('message', ( _, message) => {

                const type: msgType = JSON.parse(message.toString())
                switch (type.type) {
                    case MqttMessageType.Post:
                        const  mqttPostInfo = mqttService.parsePostMsg(message.toString())

                        switch (mqttPostInfo.data.type) {
                            case MqttActionType.Create:
                                setNewMqttPost(mqttPostInfo.data)
                                latestChannelPost.mutate()
                                break

                            case MqttActionType.Update:
                                dispatch(updatePostByPostId({postId: mqttPostInfo.data.post_uuid, channelId: mqttPostInfo.data.post_channel_id, htmlText: mqttPostInfo.data.post_html_text}))
                                break

                            case MqttActionType.Delete:
                                dispatch(removePostByPostId({postId: mqttPostInfo.data.post_uuid, channelId: mqttPostInfo.data.post_channel_id}))
                                break
                        }

                        break

                    case MqttMessageType.Post_Reaction:

                        const mqttPostReaction = mqttService.parsePostReactionMsg(message.toString())

                        switch (mqttPostReaction.data.type) {

                            case MqttActionType.Create:
                                dispatch(createPostReactionPostId({postId: mqttPostReaction.data.post_uuid, channelId: mqttPostReaction.data.channel_id, emojiId: mqttPostReaction.data.reaction_emoji_id, reactionId: mqttPostReaction.data.reaction_id, addedBy:{user_uuid: mqttPostReaction.data.user_uuid, user_name: mqttPostReaction.data.user_name, user_email_id:'', user_profile_object_key:'', user_full_name:'', user_title:'',  user_hobbies: '', user_birthday: ''}}))
                                break

                            case MqttActionType.Update:
                                dispatch(updatePostReactionPostId({postId: mqttPostReaction.data.post_uuid, channelId: mqttPostReaction.data.channel_id, reactionId: mqttPostReaction.data.reaction_id, emojiId: mqttPostReaction.data.reaction_emoji_id}))
                                break

                            case MqttActionType.Delete:
                                dispatch(removePostReactionByPostId({postId: mqttPostReaction.data.post_uuid, channelId: mqttPostReaction.data.channel_id, reactionId: mqttPostReaction.data.reaction_id}))
                                break
                        }

                        break

                    case MqttMessageType.Channel_Typing:

                        const mqttChannelTyping = mqttService.parseChannelTypingMsg(message.toString())

                        if(userProfile.userData?.data.dgraph.user_uuid === mqttChannelTyping.data.user_uuid || userProfile.isLoading) {
                            break
                        }

                        const chanelTypingTimeOut =  setTimeout(() => {

                            dispatch(RemoveChannelTyping({userId: mqttChannelTyping.data.user_uuid, channelId: mqttChannelTyping.data.channel_id}))

                        }, 4000)


                        dispatch(addChannelTyping({timer: chanelTypingTimeOut, user:{user_uuid: mqttChannelTyping.data.user_uuid, user_name: mqttChannelTyping.data.user_name, user_profile_object_key: mqttChannelTyping.data.user_profile, user_email_id:'', user_full_name:'', user_title:'', user_hobbies:'', user_birthday:''}, channelId: mqttChannelTyping.data.channel_id}))


                        break

                    case MqttMessageType.Post_Comment_Count:
                        const mqttPostCommentCount = mqttService.parsePostCommentCountMsg(message.toString())

                        switch (mqttPostCommentCount.data.type) {
                            case MqttActionType.Create:
                                dispatch(incrementPostCommentCountByPostID({postId: mqttPostCommentCount.data.post_id, channelId: mqttPostCommentCount.data.channel_id}))
                                break

                            case MqttActionType.Delete:
                                dispatch(decrementPostCommentCountByPostID({postId: mqttPostCommentCount.data.post_id, channelId: mqttPostCommentCount.data.channel_id}))
                                break

                        }
                        break

                    case MqttMessageType.Chat:

                        const  mqttChatInfo = mqttService.parseChatMsg(message.toString())
                        dmId = getOtherUserId(mqttChatInfo.data.chat_grp_id,  userProfile.userData?.data.dgraph.user_uuid||'')

                        switch (mqttChatInfo.data.type) {

                            case MqttActionType.Create:
                                setNewMqttChat(mqttChatInfo.data)
                                latestDmChat.dmMutate()
                                break

                            case MqttActionType.Update:
                                dispatch(updateChatByChatId({chatId: mqttChatInfo.data.chat_uuid, dmId: dmId, htmlText: mqttChatInfo.data.chat_html_text}))
                                break

                            case MqttActionType.Delete:
                                dispatch(removeChatByChatId({chatId: mqttChatInfo.data.chat_uuid, dmId: dmId}))
                                break

                        }

                        break

                    case MqttMessageType.Chat_Reaction:

                        const mqttChatReaction = mqttService.parseChatReactionMsg(message.toString())
                         dmId = getOtherUserId(mqttChatReaction.data.chat_grp_id,  userProfile.userData?.data.dgraph.user_uuid||'')
                        switch (mqttChatReaction.data.type) {

                            case MqttActionType.Create:
                                dispatch(createChatReactionChatId({ chatId: mqttChatReaction.data.chat_uuid , dmId: dmId, emojiId: mqttChatReaction.data.reaction_emoji_id, reactionId: mqttChatReaction.data.reaction_id, addedBy:{user_uuid: mqttChatReaction.data.user_uuid, user_name: mqttChatReaction.data.user_name, user_email_id:'', user_profile_object_key:'', user_full_name:'', user_title:'',  user_hobbies: '', user_birthday: ''}}))
                                break;

                            case MqttActionType.Update:
                                dispatch(updateChatReactionByChatId({chatId: mqttChatReaction.data.chat_uuid, dmId: dmId, reactionId: mqttChatReaction.data.reaction_id, emojiId: mqttChatReaction.data.reaction_emoji_id}))
                                break

                            case MqttActionType.Delete:
                                dispatch(removeChatReactionByChatId({chatId: mqttChatReaction.data.chat_uuid, dmId: dmId, reactionId: mqttChatReaction.data.reaction_id}))
                                break
                        }

                        break

                    case MqttMessageType.Chat_Typing:
                        const mqttChatTyping = mqttService.parseChatTypingMsg(message.toString())
                        if(userProfile.userData?.data.dgraph.user_uuid == mqttChatTyping.data.user_uuid) {
                            break
                        }

                        const chatTypingTimeOut =  setTimeout(() => {
                            dispatch(RemoveChatTyping({userId: mqttChatTyping.data.user_uuid, chatId: mqttChatTyping.data.user_uuid}))

                        }, 4000)


                        dispatch(addChatTyping({timer: chatTypingTimeOut, user:{user_uuid: mqttChatTyping.data.user_uuid, user_name: mqttChatTyping.data.user_name, user_profile_object_key: mqttChatTyping.data.user_profile, user_email_id:'', user_full_name:'', user_title:'', user_hobbies:'', user_birthday:''}, chatId: mqttChatTyping.data.user_uuid}))


                        break

                    case MqttMessageType.Chat_Comment_Count:
                        const mqttChatCommentCount = mqttService.parseChatCommentCountMsg(message.toString())
                        dmId = getOtherUserId(mqttChatCommentCount.data.chat_grp_id,  userProfile.userData?.data.dgraph.user_uuid||'')
                        switch (mqttChatCommentCount.data.type) {
                            case MqttActionType.Create:
                                dispatch(incrementChatCommentCountByChatID({dmId: dmId, chatId: mqttChatCommentCount.data.chat_id}))
                                break

                            case MqttActionType.Delete:
                                dispatch(decrementChatCommentCountByChatID({dmId: dmId, chatId: mqttChatCommentCount.data.chat_id}))
                                break

                        }

                        break
                }

            });

            mqttClient.on('close', () => {
                console.log('MQTT client disconnected');
            });

            mqttClient.on('error', (error) => {
                console.error('MQTT error:', error);
            });

            return () => {
                mqttClient?.end();
            };
        }
    }, [mqttConfigRes.data, userProfile.userData]);

    useEffect(() => {
        if(newMqttPost && latestChannelPost.data && latestChannelPost.data.data.posts && latestChannelPost.data.data.posts.length > 1 && newMqttPost.post_channel_id && channelPosts[newMqttPost.post_channel_id] && channelPosts[newMqttPost.post_channel_id].length) {
            if(latestChannelPost.data.data.posts[1].post_id == channelPosts[newMqttPost.post_channel_id][channelPosts[newMqttPost.post_channel_id].length-1].post_id  &&
                channelPosts[newMqttPost.post_channel_id][channelPosts[newMqttPost.post_channel_id].length-1].post_id != newMqttPost.post_uuid) {
                dispatch(createPost({
                    postId: newMqttPost.post_uuid,
                    postCreatedAt: newMqttPost.post_created_at,
                    postText: newMqttPost.post_html_text,
                    channelId: newMqttPost.post_channel_id,
                    postBy: {user_uuid: newMqttPost.user_uuid, user_full_name: newMqttPost.user_full_name, user_profile_object_key: newMqttPost.user_profile_object_key, user_email_id: "", user_name: "", user_hobbies: "", user_birthday: "", user_title:""},
                    attachments: newMqttPost.post_attachments
                }))
                setNewMqttPost({} as msgPostInterface)
            }
        }


    }, [latestChannelPost.data]);

    useEffect(() => {
        const dmId = getOtherUserId(newMqttChat.chat_grp_id || '', userProfile.userData?.data.dgraph.user_uuid || '')
        if(newMqttChat && latestDmChat.chatData && latestDmChat.chatData.data.chats && latestDmChat.chatData.data.chats.length > 1 && dmChats[dmId] && dmChats[dmId].length) {
            if(latestDmChat.chatData.data.chats[1].chat_uuid == dmChats[dmId][dmChats[dmId].length-1].chat_uuid  &&
                dmChats[dmId][dmChats[dmId].length-1].chat_uuid != newMqttChat.chat_uuid) {
                dispatch(createChat({
                    chatId: newMqttChat.chat_uuid,
                    chatCreatedAt: newMqttChat.chat_created_at,
                    chatText: newMqttChat.chat_html_text,
                    dmId: dmId,
                    chatBy: {user_uuid: newMqttChat.user_uuid, user_full_name: newMqttChat.user_full_name, user_profile_object_key: newMqttChat.user_profile_object_key, user_email_id: "", user_name: "", user_hobbies: "", user_birthday: "", user_title:""},
                    attachments: newMqttChat.chat_attachments,
                    chatTo: userProfile.userData?.data.dgraph || {} as UserDgraphInfoInterface,

                }))
                setNewMqttChat({} as msgChatInterface)
            }
        }


    }, [latestDmChat.chatData]);

    if (mqttConfigRes.isError) {
        return <div>Error loading configuration</div>;
    }

    if (mqttConfigRes.isLoading) {
        return <div>Loading...</div>;
    }

    return null;
};

export default WebSocketComponent;
