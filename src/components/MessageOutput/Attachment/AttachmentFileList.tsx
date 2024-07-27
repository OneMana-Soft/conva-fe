import React from "react";
import {AttachmentMediaReq} from "../../../services/MediaService.ts";
import AttachmentFile from "./AttachmentFile.tsx";

interface AttachmentFileProps {
  attachmentsObject: AttachmentMediaReq[];
}

const AttachmentFileList: React.FC<AttachmentFileProps> = ({
  attachmentsObject,
}) => {

  return (
    <div className="flex flex-wrap">
      {attachmentsObject.map((objectKey) => (

           <AttachmentFile key={objectKey.attachment_obj_key} attachmentsObject={objectKey}/>
      ))}
    </div>
  );
};

export default AttachmentFileList;
