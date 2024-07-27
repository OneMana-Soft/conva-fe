import React from 'react';

interface SidebarItemProps {
  name: string;
  handleChannelClick: (channelName: string) => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ name, handleChannelClick }) => {
  return (
    <li className="py-1 hover:bg-gray-700 rounded">
      <a className="flex items-center text-gray-300 hover:text-white" onClick={() => handleChannelClick(name)}>
        <span className="mr-2">{name}</span>
      </a>
    </li>
  );
};

export default SidebarItem;