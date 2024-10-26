import Header from "../components/Header";
import SideBar from "../components/SideBar";
import Linechart from "../components/dashboard/Linechart";
import { projects } from "../assets/Projects";
import { useState } from "react";
import { User } from "../assets/types/User";
import { RotatingLines } from "react-loader-spinner";
import useWebSocketSearch from "../hooks/useWebSocketSearch";

const UsersPerformance = () => {
  const [openProjectTypeDropDown, setOpenProjectTypeDropDown] =
    useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<string>("Workorders");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<User[]>([]);
  const [loaderSearch, setLoaderSearch] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useWebSocketSearch({
    searchQuery: searchQuery,
    endpointPath: "search-account",
    setResults: setSearchResult,
    setLoader: setLoaderSearch,
  });

  return (
    <div className="w-full flex h-[100vh]">
      <SideBar />
      <div className="lg:pl-[26px] lg:pr-[30px] sm:px-[30px] px-[15px] md:pt-[32px] pt-[20px] pb-[20px] flex flex-col gap-[26px] w-full md:h-[100vh] overflow-y-auto">
        <Header
          pageSentence="Here is info about users performance"
          searchBar={false}
        />

        <div className="md:mr-[16px] relative">
          <input
            type="search"
            name=""
            id=""
            className="w-full h-[44px] rounded-[40px] border-[1px] border-n300 shadow-md md:px-[54px] pl-[54px] pr-[15px] md:text-[14px] text-[12px]"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
          />
          <svg
            className="absolute left-[20px] top-[50%] translate-y-[-50%]"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M11 2C15.97 2 20 6.03 20 11C20 15.97 15.97 20 11 20C6.03 20 2 15.97 2 11C2 7.5 4 4.46 6.93 2.97"
              stroke="#6F6C8F"
              strokeWidth="1.5"
              fillOpacity="round"
              strokeLinejoin="round"
            />
            <path
              d="M19.07 20.97C19.6 22.57 20.81 22.73 21.74 21.33C22.6 20.05 22.04 19 20.5 19C19.35 19 18.71 19.89 19.07 20.97Z"
              stroke="#6F6C8F"
              strokeWidth="1.5"
              fillOpacity="round"
              strokeLinejoin="round"
            />
          </svg>
          {searchQuery !== "" && (
            <div className="bg-white rounded-[20px] flex flex-col items-start gap-2 shadow-xl shadow-slate-300 py-3 w-full absolute ">
              {loaderSearch ? (
                <div className="flex items-center justify-center w-full">
                  <RotatingLines strokeColor="#4A3AFF" width="20" />
                </div>
              ) : (
                searchResult !== null &&
                (searchResult.length > 0 ? (
                  searchResult.map((user: User, index) => {
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-start w-full px-3 gap-2 cursor-pointer hover:bg-slate-200"
                        onClick={() => {
                          setSelectedUser(user);
                          setSearchQuery("");
                        }}
                      >
                        <img
                          src="/avatar.png"
                          alt="avatar"
                          className="rounded-[50%] w-[32px]"
                        />
                        <span className="text-n700 font-medium">
                          {" "}
                          {user.email} ({user.first_name} {user.last_name})
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full py-1 flex items-center justify-center text-n700 font-medium">
                    no users founded . . .
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col w-full gap-6 items-start">
          <div className="flex w-full justify-between items-center">
            <h1 className="text-primary font-semibold sm:text-[23px] text-[18px]">
              Dashboard
            </h1>
            <div className="relative">
              <svg
                onClick={() => {
                  setOpenProjectTypeDropDown(!openProjectTypeDropDown);
                }}
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="11"
                viewBox="0 0 18 11"
                fill="none"
                className="cursor-pointer"
              >
                <path
                  d="M18 1.99961L16.5 0.599609L9 7.99961L1.5 0.599609L0 1.99961L9 10.9996L18 1.99961Z"
                  fill="#666666"
                />
              </svg>
              {openProjectTypeDropDown && (
                <div className="absolute right-0 z-40 rounded-[15px] py-6 shadow-lg shadow-slate-300 bg-white flex flex-col items-start gap-4">
                  <h6 className="sm:text-[20px] text-[18px] text-n800 leading-[31px] font-semibold px-6">
                    Type
                  </h6>
                  <div className="flex flex-col items-start gap-1">
                    {projects.map((project, index) => {
                      return (
                        <span
                          key={index}
                          className={`sm:text-[17px] text-n600 font-medium text-nowrap py-1 px-6 hover:bg-slate-200 cursor-pointer w-full ${
                            selectedProject === project && "text-primary"
                          }`}
                          onClick={() => {
                            setSelectedProject(project);
                            setOpenProjectTypeDropDown(false);
                          }}
                        >
                          {project}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
          {selectedUser ? (
            <Linechart title="User performance" user={selectedUser}/>
          ) : (
            <div className="w-full lg:px-7 pr-5 py-10 border-[1px] border-[#E6EDFF] rounded-[20px] text-n600 font-medium text-[18px]">
              Search for a user first . . . 🔍
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersPerformance;
