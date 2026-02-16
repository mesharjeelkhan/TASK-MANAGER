import React from 'react'
import twitter from "../../assets/twitter.png";


const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex">
      
      {/* LEFT CONTENT */}
      <div className="flex-1 flex items-center justify-center">
        {children}
      </div>

      {/* RIGHT IMAGE */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-gray-100">
        <img
          src={twitter}
          alt="Hero"
          className="max-w-full h-auto"
        />
      </div>

    </div>
  );
};

export default AuthLayout;
