import Header from "../components/Header";
import SideBar from "../components/SideBar";
import Linechart from "../components/dashboard/Linechart";
import { projects } from "../assets/Projects";
import { useState } from "react";

const UsersPerformance = () => {
  const [openProjectTypeDropDown, setOpenProjectTypeDropDown] =
    useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<string>("Workorders");
  return (
    <div className="w-full flex h-[100vh]">
      <SideBar />
      <div className="lg:pl-[26px] lg:pr-[30px] sm:px-[30px] px-[15px] md:pt-[32px] pt-[20px] pb-[20px] flex flex-col gap-[26px] w-full md:h-[100vh] overflow-y-auto">
        <Header
          pageSentence="Here is info about users performance"
          searchBar={false}
        />
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
          <Linechart title="User performance"/>
        </div>
      </div>
    </div>
  );
};

export default UsersPerformance;
