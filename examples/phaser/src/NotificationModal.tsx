import React from "react";

interface NotificationModalProps {
  message: string;
  onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  message,
  onClose,
}) => {
  return (
    <div className='h-screen w-screen flex items-center justify-center z-50 backdrop-blur-md fixed top-0 left-0'>
      <div className='bg-white p-6 rounded-lg shadow-xl z-60'>
        <p className='text-gray-700'>{message}</p>
        <button
          className='mt-4 px-4 py-2 text-xl font-bold text-white bg-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent'
          onClick={onClose}
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default NotificationModal;
