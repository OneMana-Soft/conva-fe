import React from "react";


interface TypingListProp {
    userList: string[]
}

const TypingList: React.FC<TypingListProp> = ({ userList }) => {
    const isMoreThatOne = userList.length > 1

    return (
        <div
            className="flex gap-1 items-center justify-start pl-4 pt-2 pb-2 text-center"

        >
            {
                isMoreThatOne ?
                    <div>{userList[0]} and {userList.length - 1} are typing</div> :
                    <div>{userList[0]} is typing</div>
            }
            <div className='h-1.5 w-1.5 bg-black rounded-full animate-bounce [animation-delay:-0.3s]'></div>
            <div className='h-1.5 w-1.5 bg-black rounded-full animate-bounce [animation-delay:-0.15s]'></div>
            <div className='h-1.5 w-1.5 bg-black rounded-full animate-bounce'></div>
        </div>
    );
};

export default TypingList;
