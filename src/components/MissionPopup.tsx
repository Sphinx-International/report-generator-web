import {
  forwardRef,
  useState,
  ChangeEvent,
  FormEvent,
  MouseEvent,
} from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "../styles/PrioritySelector.css";
import { ReqMission } from "../assets/types/Mission";
import {
  validateForm1,
  validateForm2,
  FormErrors,
} from "../func/missionsValidation";
// import { formatFileSize } from "../func/formatFileSize";
import UploadingFile from "./uploadingFile";
import { RotatingLines } from "react-loader-spinner";
import { User } from "../assets/types/User";
import useWebSocketSearch from "../hooks/useWebSocketSearch";
import handleChange from "../func/handleChangeFormsInput";
const baseUrl = import.meta.env.VITE_BASE_URL;

interface MissionPopupProps {
  fetchWorkOrders?: () => void;
}

type PriorityIndex = 0 | 1 | 2 | 3;

const MissionPopup = forwardRef<HTMLDialogElement, MissionPopupProps>(
  (props, ref) => {
    const [currentSliderIndex, setCurrentSliderIndex] = useState<1 | 2>(1);

    const [searchQueryEng, setSearchQueryEng] = useState("");
    const [searchQueryCoord, setSearchQueryCoord] = useState("");

    const [searchEngs, setSearchEngs] = useState<User[]>([]);
    const [searchCoords, setSearchCoords] = useState<User[]>([]);

    const [selectedEng, setSelectedEng] = useState<string | null>(null);
    const [selectedCoord, setSelectedCoord] = useState<string[]>([]);

    const [isFocusedAssignInput, setIsFocusedAssignInput] = useState(false);
    const [isFocusedMailInput, setIsFocusedMailInput] = useState(false);

    const [loaderAssignSearch, setLoaderAssignSearch] = useState(false);
    const [loaderCoordSearch, setLoaderCoordSearch] = useState(false);

    const priorities = ["Low", "Medium", "High", "Urgent"];
    const [currentPriorityIndex, setCurrentPriorityIndex] = useState<
      0 | 1 | 2 | 3
    >(1);
    const [formValues, setformValues] = useState<ReqMission>({
      title: "",
      priority: 0,
      description: "",
      id: undefined,
      require_acceptence: false,
      emails: [],
      attachments: [],
    });

    const [isLoading, setIsLoading] = useState(false);

    const [formErrs, setFormErrs] = useState<FormErrors>({});
    const closeDialog = (
      eo: MouseEvent<HTMLButtonElement> | React.FormEvent
    ) => {
      eo.preventDefault();
      setformValues({
        title: "",
        priority: currentPriorityIndex,
        description: "",
        id: undefined,
        require_acceptence: false,
        emails: [],
        attachments: [],
      });
      setCurrentPriorityIndex(1);
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.close();
        ref.current.style.display = "none";
      }
    };

    const handleAddingFileChange = (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (file) {
        handle_chunck(file);
      }
    };

    const handleAddingFileChangeWithDragAndDrop = (files: FileList) => {
      if (files) {
        handle_chunck(files);
      }
    };

    const updateAttachmentProgress = (id: number, newProgress: number) => {
      setformValues((prevValues) => ({
        ...prevValues,
        attachments: prevValues.attachments.map((attachment) =>
          attachment.id === id
            ? { ...attachment, progress: newProgress }
            : attachment
        ),
      }));
    };

    const handleNextClick = () => {
      setCurrentPriorityIndex((prevIndex) => {
        const newIndex = (
          prevIndex === priorities.length - 1 ? 0 : prevIndex + 1
        ) as PriorityIndex;
        setformValues((prev) => ({ ...prev, priority: newIndex }));
        return newIndex;
      });
    };

    const handlePreviousClick = () => {
      setCurrentPriorityIndex((prevIndex) => {
        const newIndex = (
          prevIndex === 0 ? priorities.length - 1 : prevIndex - 1
        ) as PriorityIndex;
        setformValues((prev) => ({ ...prev, priority: newIndex }));
        return newIndex;
      });
    };

    const removeEng = () => {
      setSelectedEng(null);
      setformValues((prev) => ({
        ...prev,
        assigned_to: "",
      }));
    };
    const removeCoord = (deletedItem: string) => {
      setSelectedCoord((prev) => prev.filter((item) => item !== deletedItem));

      setformValues((prev) => ({
        ...prev,
        emails: prev.emails.filter((item) => item !== deletedItem),
      }));
    };

    const handleFocusMailedUsersInput = () => {
      setIsFocusedMailInput(true);
      setFormErrs((prev) => ({ ...prev, emails: "" }));
    };

    const handleCreateWorkorder = async (e: FormEvent) => {
      e.preventDefault();

      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const formData = new FormData();
      formData.append("title", formValues.title);
      formData.append(
        "id",
        formValues.id?.toString() || ""
      );
      formData.append("priority", formValues.priority.toString());
      formData.append("description", formValues.description);
      formData.append(
        "require_acceptence",
        formValues.require_acceptence.toString()
      );
      if (formValues.assigned_to) {
        formData.append("assigned_to", formValues.assigned_to);
      }

      formValues.emails.forEach((mail) => {
        formData.append("emails", mail);
      });

      if (formValues.attachments) {
        formValues.attachments.forEach((attach) => {
          formData.append("attachments", attach.id!.toString());
        });
      }

      setIsLoading(true);

      try {
        const response = await fetch(
          `http://${baseUrl}/workorder/create-workorder`,
          {
            method: "POST",
            headers: {
              Authorization: `Token ${token}`,
            },
            body: formData,
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Form submitted successfully", data);

          if (response.status === 200) {
            closeDialog(e);
          }
        } else {
          const errorData = await response.json();
          console.error("Error submitting form", errorData);
        }
      } catch (err) {
        console.error("Error submitting form", err);
      } finally {
        setIsLoading(false);
        props.fetchWorkOrders!();
        localStorage.setItem("selectedFilter", "all");
      }
    };

    const handleFirstSubmit = (
      e: FormEvent<HTMLFormElement> | MouseEvent<HTMLButtonElement>
    ) => {
      e.preventDefault();
      setFormErrs({});
      const formErrors = validateForm1(formValues);
      if (Object.keys(formErrors).length === 0) {
        setCurrentSliderIndex(2);
        setFormErrs({});
        // Handle form submission logic here
      } else {
        setFormErrs(formErrors);
      }
    };

    const handleSecondSubmit = (
      e: FormEvent<HTMLFormElement> | MouseEvent<HTMLButtonElement>
    ) => {
      e.preventDefault();
      setFormErrs({});
      const formErrors = validateForm2(formValues);

      if (Object.keys(formErrors).length === 0) {
        handleCreateWorkorder(e);
        setFormErrs({});
        // Handle form submission logic here
      } else {
        setFormErrs(formErrors);
      }
    };

    useWebSocketSearch({
      searchQuery: searchQueryEng,
      endpointPath: "engineer",
      setResults: setSearchEngs,
      setLoader: setLoaderAssignSearch,
    });

    useWebSocketSearch({
      searchQuery: searchQueryCoord,
      endpointPath: "coordinator",
      setResults: setSearchCoords,
      setLoader: setLoaderCoordSearch,
    });

    const uploadRemainingChunks = async (
      file: File,
      fileId: number,
      totalChunks: number
    ) => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const chunkSize = 512 * 1024; // 512 KB

      for (let index = 1; index < totalChunks; index++) {
        const start = index * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append("index", index.toString());
        formData.append("file", chunk, `${file.name}.part`);

        try {
          const response = await fetch(
            `http://${baseUrl}/file/upload-rest-chunks/${fileId}`,
            {
              method: "PUT",
              headers: {
                Authorization: `Token ${token}`,
              },
              body: formData,
            }
          );

          if (response.status === 200) {
            const progress = ((index + 1) / totalChunks) * 100;

            updateAttachmentProgress(fileId, Number(progress.toFixed(2)));
            console.log(
              `Chunk ${
                index + 1
              } of ${totalChunks} uploaded successfully. Progress: ${progress.toFixed(
                2
              )}%`
            );
          } else if (response.status === 201) {
            updateAttachmentProgress(fileId, 100.0);
            break;
          } else {
            console.error("Failed to upload chunk");
            break;
          }
        } catch (err) {
          console.error(`Error uploading chunk ${index + 1}:`, err);
          break;
        }
      }
    };

    const handle_chunck = async (file: File) => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const chunkSize = 512 * 1024; // 512 KB
      const fileSize = file.size; // File size in bytes

      const chunks = Math.ceil(fileSize / chunkSize);
      // Extract the first chunk
      const firstChunk = file.slice(0, chunkSize);
      const formData = new FormData();
      formData.append("name", file.name);
      formData.append("type", "1");
      formData.append("total_chunks", chunks.toString());
      formData.append("file", firstChunk, `${file.name}.part`);

      for (const pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      setIsLoading(true);

      try {
        const response = await fetch(
          `http://${baseUrl}/file/upload-first-chunk`,
          {
            method: "POST",
            headers: {
              Authorization: `Token ${token}`,
            },
            body: formData,
          }
        );

        if (response.ok) {
          const data = await response.json();
          const fileId = data.id;
          setformValues((prevFormValues) => ({
            ...prevFormValues,
            attachments: [
              ...(prevFormValues.attachments || []),
              { id: fileId, progress: chunks === 1 ? 100.00 : 0, file },
            ],
          }));
          setIsLoading(false);
          await uploadRemainingChunks(file, fileId, chunks);
        } else {
          console.error("Failed to upload first chunk");
        }
      } catch (err) {
        console.error("Error submitting first chunk", err);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <dialog
        ref={ref}
        id="Mission-popup"
        className={`hidden fixed z-30 top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] sm:px-[56px] sm:py-[43px] px-[20px] pt-[25px] pb-[20px] flex-col sm:items-end items-center gap-[35px] rounded-[34px] lg:w-[56vw] sm:w-[75vw] w-[90vw]`}
      >
        {currentSliderIndex === 1 ? (
          <form className="w-full flex flex-col gap-[30px]">
            <div className="flex items-center flex-col gap-[17.5px] w-full">
              
                <div className="flex flex-col sm:flex-row items-start gap-[17px] w-full">
                                    <div className="flex flex-col items-start gap-[8px] sm:w-[50%] w-full">
                    <label
                      htmlFor="id"
                      className="leading-[21px] font-medium ml-[9px] text-n700"
                    >
                      ID
                    </label>
                    <input
                      type="text"
                      name="id"
                      id="id"
                      value={formValues.id}
                      placeholder="Enter id"
                      className="rounded-[19px] h-[47px] border-[1px] border-n400 w-full px-[23px]"
                      onChange={(e) => {
                        handleChange(e, setformValues);
                      }}
                    />
                    {formErrs.id !== "" && formErrs.title !== undefined && (
                      <span className="ml-[12px] text-[14px] text-[#DB2C2C] leading-[22px]">
                        {formErrs.id}
                      </span>
                    )}
                  </div>


                  <div className="flex flex-col items-start gap-[8px] sm:w-[50%] w-full">
                    <label
                      htmlFor="title"
                      className="leading-[21px] font-medium ml-[9px] text-n700"
                    >
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={formValues.title}
                      placeholder="Enter title"
                      className="rounded-[19px] h-[47px] border-[1px] border-n400 w-full px-[23px]"
                      onChange={(e) => {
                        handleChange(e, setformValues);
                      }}
                    />
                    {formErrs.title !== "" && formErrs.title !== undefined && (
                      <span className="ml-[12px] text-[14px] text-[#DB2C2C] leading-[22px]">
                        {formErrs.title}
                      </span>
                    )}
                  </div>
                </div>
              

              <div className="flex flex-col items-start gap-[8px] w-full">
                <label
                  htmlFor="description"
                  className="leading-[21px] font-medium ml-[9px] text-n700"
                >
                  Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  value={formValues.description}
                  placeholder="Description"
                  className="rounded-[21px] border-[1px] border-n400 w-full p-[20px] h-[140px] max-h-[300px]"
                  onChange={(e) => {
                    handleChange(e, setformValues);
                  }}
                />
                {formErrs.description !== "" && (
                  <span className="ml-[12px] text-[14px] text-[#DB2C2C] leading-[22px]">
                    {formErrs.description}
                  </span>
                )}
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-start gap-[17px] w-full">
                <div className="flex flex-col items-start gap-[8px] sm:w-[50%] w-full">
                  <label
                    htmlFor="title"
                    className="leading-[21px] font-medium ml-[9px] text-n700"
                  >
                    Assigned to
                  </label>

                  {selectedEng ? (
                    <div className="flex items-center gap-[8px] w-full">
                      <div className="relative">
                        {" "}
                        <img
                          src="avatar.png"
                          alt="avatar"
                          className="w-[40px"
                        />
                        <span
                          className="absolute top-0 flex items-center justify-center w-full h-full text-white bg-550 opacity-0 hover:bg-opacity-40 z-50 hover:opacity-100 cursor-pointer rounded-[50%]"
                          onClick={removeEng}
                        >
                          🗙
                        </span>
                      </div>

                      <span className="text-550 text-[14px]">
                        {selectedEng}
                      </span>
                    </div>
                  ) : (
                    <div className="relative w-full">
                      <input
                        type="search"
                        name="assigned_to"
                        id="assigned_to"
                        value={searchQueryEng}
                        className="w-full rounded-[19px] border-[1px] h-[47px] border-n400  pl-[40px] pr-[12px] md:text-[15px] text-[13px] text-n600"
                        placeholder="Search members"
                        onChange={(e) => {
                          setSearchQueryEng(e.target.value);
                        }}
                        onFocus={() => setIsFocusedAssignInput(true)}
                      />
                      <svg
                        className="absolute left-[14px] top-[50%] translate-y-[-50%]"
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M11 2C15.97 2 20 6.03 20 11C20 15.97 15.97 20 11 20C6.03 20 2 15.97 2 11C2 7.5 4 4.46 6.93 2.97"
                          stroke="#6F6C8F"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M19.07 20.97C19.6 22.57 20.81 22.73 21.74 21.33C22.6 20.05 22.04 19 20.5 19C19.35 19 18.71 19.89 19.07 20.97Z"
                          stroke="#6F6C8F"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                      {isFocusedAssignInput && searchQueryEng !== "" && (
                        <div 
                        className="rounded-[20px] py-[18px] bg-white absolute w-full shadow-md flex flex-col gap-[12px] z-50"
                        style={{ top: '100%', left: 0 }}                        >
                          {loaderAssignSearch ? (
                            <div className="w-full py-[10px] px-[18px] flex items-center justify-center">
                              <RotatingLines
                                strokeWidth="4"
                                strokeColor="#4A3AFF"
                                width="20"
                              />
                            </div>
                          ) : searchEngs.length > 0 ? (
                            searchEngs.map((eng) => {
                              return (
                                <div
                                  className="flex items-center gap-[8px] px-[18px] w-full cursor-pointer hover:bg-slate-100"
                                  onClick={() => {
                                    setformValues((prev) => ({
                                      ...prev,
                                      assigned_to: eng.email,
                                    }));
                                    setSelectedEng(eng.email);
                                    setSearchQueryEng("");
                                  }}
                                >
                                  <img
                                    src="avatar.png"
                                    alt="avatar"
                                    className="w-[35px]"
                                  />
                                  <span className="text-n700 text-[14px]">
                                    {eng.email}
                                  </span>
                                </div>
                              );
                            })
                          ) : (
                            <span className="text-n700 w-full flex justify-center text-[14px]">
                              no result founded
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-start gap-[8px] sm:w-[50%] w-full">
                  <label
                    htmlFor="title"
                    className="leading-[21px] font-medium ml-[9px] text-n700"
                  >
                    Priority
                  </label>
                  <div className="w-full flex items-center gap-[11px]">
                    <svg
                      onClick={handlePreviousClick}
                      className="cursor-pointer hover:scale-105"
                      xmlns="http://www.w3.org/2000/svg"
                      width="13"
                      height="14"
                      viewBox="0 0 13 14"
                      fill="none"
                    >
                      <path
                        d="M11 2L3 7L11 12"
                        stroke={
                          currentPriorityIndex === 0
                            ? "#4A3AFF"
                            : currentPriorityIndex === 1
                            ? "#DB2C9F"
                            : currentPriorityIndex === 2
                            ? "#FFAA29"
                            : "#DB2C2C"
                        }
                        stroke-width="2.5"
                        stroke-linecap="round"
                      />
                    </svg>

                    <div
                      className={`flex-grow relative py-[16px] rounded-[100px] ${
                        currentPriorityIndex === 0
                          ? "bg-[#FEF6FF]"
                          : currentPriorityIndex === 1
                          ? "bg-[#FEF6FF]"
                          : currentPriorityIndex === 2
                          ? "bg-[#FFF8EC]"
                          : "bg-[#FFF5F3]"
                      }`}
                    >
                      <TransitionGroup>
                        <CSSTransition
                          key={priorities[currentPriorityIndex]}
                          timeout={300}
                          classNames="fade"
                        >
                          <span
                            className={`absolute top-[50%] translate-y-[-50%] inset-0 flex items-center justify-center font-medium leading-[15px] text-[10px] text-center ${
                              currentPriorityIndex === 0
                                ? "text-primary "
                                : currentPriorityIndex === 1
                                ? "text-[#DB2C9F]"
                                : currentPriorityIndex === 2
                                ? "text-[#FFAA29]"
                                : "text-[#DB2C2C]"
                            }`}
                          >
                            {priorities[currentPriorityIndex]}
                          </span>
                        </CSSTransition>
                      </TransitionGroup>
                    </div>

                    <svg
                      onClick={handleNextClick}
                      className="rotate-180 cursor-pointer hover:scale-105"
                      xmlns="http://www.w3.org/2000/svg"
                      width="13"
                      height="14"
                      viewBox="0 0 13 14"
                      fill="none"
                    >
                      <path
                        d="M11 2L3 7L11 12"
                        stroke={
                          currentPriorityIndex === 0
                            ? "#4A3AFF"
                            : currentPriorityIndex === 1
                            ? "#DB2C9F"
                            : currentPriorityIndex === 2
                            ? "#FFAA29"
                            : "#DB2C2C"
                        }
                        stroke-width="2.5"
                        stroke-linecap="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full flex flex-row-reverse items-center justify-between">
              <div className="flex items-center gap-[6px]">
                <button
                  className="text-n600 sm:px-[42px] px-[36px] sm:py-[10px] py-[7px] font-semibold rounded-[86px] border-[1px] border-n400 bg-n300 sm:text-[15px] text-[13px]"
                  onClick={(eo) => {
                    eo.preventDefault();
                    if (ref && typeof ref !== "function" && ref.current) {
                      ref.current.close();
                      ref.current.style.display = "none";
                    }
                  }}
                >
                  Cancel
                </button>
                <button
                  className="text-white sm:px-[42px] px-[36px] sm:py-[10px] py-[7px]  font-semibold rounded-[86px] bg-primary sm:text-[15px] text-[13px]"
                  onClick={(e) => {
                    handleFirstSubmit(e);
                  }}
                >
                  Next
                </button>
              </div>
              <div className="items-center gap-[7px] hidden sm:flex">
                <input
                  type="checkbox"
                  id="acceptance"
                  className="hidden peer"
                  checked={formValues.require_acceptence ? true : false}
                  onChange={(e) => {
                    setformValues((prev) => ({
                      ...prev,
                      require_acceptence: e.target.checked,
                    }));
                  }}
                />
                <label
                  htmlFor="acceptance"
                  className="w-[24px] h-[24px] rounded-full border-2 border-gray-400 peer-checked:bg-550 flex items-center justify-center cursor-pointer"
                >
                  <svg
                    className="text-white hidden"
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="10"
                    viewBox="0 0 12 10"
                    fill="none"
                  >
                    <path
                      d="M4 9.4L0 5.4L1.4 4L4 6.6L10.6 0L12 1.4L4 9.4Z"
                      fill="white"
                    />
                  </svg>
                </label>
                <label
                  htmlFor="acceptance"
                  className="text-550 text-[14px] leading-[20px] font-medium"
                >
                  Require acceptance
                </label>
              </div>
            </div>
          </form>
        ) : (
          <>
            <div className="flex items-start flex-col gap-[20px] w-full">
              <div className="flex flex-col items-start gap-[8px] w-[100%]">
                <label
                  htmlFor="mailed_users"
                  className="leading-[21px] font-medium ml-[9px] text-n700"
                >
                  Mailed users
                </label>
                <div className="relative w-full">
                  <input
                    type="search"
                    name="mailed_users"
                    id=""
                    value={searchQueryCoord}
                    className="w-full rounded-[19px] border-[1px] h-[47px] border-n400  pl-[40px] pr-[12px] md:text-[15px] text-[13px] text-n600"
                    placeholder="Search members"
                    onChange={(e) => {
                      setSearchQueryCoord(e.target.value);
                    }}
                    onFocus={handleFocusMailedUsersInput}
                  />
                  <svg
                    className="absolute left-[14px] top-[50%] translate-y-[-50%]"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M11 2C15.97 2 20 6.03 20 11C20 15.97 15.97 20 11 20C6.03 20 2 15.97 2 11C2 7.5 4 4.46 6.93 2.97"
                      stroke="#6F6C8F"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M19.07 20.97C19.6 22.57 20.81 22.73 21.74 21.33C22.6 20.05 22.04 19 20.5 19C19.35 19 18.71 19.89 19.07 20.97Z"
                      stroke="#6F6C8F"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>

                  {isFocusedMailInput && searchQueryCoord !== "" && (
                    <div className="rounded-[20px] py-[18px] z-50 bg-white absolute w-full shadow-md flex flex-col gap-[12px]">
                      {loaderCoordSearch ? (
                        <div className="w-full px-[18px] py-[10px] flex items-center justify-center">
                          <RotatingLines
                            strokeWidth="4"
                            strokeColor="#4A3AFF"
                            width="20"
                          />
                        </div>
                      ) : searchCoords.length > 0 ? (
                        searchCoords.map((coord) => {
                          return (
                            <div
                              className="flex items-center px-[18px] gap-[8px] w-full cursor-pointer hover:bg-slate-100"
                              onClick={() => {
                                setformValues((prev) => {
                                  if (!prev.emails.includes(coord.email)) {
                                    return {
                                      ...prev,
                                      emails: [...prev.emails, coord.email],
                                    };
                                  }
                                  return prev;
                                });
                                setSelectedCoord((prev) => {
                                  if (!prev.includes(coord.email)) {
                                    return [...prev, coord.email];
                                  }
                                  return prev;
                                });
                                setSearchQueryCoord("");
                              }}
                            >
                              <img
                                src="avatar.png"
                                alt="avatar"
                                className="w-[35px]"
                              />
                              <span className="text-n700 text-[14px]">
                                {coord.email}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <span className="text-n700 w-full flex justify-center text-[14px]">
                          no result founded
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {formErrs.emails !== "" && formErrs.emails !== undefined ? (
                  <span className="ml-[12px] text-[14px] text-[#DB2C2C] leading-[22px]">
                    {formErrs.emails}
                  </span>
                ) : (
                  selectedCoord && (
                    <div className="flex items-center gap-[5px] pl-4">
                      {selectedCoord.map((coord, index) => {
                        return (
                          <div className="relative group" key={index}>
                            <img
                              src="avatar1.png"
                              alt="avatar"
                              className="w-[35px]"
                            />
                            <span
                              className="absolute top-0 flex items-center justify-center w-full h-full text-white bg-550 opacity-0 hover:bg-opacity-40 z-50 hover:opacity-100 cursor-pointer rounded-[50%]"
                              onClick={() => {
                                removeCoord(coord);
                              }}
                            >
                              🗙
                            </span>
                            {/* Tooltip */}
                            <div className="absolute left-[%65] transform -translate-x-1/3 bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 z-60">
                              {coord}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                )}
              </div>

              <div
                className="flex flex-col items-start gap-[8px] w-[100%]"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const files = e.dataTransfer.files;
                  // Add the files to the input element
                  handleAddingFileChangeWithDragAndDrop(files);
                }}
              >
                <label
                  htmlFor="attachement"
                  className="leading-[21px] font-medium ml-[9px] text-n700 "
                >
                  Attachement
                </label>
                <input
                  type="file"
                  name="attachement"
                  id="attachement"
                  onChange={handleAddingFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="attachement"
                  className="cursor-pointer w-full py-[40px] flex flex-col items-center justify-center gap-[21.5px] border-dashed border-[2px] border-n400 rounded-[15px]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="22"
                    viewBox="0 0 18 22"
                    fill="none"
                  >
                    <path
                      opacity="0.2"
                      d="M17.125 4.91406V16.2891C17.125 16.5046 17.0394 16.7112 16.887 16.8636C16.7347 17.016 16.528 17.1016 16.3125 17.1016H13.875V8.16406L9.8125 4.10156H4.125V1.66406C4.125 1.44857 4.2106 1.24191 4.36298 1.08954C4.51535 0.937165 4.72201 0.851562 4.9375 0.851562H13.0625L17.125 4.91406Z"
                      fill="#6F6C8F"
                    />
                    <path
                      d="M17.6998 4.33922L13.6373 0.276719C13.5618 0.201291 13.4722 0.14148 13.3736 0.100702C13.2749 0.0599241 13.1692 0.0389788 13.0625 0.0390628H4.9375C4.50652 0.0390628 4.0932 0.210268 3.78845 0.515014C3.48371 0.819761 3.3125 1.23309 3.3125 1.66406V3.28906H1.6875C1.25652 3.28906 0.843198 3.46027 0.538451 3.76501C0.233705 4.06976 0.0625 4.48309 0.0625 4.91406V19.5391C0.0625 19.97 0.233705 20.3834 0.538451 20.6881C0.843198 20.9929 1.25652 21.1641 1.6875 21.1641H13.0625C13.4935 21.1641 13.9068 20.9929 14.2115 20.6881C14.5163 20.3834 14.6875 19.97 14.6875 19.5391V17.9141H16.3125C16.7435 17.9141 17.1568 17.7429 17.4615 17.4381C17.7663 17.1334 17.9375 16.72 17.9375 16.2891V4.91406C17.9376 4.80733 17.9166 4.70163 17.8759 4.603C17.8351 4.50436 17.7753 4.41473 17.6998 4.33922ZM13.0625 19.5391H1.6875V4.91406H9.47633L13.0625 8.50023V19.5391ZM16.3125 16.2891H14.6875V8.16406C14.6876 8.05733 14.6666 7.95163 14.6259 7.853C14.5851 7.75436 14.5253 7.66473 14.4498 7.58922L10.3873 3.52672C10.3118 3.45129 10.2222 3.39148 10.1236 3.3507C10.0249 3.30992 9.91923 3.28898 9.8125 3.28906H4.9375V1.66406H12.7263L16.3125 5.25023V16.2891ZM10.625 13.0391C10.625 13.2546 10.5394 13.4612 10.387 13.6136C10.2347 13.766 10.028 13.8516 9.8125 13.8516H4.9375C4.72201 13.8516 4.51535 13.766 4.36298 13.6136C4.2106 13.4612 4.125 13.2546 4.125 13.0391C4.125 12.8236 4.2106 12.6169 4.36298 12.4645C4.51535 12.3122 4.72201 12.2266 4.9375 12.2266H9.8125C10.028 12.2266 10.2347 12.3122 10.387 12.4645C10.5394 12.6169 10.625 12.8236 10.625 13.0391ZM10.625 16.2891C10.625 16.5046 10.5394 16.7112 10.387 16.8636C10.2347 17.016 10.028 17.1016 9.8125 17.1016H4.9375C4.72201 17.1016 4.51535 17.016 4.36298 16.8636C4.2106 16.7112 4.125 16.5046 4.125 16.2891C4.125 16.0736 4.2106 15.8669 4.36298 15.7145C4.51535 15.5622 4.72201 15.4766 4.9375 15.4766H9.8125C10.028 15.4766 10.2347 15.5622 10.387 15.7145C10.5394 15.8669 10.625 16.0736 10.625 16.2891Z"
                      fill="#6F6C8F"
                    />
                  </svg>
                  <span className="text-[13px] text-n600 font-medium leading-[13px]">
                    Drag & drop your files here or{" "}
                    <span className="text-primary">chooses files</span>
                  </span>
                </label>
              </div>
              {formValues.attachments !== undefined
                ? formValues.attachments?.length > 0 && (
                    <div className="w-full flex flex-col gap-[12px]">
                      {formValues.attachments.map((file, index) => {
                        console.log(file)
                        return (
                        <UploadingFile key={index} file={file.file} progress={file.progress}/>
                        );
                      })}
                    </div>
                  )
                : null}

              <div className="items-center gap-[7px] sm:hidden flex">
                <input
                  type="checkbox"
                  id="acceptance"
                  className="hidden peer"
                  checked={formValues.require_acceptence ? true : false}
                  onChange={(e) => {
                    setformValues((prev) => ({
                      ...prev,
                      require_acceptence: e.target.checked,
                    }));
                  }}
                />
                <label
                  htmlFor="acceptance"
                  className="w-[24px] h-[24px] rounded-full border-2 border-gray-400 peer-checked:bg-550 flex items-center justify-center cursor-pointer"
                >
                  <svg
                    className="text-white hidden"
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="10"
                    viewBox="0 0 12 10"
                    fill="none"
                  >
                    <path
                      d="M4 9.4L0 5.4L1.4 4L4 6.6L10.6 0L12 1.4L4 9.4Z"
                      fill="white"
                    />
                  </svg>
                </label>
                <label
                  htmlFor="acceptance"
                  className="text-550 text-[14px] leading-[20px] font-medium"
                >
                  Require acceptance
                </label>
              </div>
            </div>

            <div className="flex items-center gap-[6px]">
              <button
                className="text-n600 sm:px-[42px] px-[36px] sm:py-[10px] py-[7px] font-semibold rounded-[86px] border-[1px] border-n400 bg-n300 sm:text-[15px] text-[13px]"
                onClick={() => {
                  setCurrentSliderIndex(1);
                }}
              >
                Previous
              </button>
              <button
                className={`text-white sm:px-[42px] px-[36px] sm:py-[10px] py-[7px]  font-semibold rounded-[86px] sm:text-[15px] text-[13px] ${
                  isLoading ? "bg-n600 cursor-not-allowed" : "bg-primary"
                }`}
                onClick={(e) => {
                  handleSecondSubmit(e);
                }}
                disabled={isLoading ? true : false}
              >
                {isLoading ? (
                  <RotatingLines strokeColor="white" width="22.5" />
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
          </>
        )}
      </dialog>
    );
  }
);

export default MissionPopup;
