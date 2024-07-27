import React from "react";
import mediaService, {AttachmentMediaReq} from "../../../services/MediaService.ts";
import {getFileSVGReact} from "../../../utils/Helper.ts";

interface AttachmentFileProps {
    attachmentsObject: AttachmentMediaReq;
}

const AttachmentFile: React.FC<AttachmentFileProps> = ({
                                                               attachmentsObject,
                                                           }) => {

    const mediaInfo = mediaService.getMediaURLForID(attachmentsObject.attachment_obj_key)
    if(mediaInfo.isLoading) {
        return (<></>)
    }
    const FileIcon = getFileSVGReact(attachmentsObject.attachment_file_name)
    return (

        <a href={mediaInfo.mediaData.url} download={attachmentsObject.attachment_file_name} target='_blank' className="flex m-4 p-2 border border-gray-700 hover:cursor-pointer rounded-xl">
            <FileIcon height="1.4rem" width="1.4rem" fill="#383838" />
            <div className="ml-2">{attachmentsObject.attachment_file_name}</div>
        </a>

    );
};

export default AttachmentFile;
