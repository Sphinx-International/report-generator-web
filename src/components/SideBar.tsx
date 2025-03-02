import { sideBarTab } from "../assets/sidebarData";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { closeSidebar } from "../Redux/slices/sideBarSlice";
import { RootState } from "../Redux/store";
import { AppDispatch } from "../Redux/store";
import { useState } from "react";
import { getRole } from "../func/getUserRole";
import { getUserAccess } from "../func/getAccess";
const baseUrl = import.meta.env.VITE_BASE_URL;

interface SubMenu {
  title: string;
  link: string;
  svg: string;
  activeSvg: string;
  access: "admin" | "all" | "coord";
}

const SideBar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isSidebarOpen = useSelector((state: RootState) => state.sidebar.isOpen);
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const toggleMenu = (menuTitle: string) => {
    setActiveMenu(activeMenu === menuTitle ? null : menuTitle);
  };

  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault();
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }
    try {
      const response = fetch(`${baseUrl}/account/logout`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });
      if ((await response).status === 200) {
        navigate("/login");
        localStorage.clear();
        sessionStorage.clear();
      }
    } catch (error) {
      console.error("Error deleting users:", error);
      alert("Failed to delete users");
    }
  };

  const renderSubMenu = (subItems: SubMenu[] | undefined) => {
    if (!subItems) return null;

    return (
      <div className="ml-3 flex flex-col gap-[13px]">
        {subItems.map((subItem, index) => {
          if (
            ((getRole() === 1 || getRole() === 3) &&
              subItem.access === "admin") ||
            (getRole() === 2 && subItem.access !== "all")
          ) {
            return null;
          }

          return (
            <NavLink
              to={subItem.link}
              key={index}
              className={({ isActive }) =>
                `flex items-center gap-[15px] ${
                  isActive ? "text-primary" : "text-[#6F6C90]"
                } font-medium w-[150px] xl:w-[190px] text-[14px]`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: isActive ? subItem.activeSvg : subItem.svg,
                    }}
                  />
                  {subItem.title}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={`absolute md:relative sidebar h-[100vh] ${
        isSidebarOpen ? "w-full bg-n700 bg-opacity-10 z-50" : ""
      }`}
    >
      <div
        className={`flex flex-col items-start justify-between h-[100vh] py-[28px] pl-[40px] md:relative md:left-0 fixed bg-white z-50 ${
          isSidebarOpen ? "left-0" : "-left-80"
        } transition-all duration-[500ms]`}
      >
        {/* Close Icon */}
        <svg
          onClick={() => {
            dispatch(closeSidebar());
          }}
          className="flex md:hidden absolute top-[18px] right-[18px]"
          xmlns="http://www.w3.org/2000/svg"
          fill="#6F6C90"
          height="20px"
          width="20px"
          viewBox="0 0 1792 1792"
        >
          <path d="M1082.2,896.6l410.2-410c51.5-51.5,51.5-134.6,0-186.1s-134.6-51.5-186.1,0l-410.2,410L486,300.4c-51.5-51.5-134.6-51.5-186.1,0s-51.5,134.6,0,186.1l410.2,410l-410.2,410c-51.5,51.5-51.5,134.6,0,186.1c51.6,51.5,135,51.5,186.1,0l410.2-410l410.2,410c51.5,51.5,134.6,51.5,186.1,0c51.1-51.5,51.1-134.6-0.5-186.2L1082.2,896.6z" />
        </svg>

        <div className="flex flex-col items-start gap-[10px] h-full">
          {/* Logo */}
          <img src="/logo.png" alt="logo" className="w-[110px] pb-[16%]" />

          {/* Menu Items */}
          <div className="flex flex-col items-start gap-[28px] border-r-[1px] border-r-[#E6EDFF] h-[85%] overflow-y-auto">
            {sideBarTab.map((item, index) => {
              if (
                (getRole() === 1 && item.access === "admin") ||
                ((getRole() === 2 || getRole() === 3) &&
                  item.access !== "all") ||
                (item.projectAccess !== undefined &&
                  item.projectAccess !== null &&
                  !getUserAccess().includes(item.projectAccess))
              )
                return null;

              return (
                <div key={index} className="w-full flex flex-col gap-3">
                  <div
                    className="flex items-center justify-between cursor-pointer pr-3"
                    onClick={() => {
                      toggleMenu(item.title);
                      if (!item.subItem) {
                        navigate(item.link);
                      }
                    }}
                  >
                    <div
                      className={`flex items-center gap-[15px] ${
                        activeMenu === item.title
                          ? "text-primary"
                          : "text-[#6F6C90]"
                      } font-medium w-[150px] xl:w-[190px] text-[14px]`}
                    >
                      <div
                        dangerouslySetInnerHTML={{
                          __html:
                            activeMenu === item.title
                              ? item.activeSvg
                              : item.svg,
                        }}
                      />
                      {item.title}
                    </div>
                    {item.subItem && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className={`w-5 h-5 transition-transform ${
                          activeMenu === item.title ? "rotate-90" : "rotate-180"
                        }`}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.25 15.75l3.75-3.75 3.75 3.75"
                        />
                      </svg>
                    )}
                  </div>
                  {activeMenu === item.title && renderSubMenu(item.subItem)}
                </div>
              );
            })}
          </div>
        </div>

        {/* Logout Button */}
        <button
          className="flex flex-row-reverse items-center py-[5px] gap-[15px] text-[#6F6C90] font-medium text-[14px]"
          onClick={handleLogout}
        >
          Log out
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M1.85 9.9772C1.85 7.96834 1.85029 6.43137 1.91141..."
              fill="#6F6C90"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SideBar;
