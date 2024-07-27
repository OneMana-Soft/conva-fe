import React from "react";
import MessageItem from "./MessageItem";

type Message = {
  username: string;
  message: string;
  image: string;
  time: string;
};

interface MainWindowStateInterface {
  type: string;
  context: string;
}

type Props = {
  messages: Message[];
  handleSwitchWindowClick: (mainWIndowState: MainWindowStateInterface) => void;
};

const DmSection: React.FC<Props> = ({ messages, handleSwitchWindowClick }) => {
  const handleDmClick = (index: number) => {

    let minWindowState: MainWindowStateInterface = {
      type: 'Chat',
      context: index.toString()
    };

    handleSwitchWindowClick(minWindowState)

  };

  return (
    <div>
      <div className="p-4 mb-2">
        <h2 className="text-2xl font-bold">Chat</h2>
      </div>
      <div className="p-3.5">
        <div className="mb-6 w-full"> {/* Set width to 100% */}
          <input type="text" placeholder="Search" className="w-full px-2 py-1 border-2 border-gray-300 rounded-full" />
        </div>
        {messages.map((message, index) => (
          <React.Fragment key={index}>
            {index !== 0 && <hr className="border-gray-300 my-2" />} {/* Divider */}
            <MessageItem index={index} key={index} message={message} onClick={() => handleDmClick(index)} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default DmSection;
