import React, { useRef } from 'react';
import { UserCircleIcon, PencilIcon } from '@heroicons/react/24/solid';

const ProfileCard = ({ user }) => {
  const fileInputRef = useRef();

  // Placeholder for image upload (UI only)
  const handleEditClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="profile-card">
      {user?.avatarUrl
        ? <img src={user.avatarUrl} alt="avatar" className="avatar" />
        : <UserCircleIcon className="avatar placeholder-avatar" />}
      <div className="profile-name">{user?.username || "User"}</div>
      <div className="profile-email">{user?.email || "user@email.com"}</div>
    </div>
  );
};

export default ProfileCard; 