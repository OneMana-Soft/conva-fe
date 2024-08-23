import React from 'react';
import AttachmentImage from './AttachemntImage';
import {
  ChevronDownIcon,
} from '@heroicons/react/20/solid';
import AttachmentFileList from './AttachmentFileList.tsx';
import {AttachmentMediaReq} from "../../../services/MediaService.ts";

interface AttachmentProps {
  attachmentsObject: AttachmentMediaReq[];
}

function isImageAttachment(filename: string): boolean {
  const allowedImageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
  const extension = filename.split('.').pop();
  if(extension) {
    return allowedImageExtensions.includes(extension);
  }
  return false
}

const Attachment: React.FC<AttachmentProps> = ({ attachmentsObject }) => {
  let allImage = true;

  let RenderAttachment: JSX.Element = <></>;

  for (const attachmentObjectKey of attachmentsObject) {
    if (!isImageAttachment(attachmentObjectKey.attachment_file_name)) {
      allImage = false;
    }
  }

  if (allImage) {
    RenderAttachment = (
      <AttachmentImage attachmentsObjectKey={attachmentsObject} />
    );
  } else {
    RenderAttachment = <AttachmentFileList attachmentsObject={attachmentsObject} />;
  }

  return (
    <div className='ml-16'>
      <div className='ml-4 mt-2 text-sm font-semibold h-4'>
        {attachmentsObject.length} files uploaded{' '}
        <ChevronDownIcon className='h-6 w-6 inline-block' />
      </div>
      {RenderAttachment}
    </div>
  );
};

export default Attachment;
