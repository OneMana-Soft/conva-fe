import { Dialog, Transition } from "@headlessui/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/20/solid";
import React, { useState, Fragment } from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import {AttachmentMediaReq} from "../../../services/MediaService.ts";
import MessaageImage from "./MessaageImage.tsx";


const AttachmentImage: React.FC<{
  attachmentsObjectKey: AttachmentMediaReq[];
}> = ({ attachmentsObjectKey }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openImageIndex, setOpenImageIndex] = useState(0);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal(index: number) {
    setOpenImageIndex(index);
    setIsOpen(true);
  }

  const incrementIndex = () => {
    setOpenImageIndex(
      Math.min(openImageIndex + 1, attachmentsObjectKey.length - 1)
    );
  };

  const decrementIndex = () => {
    setOpenImageIndex(Math.max(openImageIndex - 1, 0));
  };

  return (
    <>
      <div className="flex flex-wrap">
        {attachmentsObjectKey.map((objectKey, index) => (
          <div
            key={index}
            onClick={() => openModal(index)}
            className="max-h-64 max-w-64 m-2 hover:cursor-pointer p-2 hover:bg-gray-600"
          >
            <MessaageImage objectKey={objectKey.attachment_obj_key}/>
          </div>
        ))}
        
      </div>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-30" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>
          <div className="fixed inset-0 h-full max-h-vh">
            <div className="flex overflow-y-auto justify-centre items-center max-h-full max-h-vh items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <div >
                  <Dialog.Panel className="select-none h-[90vh] w-[90vw] justify-center items-center transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      <div className="flex flex-grow">
                        <div className="flex-1">Image {openImageIndex+1}/{attachmentsObjectKey.length}</div>
                        <div
                          className="hover:cursor-pointer"
                          onClick={closeModal}
                        >
                          <XMarkIcon height="1.5rem" width="1.5rem" />
                        </div>
                      </div>
                    </Dialog.Title>
                    <div className="flex flex-row items-center justify-center">
                      {openImageIndex !== 0 && <div
                        className="bg-sky-500 hover:bg-sky-700 hover:cursor-pointer p-2 md:p-4 mr-1.5 md:mr-2 rounded-full"
                        onClick={decrementIndex}
                      >
                        <ChevronLeftIcon className="h-8" fill="#eee" />
                      </div>}
                      <div
                        className="flex-1 flex justify-center items-center "
                        style={{ maxHeight: "80vh" }}
                      >

                        <div className="h-[80vh] w-[50vw] md:h-[80vh] md:w-[80vw] overflow-hidden flex-col justify-center items-center">
                          <MessaageImage objectKey={attachmentsObjectKey[openImageIndex]?.attachment_obj_key || ''}/>

                        </div>
                      </div>
                      {openImageIndex !== (attachmentsObjectKey.length-1) && <div
                        className="bg-sky-500 hover:bg-sky-700 hover:cursor-pointer p-2 ml-1.5 md:p-4 md:ml-2 rounded-full"
                        onClick={incrementIndex}
                      >
                        <ChevronRightIcon className="h-8" fill="#eee" />
                      </div>}
                    </div>
                  </Dialog.Panel>
                </div>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default AttachmentImage;
