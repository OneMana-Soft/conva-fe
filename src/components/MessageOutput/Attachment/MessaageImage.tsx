import React from "react";
import {PhotoIcon} from "@heroicons/react/20/solid";
import {LazyLoadImage} from "react-lazy-load-image-component";
import mediaService from "../../../services/MediaService.ts";


interface ChannelMessagesProps {
    objectKey: string
}

const MessageImage: React.FC<ChannelMessagesProps> = ({objectKey}) => {

    const mediaRes = mediaService.getMediaURLForID(objectKey)

    if(mediaRes.isError || mediaRes.isLoading) {
        return <></>
    }


    return (
        <>
            <LazyLoadImage
                src={mediaRes.mediaData.url}
                alt=""
                className="object-contain h-full w-full"
                placeholder={
                    <div className="h-60 w-60 bg-gray-500 flex flex-col justify-center items-center">
                        <PhotoIcon className="h-20 w-20"/>
                        <div>loading</div>
                    </div>
                }

            />
        </>

    );
};

export default MessageImage;
