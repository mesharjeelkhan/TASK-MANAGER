import React, { useContext } from "react";
import { UserContext } from "../../context/userContext";
import { SIDE_MENU_DATA, SIDE_MENU_USER_DATA } from "../../utils/data";
import { useNavigate } from "react-router-dom";

const SideMenu = ({ activeMenu }) => {
  const { user, clearUser } = useContext(UserContext);
  const navigate = useNavigate();

  const sideMenuData =
    user?.role === "admin" ? SIDE_MENU_DATA : SIDE_MENU_USER_DATA;

  const handleLogout = () => {
    localStorage.clear();
    clearUser();
    navigate("/login");
  };

  const handleClick = (route) => {
    if (route === "logout") {
      handleLogout();
    } else {
      navigate(route);
    }
  };

  return (
    <div className="w-64 h-[calc(100vh-61px)] bg-white border-r border-gray-200 sticky top-[61px] z-20">
      {/* PROFILE */}
      <div className="flex flex-col items-center justify-center mb-7 pt-5">
        <div className="relative w-20 h-20">
          <img
            src={user?.profileImageUrl || ""}
            alt=""
            className="w-20 h-20 rounded-full bg-slate-700 object-cover"
          />
          {!user?.profileImageUrl && (
            <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-semibold">
              Profile
            </span>
          )}
        </div>

        {user?.role === "admin" && (
          <span className="text-[10px] font-medium text-white bg-primary px-3 py-0.5 rounded mt-1">
            Admin
          </span>
        )}

        <h5 className="text-gray-900 font-medium mt-3">
          {user?.name}
        </h5>

        <p className="text-[12px] text-gray-500">
          {user?.email}
        </p>
      </div>

      {/* MENU */}
      <div>
        {sideMenuData.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.label;

          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.path)}
              className={`w-full flex items-center gap-4 text-sm py-3 px-6 mb-1
                ${
                  isActive
                    ? "text-primary bg-gradient-to-r from-blue-50 to-blue-100 border-r-4 border-primary"
                    : "text-gray-700 hover:bg-gray-100"
                }
              `}
            >
              <Icon className="text-xl" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SideMenu;
