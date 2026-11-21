import React, { useRef, useState, useEffect } from "react";
import { FaUser, FaCamera, FaTrash } from "react-icons/fa";

const ProfilePhotoSelector = ({ image, setImage }) => {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!image) {
      setPreviewUrl(null);
      return;
    }

    if (typeof image === "string") {
      setPreviewUrl(image);
    } else if (image instanceof File) {
      const objectUrl = URL.createObjectURL(image);
      setPreviewUrl(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [image]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setImage(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const onChooseFile = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div className="flex justify-center mb-6">
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleImageChange}
        className="hidden"
      />

      <div className="relative">
        <button
          type="button"
          onClick={onChooseFile}
          className="w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-500 focus:outline-none flex items-center justify-center bg-gray-50 cursor-pointer transition-colors"
          title="Upload profile photo"
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Profile preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <FaUser className="text-3xl" />
              <FaCamera className="text-xs mt-1 text-gray-500" />
            </div>
          )}
        </button>

        {previewUrl && (
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow cursor-pointer transition-colors"
            title="Remove photo"
          >
            <FaTrash className="text-xs" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfilePhotoSelector;
