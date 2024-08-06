import { sideBarTab } from "../assets/sidebarData";
import { NavLink,useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { closeSidebar } from "../Redux/slices/sideBarSlice";
import { RootState } from "../Redux/store";
import { AppDispatch } from "../Redux/store";
const baseUrl = import.meta.env.VITE_BASE_URL;

const SideBar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isSidebarOpen = useSelector((state: RootState) => state.sidebar.isOpen);
  const navigate = useNavigate();


  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      console.error("No token found");
      return;
    }
    try {
    const response =  fetch(`${baseUrl}/account/logout`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });
      if ((await response).status === 200) {
        navigate("/login")
         localStorage.clear()
         sessionStorage.clear()
      }
    } catch (error) {
      console.error("Error deleting users:", error);
      alert("Failed to delete users");
    }
  };

  return (
    <div
      className={`absolute md:relative sidebar h-[100vh] ${
        isSidebarOpen ? "w-full bg-n700 bg-opacity-10 z-50" : ""
      }`}
    >
      <div
        className={`flex flex-col items-start justify-between h-[100vh] py-[32px] pl-[45px] md:relative md:left-0 fixed bg-white z-50 ${
          isSidebarOpen ? "left-0" : "-left-80"
        } transition-all duration-[500ms] `}
      >
        <svg
          onClick={() => {
            dispatch(closeSidebar());
          }}
          className="flex md:hidden absolute top-[18px] right-[18px]"
          xmlns="http://www.w3.org/2000/svg"
          fill="#6F6C90"
          height="20px"
          width="20px"
          version="1.1"
          id="Layer_1"
          viewBox="0 0 1792 1792"
        >
          <path d="M1082.2,896.6l410.2-410c51.5-51.5,51.5-134.6,0-186.1s-134.6-51.5-186.1,0l-410.2,410L486,300.4  c-51.5-51.5-134.6-51.5-186.1,0s-51.5,134.6,0,186.1l410.2,410l-410.2,410c-51.5,51.5-51.5,134.6,0,186.1  c51.6,51.5,135,51.5,186.1,0l410.2-410l410.2,410c51.5,51.5,134.6,51.5,186.1,0c51.1-51.5,51.1-134.6-0.5-186.2L1082.2,896.6z" />
        </svg>
        <div className="flex flex-col items-start gap-[10px]">
          <img src="/logo.png" alt="logo" className="w-[110px]" />
          <div className="flex flex-col items-start gap-[28px] pt-[32%] pb-[80%] border-r-[1px] border-r-[#E6EDFF]">
            {sideBarTab.map((item, index) => {
              if (localStorage.getItem("role") === "0") {
                return (
                  <NavLink
                    to={item.link}
                    key={index}
                    onClick={() => {
                      localStorage.removeItem("selectedFilter")
                      dispatch(closeSidebar());
                    }}
                    className={({ isActive, isPending }) =>
                      `${isPending ? "pending" : isActive ? "active" : ""}`
                    }
                  >
                    {({ isActive }) => (
                      <div className="flex items-center justify-between cursor-pointer">
                        <div
                          className={`flex items-center gap-[15px] ${
                            isActive ? "text-primary" : "text-[#6F6C90]"
                          }  font-medium w-[150px] xl:w-[190px] text-[14px]`}
                        >
                          <div
                            dangerouslySetInnerHTML={{
                              __html: isActive ? item.activeSvg : item.svg,
                            }}
                          />
                          {item.title}
                        </div>
                        {isActive && (
                          <span className="w-[4px] h-[24px] bg-primary rounded-tl-[3px] rounded-bl-[3px]"></span>
                        )}
                      </div>
                    )}
                  </NavLink>
                );
              } else if (item.access === "all") {
                return (
                  <NavLink
                    to={item.link}
                    key={index}
                    onClick={() => {
                      dispatch(closeSidebar());
                    }}
                    className={({ isActive, isPending }) =>
                      `${isPending ? "pending" : isActive ? "active" : ""}`
                    }
                  >
                    {({ isActive }) => (
                      <div className="flex items-center justify-between cursor-pointer">
                        <div
                          className={`flex items-center gap-[15px] ${
                            isActive ? "text-primary" : "text-[#6F6C90]"
                          }  font-medium w-[190px] xl:w-[228px]`}
                        >
                          <div
                            dangerouslySetInnerHTML={{
                              __html: isActive ? item.activeSvg : item.svg,
                            }}
                          />
                          {item.title}
                        </div>
                        {isActive && (
                          <span className="w-[4px] h-[24px] bg-primary rounded-tl-[3px] rounded-bl-[3px]"></span>
                        )}
                      </div>
                    )}
                  </NavLink>
                );
              }
            })}
          </div>
        </div>
        <button className="flex flex-row-reverse items-center gap-[15px] text-[#6F6C90] font-medium text-[14px]"
         onClick={handleLogout}
        >
          Log out{" "}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M1.85002 9.9772C1.85002 7.96834 1.85029 6.43137 1.91141 5.23948C1.97333 4.03193 2.09509 3.27824 2.28923 2.79288C2.45864 2.36935 2.66921 2.17758 2.9956 2.05065C3.39632 1.89482 4.00387 1.8272 5.00002 1.8272C5.97383 1.8272 6.65326 1.88893 7.12813 1.99446C7.60149 2.09965 7.80451 2.23377 7.89898 2.32824C7.98323 2.41248 8.05462 2.53765 8.09909 2.80444C8.14761 3.09558 8.15002 3.45564 8.15002 3.9772C8.15002 4.44664 8.53058 4.8272 9.00002 4.8272C9.46947 4.8272 9.85003 4.44664 9.85003 3.9772L9.85003 3.93463V3.93461C9.8501 3.46832 9.85017 2.97023 9.77596 2.52496C9.69543 2.04175 9.51682 1.54191 9.10106 1.12616C8.69554 0.720627 8.14856 0.479748 7.49692 0.334938C6.84679 0.190465 6.02622 0.127197 5.00002 0.127197C3.99618 0.127197 3.10373 0.184577 2.37945 0.466243C1.58084 0.776812 1.04141 1.33505 0.710819 2.16152C0.404963 2.92615 0.276714 3.92246 0.21364 5.15241C0.150024 6.39291 0.150024 7.97303 0.150024 9.95272V9.95291V9.9772V10.0015V10.0017C0.150024 11.9814 0.150024 13.5615 0.21364 14.802C0.276714 16.0319 0.404963 17.0282 0.710819 17.7929C1.04141 18.6193 1.58084 19.1776 2.37945 19.4882C3.10373 19.7698 3.99618 19.8272 5.00002 19.8272C6.02622 19.8272 6.84679 19.7639 7.49692 19.6195C8.14856 19.4746 8.69554 19.2338 9.10106 18.8282C9.51682 18.4125 9.69543 17.9126 9.77596 17.4294C9.85017 16.9842 9.8501 16.4861 9.85003 16.0198V16.0198L9.85003 15.9772C9.85003 15.5078 9.46947 15.1272 9.00002 15.1272C8.53058 15.1272 8.15002 15.5078 8.15002 15.9772C8.15002 16.4988 8.14761 16.8588 8.09909 17.15C8.05462 17.4167 7.98323 17.5419 7.89898 17.6262C7.80451 17.7206 7.60149 17.8547 7.12813 17.9599C6.65326 18.0655 5.97383 18.1272 5.00002 18.1272C4.00387 18.1272 3.39632 18.0596 2.9956 17.9037C2.66921 17.7768 2.45864 17.5851 2.28923 17.1615C2.09509 16.6762 1.97333 15.9225 1.91141 14.7149C1.85029 13.523 1.85002 11.9861 1.85002 9.9772ZM15.6011 5.37616C15.2691 5.04421 14.7309 5.04421 14.399 5.37616C14.067 5.7081 14.067 6.24629 14.399 6.57824L16.9479 9.1272H9.00002C8.53058 9.1272 8.15002 9.50776 8.15002 9.9772C8.15002 10.4466 8.53058 10.8272 9.00002 10.8272H16.9479L14.399 13.3762C14.067 13.7081 14.067 14.2463 14.399 14.5782C14.7309 14.9102 15.2691 14.9102 15.6011 14.5782L19.6011 10.5782C19.933 10.2463 19.933 9.7081 19.6011 9.37616L15.6011 5.37616Z"
              fill="#6F6C90"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SideBar;
