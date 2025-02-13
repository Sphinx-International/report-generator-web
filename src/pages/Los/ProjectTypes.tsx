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
import { getRole } from "../../func/getUserRole";

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
              <h1 className="font-semibold sm:text-[22px] text-[18px] text-primary leading-8">
                Projects type
              </h1>
              <button
                onClick={scrollToBottom}
                className="self-end mb-4 rounded-[30px] bg-primary sm:py-[10px] py-[6px] px-[15px] sm:px-[20px] text-white text-[14px] font-medium hover:bg-primary-dark transition"
              >
                Scroll down
              </button>
            </div>

            <div className="rounded-[20px] border-[1px] border-n400 px-[24px] sm:px-[32px] py-[20px] w-full">
              <div className="w-full flex items-center border-b-[1px] border-b-n300 py-4">
                <h6 className="sm:text-[18px] text-[14px] text-n800 font-medium text-start">
                  Name{" "}
                </h6>
                <div className="flex-grow"></div>
                <h6 className="sm:text-[18px] text-[14px] text-n800 font-medium w-[30%] text-center">
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
                      className={`text-n700 font-medium text-start sm:text-[16px] text-[14px] w-[60%] overflow-hidden text-ellipsis`}
                      value={project.name}
                    />

                    <div className="flex-grow" />
                    <div className="flex items-center justify-center w-[30%] gap-[6px]">
                      <button
                        className={`rounded-[15px] py-[6px] sm:px-5 px-3 text-[12px] font-medium ${[0, 1, 2].includes(getRole()!) ? "text-[#FF3B30] bg-[#DB2C2C1A]" :"text-[#9e9e9e] bg-[#e9e8e8] cursor-not-allowed"}`}
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
                        disabled={![0, 1, 2].includes(getRole()!)}
                      >
                        Delete
                      </button>
                      <button
                        className={`rounded-[30px] py-[6px] sm:px-5 px-3  text-[12px] font-medium ${[0, 1, 2].includes(getRole()!) ? "text-[#23b4a6] bg-[#48C1B54D]" :"text-[#9e9e9e] bg-[#e9e8e8] cursor-not-allowed"}`}
                        onClick={() => {
                          setEditedPT(project);
                          handleOpenDialog(editPopup);
                        }}
                        disabled={![0, 1, 2].includes(getRole()!)}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })}

             {[0, 1, 2].includes(getRole()!) && <div className="mt-8 w-full flex items-center gap-2 flex-wrap">
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
                  }  py-[12px] px-[20px]  text-[14px] font-medium hover:bg-primary-dark transition sm:flex-grow-0  flex-grow`}
                  onClick={() => {
                    createProjectTypes(
                      newPT,
                      setNewPT,
                      setProjectTypes,
                      setCreateLoader,
                      (message, options) =>
                        enqueueSnackbar(message, { ...options })
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
              </div>}
            </div>
            {/* Add a reference to the bottom of the page */}
            <div ref={endOfPageRef} />
          </>
        )}
      </div>
      <EditProjectType
        ref={editPopup}
        editedPT={editedPT}
        setProjectTypes={setProjectTypes}
      />
    </div>
  );
};

export default ProjectTypes;
