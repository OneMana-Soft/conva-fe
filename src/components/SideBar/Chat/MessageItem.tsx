import React from "react";

type Message = {
  username: string;
  message: string;
  image: string;
  time: string;
};

type Props = {
  message: Message;
  onClick: () => void;
  index: number
};

const MessageItem: React.FC<Props> = ({ message, onClick, index }) => {
  return (
    <div>
      <div className="flex items-center mb-2 p-2 cursor-pointer hover:border-blue-500 hover:shadow-xl rounded-2xl" onClick={onClick}>
        <img src={`${message.image}?${index}`} alt={message.username} className="h-16 w-16 rounded-lg mr-2" />
        <div className="flex-1">
          <div className="flex justify-between">
            <div className="text-m font-medium text-gray-900">{message.username}</div>
            <div className="text-xs text-gray-500">{message.time}</div>
          </div>
          <div className="max-w-52 h-18 text-gray-900 text-sm overflow-hidden overflow-ellipsis line-clamp-3">{message.message}</div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
