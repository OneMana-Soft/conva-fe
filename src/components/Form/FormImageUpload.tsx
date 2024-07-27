import React from "react";

interface ProfileImageUploadProps {
    selectedImage: string | null;
    handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FormImageUpload: React.FC<ProfileImageUploadProps> = ({
                                                                selectedImage,
                                                                handleImageUpload,
                                                            }) => {
    const isValidImage = (file: File) => {
        const acceptedImageTypes = ["image/jpeg", "image/png", "image/gif"];
        return file && acceptedImageTypes.includes(file.type);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files && event.target.files[0];
        if (file && isValidImage(file)) {
            handleImageUpload(event);
        } else {
            // Notify the user that only image files are allowed
            alert("Please select a valid image file (JPEG, PNG, GIF).");
            // Clear the input field
            event.target.value = "";
        }
    };

    return (
        <div className="flex justify-center items-center mb-3">
            <img
                className="h-48 w-48 rounded-lg"
                src={
                    selectedImage ||
                    "https://source.unsplash.com/featured/?product&index=3"
                }
                alt="Chatter Logo"
            />
            <div className="h-48 w-48 absolute flex justify-center items-center bg-black bg-opacity-50 rounded-lg opacity-0 hover:opacity-100">
                <label
                    htmlFor="imageUpload"
                    className="h-full w-full flex justify-center items-center cursor-pointer"
                >
                    <div className="rounded-lg text-white text-sm font-bold">Edit</div>
                </label>
            </div>
            <input
                id="imageUpload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleInputChange}
            />
        </div>
    );
};

export default FormImageUpload;
