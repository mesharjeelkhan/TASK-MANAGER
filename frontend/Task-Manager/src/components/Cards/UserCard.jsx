import React from 'react';

const UserCard = ({ userInfo }) => {
  const { name, email, profileImageUrl, pendingTasks, inProgressTasks, CompletedTasks } = userInfo;

  return (
    <div className='user-card p-4 bg-white rounded-xl shadow-md'>
      {/* User Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-gray-100 flex items-center justify-center">
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-400 font-semibold">{name?.[0]}</span>
            )}
          </div>

          {/* Name & Email */}
          <div>
            <p className="text-sm font-medium">{name}</p>
            <p className="text-xs text-gray-500">{email}</p>
          </div>
        </div>
      </div>

      {/* Task Status */}
      <div className="flex items-end gap-3 mt-4">
        <StatusCard label="Pending" count={pendingTasks || 0} status="Pending" />
        <StatusCard label="In Progress" count={inProgressTasks || 0} status="In Progress" />
        <StatusCard label="Completed" count={CompletedTasks || 0} status="Completed" />
      </div>
    </div>
  );
};

export default UserCard;

// ================== Status Card ==================
const StatusCard = ({ label, count, status }) => {
  const getStatusTagColor = () => {
    switch (status) {
      case "In Progress":
        return "text-cyan-500 bg-gray-50";
      case "Completed":
        return "text-indigo-500 bg-gray-50";
      default:
        return "text-violet-500 bg-gray-50";
    }
  };

  return (
    <div
      className={`flex-1 text-[10px] font-medium ${getStatusTagColor()} px-3 py-1 rounded`}
    >
      <span className='text-[12px] font-semibold'>{count}</span>
      <br />
      {label}
    </div>
  );
};
