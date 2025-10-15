import React from 'react';

const colorPalette = ['#ef4444', '#f97316', '#84cc16', '#10b981', '#06b6d4', '#6366f1', '#d946ef', '#f43f5e'];
const stringToHash = (str: string = '') => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}
const getColorForName = (name: string = 'User') => {
  const hash = stringToHash(name);
  const index = Math.abs(hash) % colorPalette.length;
  return colorPalette[index];
}

interface UserAvatarProps {
    name: string | null;
    photoURL?: string | null;
    className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ name, photoURL, className = "w-10 h-10" }) => {
    const userName = name || 'U';
    const initials = userName.trim().split(/\s+/).map(s => s[0]).join('').slice(0, 2).toUpperCase();

    if (photoURL) {
        return (
            <img 
                src={photoURL} 
                alt={userName} 
                className={`rounded-full object-cover flex-shrink-0 ${className}`} 
                title={userName} 
            />
        );
    }

    return (
        <div 
            className={`rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${className}`}
            style={{ backgroundColor: getColorForName(userName) }}
            title={userName}
        >
            {initials}
        </div>
    );
};

export default UserAvatar;