import React, { useState } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { useEffect } from 'react';
import { LuFileSpreadsheet } from 'react-icons/lu';
import UserCard from '../../components/Cards/UserCard';
import toast from 'react-hot-toast';

const ManageUsers = () => {
  const [allUsers, setAllUsers] = useState([]);

  const getAllUsers = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
      setAllUsers(response.data);
    } catch (error) {
      console.error("Error Fetching Users:", error);
    }
  };

  // Download Task Report
  const handleDownloadReport = async () => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.REPORTS.EXPORT_USERS,
      { responseType: "blob" }
    );

    const blob = new Blob(
      [response.data],
      {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }
    );

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", "user_details.xlsx");

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }  catch (error) {
  console.error("DOWNLOAD ERROR FULL:", {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    headers: error.response?.headers,
  });

  toast.error("Failed to download report. Please try again.");
}

};


  useEffect(() => {
  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.USERS.GET_ALL_USERS
      );
      setAllUsers(response.data);
    } catch (error) {
      console.error("Error Fetching Users:", error);
    }
  };

  fetchUsers();
}, []);


  return (
   <DashboardLayout activeMenu="Team Members">
    <div className='mt-5 mb-10'>
      <div className='flex md:flex-row md:items-center justify-between'>
        <h2 className='text-xl md:text-xl font-medium'>Team Members</h2>
          <button className="flex md:flex download-btn" onClick={handleDownloadReport}>
            <LuFileSpreadsheet className='text-lg' />
            Download Report
          </button>
      </div>
    
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4'>
    {allUsers?.map((user) => (
      <UserCard key={user._id} userInfo={user} />
    ))}
    </div>
    </div>
   </DashboardLayout>
  )
}

export default ManageUsers