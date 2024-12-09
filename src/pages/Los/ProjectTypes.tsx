import Header from "../../components/Header";
import SideBar from "../../components/SideBar";
import { useRef, useState, useEffect } from "react";
import { ResProjectType } from "../../assets/types/LosSites";
import {
  fetchProjectTypes,
  createProjectTypes,
  deleteProjectTypes,
} from "../../func/los/ProjectTypes";
import EmptyData from "../../components/EmptyData";
import { RotatingLines } from "react-loader-spinner";
import { useSnackbar } from "notistack";
import EditProjectType from "../../components/los/EditProjectType";
import { handleOpenDialog } from "../../func/openDialog";


const ProjectTypes = () => {
  const { enqueueSnackbar } = useSnackbar();

  const endOfPageRef = useRef<HTMLDivElement>(null);
  const editPopup = useRef<HTMLDialogElement>(null);

  const [projectTypes, setProjectTypes] = useState<ResProjectType[]>([]);
  const [leadingFetchPT, setLeadingFetchPT] = useState<boolean>(false);
  const [newPT, setNewPT] = useState("");
  const [createLoader, setCreateLoader] = useState<boolean>(false);
  const [deleteLoader, setDeleteLoader] = useState<boolean>(false);
  const [editedPT, setEditedPT] = useState<ResProjectType>();

  const scrollToBottom = () => {
    if (endOfPageRef.current) {
      endOfPageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  useEffect(() => {
    fetchProjectTypes(setProjectTypes, undefined, undefined, setLeadingFetchPT);
    return () => {};
  }, []);

  return (
    <div className="w-full flex md:h-[100vh]">
      <SideBar />
      <div className="lg:pl-[26px] md:pt-[32px] pt-[20px] lg:pr-[30px] sm:px-[30px] px-[15px] pb-[20px] flex flex-col gap-[26px] w-full md:h-[100vh] overflow-y-auto">
        <Header
          pageSentence="Here are all Projects types"
          searchBar={false}
          // wsUrl="search-account"
        />

        {leadingFetchPT ? (
          <div className="w-full py-6 flex items-center justify-center">
            <RotatingLines strokeColor="#4A3AFF" width="60" />
          </div>
        ) : projectTypes.length === 0 ? (
          <EmptyData data="projects types" />
        ) : (
          <>
            <div className="w-full flex items-center justify-between">
              <h1 className="font-semibold text-[22px] text-primary leading-8">
                Projects type
              </h1>
              <button
                onClick={scrollToBottom}
                className="self-end mb-4 rounded-[30px] bg-primary py-[10px] px-[20px] text-white text-[14px] font-medium hover:bg-primary-dark transition"
              >
                Scroll down
              </button>
            </div>

            <div className="rounded-[20px] border-[1px] border-n400 px-[32px] py-[20px] w-full">
              <div className="w-full flex items-center border-b-[1px] border-b-n300 py-4">
                <h6 className="text-[18px] text-n800 font-medium text-start">
                  Name{" "}
                </h6>
                <div className="flex-grow"></div>
                <h6 className="text-[18px] text-n800 font-medium w-[30%] text-center">
                  Actions{" "}
                </h6>
              </div>
              {projectTypes.map((project, index) => {
                return (
                  <div
                    key={index}
                    className="w-full flex items-center border-b-[1px] border-b-n300 py-6"
                  >
                    <input
                      type="text"
                      name={`project-${project.id}`}
                      id={`project-${project.id}`}
                      className={`text-n700 font-medium text-start`}
                      value={project.name}
                    />

                    <div className="flex-grow" />
                    <div className="flex items-center justify-center w-[30%] gap-[6px]">
                      <button
                        className="rounded-[15px] bg-[#DB2C2C1A] py-[6px] px-5 text-[#FF3B30] text-[12px] font-medium"
                        onClick={() => {
                          if (!deleteLoader) {
                            deleteProjectTypes(
                              project.id,
                              setProjectTypes,
                              setDeleteLoader,
                              (message, options) =>
                                enqueueSnackbar(message, { ...options })
                            );
                          }
                        }}
                      >
                        Delete
                      </button>
                      <button
                        className="rounded-[30px] bg-[#48C1B54D] py-[6px] px-5 text-[#23B4A6] text-[12px] font-medium"
                        onClick={() => {
                          setEditedPT(project);
                          handleOpenDialog(editPopup)
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="mt-8 w-full flex items-center gap-2">
                <input
                  type="text"
                  name="add-pt"
                  id="add-pt"
                  className="rounded-[29px] border-[2px] border-n300 px-5 py-3 flex-grow"
                  placeholder="Enter project type"
                  value={newPT}
                  onChange={(e) => {
                    setNewPT(e.target.value);
                  }}
                />
                <button
                  className={`flex items-center justify-center rounded-[30px] ${
                    newPT === "" ? "bg-n500 text-n300" : "bg-primary text-white"
                  }  py-[12px] px-[20px]  text-[14px] font-medium hover:bg-primary-dark transition`}
                  onClick={() => {
                    createProjectTypes(
                      newPT,
                      setNewPT,
                      setProjectTypes,
                      setCreateLoader
                    );
                  }}
                  disabled={newPT === ""}
                >
                  {createLoader ? (
                    <RotatingLines strokeColor="white" width="20" />
                  ) : (
                    " Add new type"
                  )}
                </button>
              </div>
            </div>
            {/* Add a reference to the bottom of the page */}
            <div ref={endOfPageRef} />
          </>
        )}
      </div>
      <EditProjectType ref={editPopup} editedPT={editedPT} setProjectTypes={setProjectTypes} />
    </div>
  );
};

export default ProjectTypes;