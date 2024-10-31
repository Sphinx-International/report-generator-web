import {
  forwardRef,
  useState,
  ChangeEvent,
  FormEvent,
  MouseEvent,
} from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "../../styles/PrioritySelector.css";
import { ReqModernisation } from "../../assets/types/Modernisation";
import {
  validateModernisationForm1,
  validateModernisationForm2,
  ModernisationFormErrors,
} from "../../func/missionsValidation";
// import { formatFileSize } from "../func/formatFileSize";
import UploadingFile from "./../uploadingFile";
import { RotatingLines } from "react-loader-spinner";
import { User } from "../../assets/types/User";
import useWebSocketSearch from "../../hooks/useWebSocketSearch";
import handleChange from "../../func/handleChangeFormsInput";
import {
  addUploadingFile,
  updateFileProgress,
  removeUploadingFile,
} from "../../Redux/slices/uploadingFilesSlice";
import { addUploadedAttachOnCreation } from "../../Redux/slices/uploadAttachOnCreation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../Redux/store";
import {
  generateFileToken,
  storeFileInIndexedDB,
  deleteFileFromIndexedDB,
} from "../../func/generateFileToken";
import { fetchGroupMembers } from "../../func/groupsApi";

const baseUrl = import.meta.env.VITE_BASE_URL;

interface MissionPopupProps {
  fetchModernisations?: () => void;
}

type PriorityIndex = 0 | 1 | 2 | 3;

const ModernisationPopup = forwardRef<HTMLDialogElement, MissionPopupProps>(
  (props, ref) => {
    const dispatch = useDispatch<AppDispatch>();

    const [currentSliderIndex, setCurrentSliderIndex] = useState<1 | 2>(1);

    const [searchQueryEng, setSearchQueryEng] = useState("");
    const [searchQueryCoord, setSearchQueryCoord] = useState("");

    const [typeOfSearchForCoord, setTypeOfSearchForCoord] = useState<
      "Emails" | "Groupes"
    >("Emails");
    const [typeOfSearchPopupVisible, setTypeOfSearchPopupVisible] =
      useState<boolean>(false);

    const [searchEngs, setSearchEngs] = useState<User[]>([]);
    const [searchCoords, setSearchCoords] = useState<
      { email: string; id: number; name: string }[]
    >([]);

    const [selectedEng, setSelectedEng] = useState<string | null>(null);
    const [selectedCoord, setSelectedCoord] = useState<string[]>([]);

    const [isFocusedAssignInput, setIsFocusedAssignInput] = useState(false);
    const [isFocusedMailInput, setIsFocusedMailInput] = useState(false);

    const [loaderAssignSearch, setLoaderAssignSearch] = useState(false);
    const [loaderCoordSearch, setLoaderCoordSearch] = useState(false);

    const [loaderGettingGroupMembers, setLoaderGettingGroupMembers] =
      useState(false);

    const priorities = ["Low", "Medium", "High", "Urgent"];
    const [currentPriorityIndex, setCurrentPriorityIndex] = useState<
      0 | 1 | 2 | 3
    >(1);
    const [formValues, setformValues] = useState<ReqModernisation>({
      title: "",
      priority: 0,
      description: "",
      require_return_voucher: false,
      emails: [],
      attachments: [],
    });

    const [isLoading, setIsLoading] = useState(false);

    const [formErrs, setFormErrs] = useState<ModernisationFormErrors>({});

    const closeDialog = (
      eo: MouseEvent<HTMLButtonElement> | React.FormEvent
    ) => {
      eo.preventDefault();
      setformValues({
        title: "",
        priority: currentPriorityIndex,
        description: "",
        require_return_voucher: false,
        emails: [],
        attachments: [],
      });
      setCurrentPriorityIndex(1);
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.close();
        ref.current.style.display = "none";
      }
    };

    const handleAddingFileChange = async (
      event: ChangeEvent<HTMLInputElement>
    ) => {
      const file = event.target.files?.[0];

      if (file) {
        if (file.size > 20 * 1024 * 1024) {
          alert(`${file.name} exceeds the 20MB limit.`);
        } else if (file.size <= 32 * 1024) {
          handle_files_with_one_chunk(file);
        } else {
          const file_token = await generateFileToken(file);
          handle_chunck(file, file_token);
        }
      }
    };

    const handleAddingFileChangeWithDragAndDrop = async (files: FileList) => {
      if (files) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const file_token = await generateFileToken(file);
          handle_chunck(file, file_token);
        }
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
        assigned_to: null,
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

    const handleFirstSubmit = (
      e: FormEvent<HTMLFormElement> | MouseEvent<HTMLButtonElement>
    ) => {
      e.preventDefault();
      setFormErrs({});
      const formErrors = validateModernisationForm1(formValues);
      if (Object.keys(formErrors).length === 0) {
        setCurrentSliderIndex(2);
        setFormErrs({});
        // Handle form submission logic here
      } else {
        setFormErrs(formErrors);
      }
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
      formData.append("priority", formValues.priority.toString());
      formData.append("description", formValues.description);
      formData.append(
        "require_return_voucher",
        formValues.require_return_voucher.toString()
      );
      if (formValues.assigned_to) {
        formData.append("assigned_to", formValues.assigned_to.id.toString());
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
          `${baseUrl}/modernisation/create-modernisation`,
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
        props.fetchModernisations!();
        localStorage.setItem("selectedFilterForWorkorders", "all");
      }
    };

    const handleSecondSubmit = (
      e: FormEvent<HTMLFormElement> | MouseEvent<HTMLButtonElement>
    ) => {
      e.preventDefault();
      setFormErrs({});
      const formErrors = validateModernisationForm2(formValues);

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
      endpointPath: "search-account/engineer",
      setResults: setSearchEngs,
      setLoader: setLoaderAssignSearch,
    });

    useWebSocketSearch({
      searchQuery: searchQueryCoord,
      endpointPath:
        typeOfSearchForCoord === "Emails" ? "search-mail" : "search-group",
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
      const startOffset = 32 * 1024; // Start uploading from 32KB onwards

      for (let index = 1; index < totalChunks; index++) {
        const start = startOffset + (index - 1) * chunkSize; // Adjust to skip first chunk
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append("index", index.toString());
        formData.append("file", chunk, `${file.name}.part`);

        try {
          const response = await fetch(
            `${baseUrl}/file/upload-rest-chunks/${fileId}`,
            {
              method: "PUT",
              headers: {
                Authorization: `Token ${token}`,
              },
              body: formData,
            }
          );

          switch (response.status) {
            case 200: {
              const progress = ((index + 1) / totalChunks) * 100;
              dispatch(
                updateFileProgress({ type: "attachements", fileId, progress })
              );
              updateAttachmentProgress(fileId, Number(progress.toFixed(2)));
              break;
            }
            case 201:
              dispatch(
                updateFileProgress({
                  type: "attachements",
                  fileId,
                  progress: 100.0,
                })
              );
              deleteFileFromIndexedDB(fileId);
              updateAttachmentProgress(fileId, 100.0);
              break;

            case 404:
              setformValues((prevValues) => ({
                ...prevValues,
                attachments: prevValues.attachments.filter(
                  (attachment) => attachment.id !== fileId
                ),
              }));
              return;

            default:
              console.error("Failed to upload chunk");
              break;
          }
        } catch (err) {
          console.error(`Error uploading chunk ${index + 1}:`, err);
          break;
        }
      }
    };

    const handle_chunck = async (file: File, file_token: string) => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const firstChunkSize = 32 * 1024; // 32 KB
      const chunkSize = 512 * 1024; // 512 KB for subsequent chunks
      const fileSize = file.size;

      // Calculate total number of chunks, ensuring we handle small files correctly
      const chunks =
        fileSize <= firstChunkSize
          ? 1 // If file is smaller than or equal to 32 KB, it's just 1 chunk
          : fileSize <= chunkSize
          ? 2 // If file is between 32 KB and 512 KB, there will be 2 chunks: the first 32 KB and the remainder
          : Math.ceil((fileSize - firstChunkSize) / chunkSize) + 1; // For larger files, more chunks

      // Extract the first 32KB chunk
      const firstChunk = file.slice(0, firstChunkSize);

      const formData = new FormData();
      formData.append("name", file.name);
      formData.append("type", "1");
      formData.append("total_chunks", chunks.toString());
      formData.append("file", firstChunk, `${file.name}.part`);
      formData.append("file_token", file_token);

      setIsLoading(true);

      try {
        const response = await fetch(`${baseUrl}/file/upload-first-chunk`, {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
          },
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          const fileId = data.id;
          // storeFileInIndexedDB(file, fileId, "attachements", formValues.id);
          setformValues((prevFormValues) => ({
            ...prevFormValues,
            attachments: [
              ...(prevFormValues.attachments || []),
              { id: fileId, progress: chunks === 1 ? 100.0 : 0, file },
            ],
          }));
          dispatch(
            addUploadingFile({
              type: "attachements",
              file: { id: fileId, progress: 0, file },
            })
          );
          setIsLoading(false);

          // Upload remaining chunks if the file has more than 32 KB
          if (chunks > 1) {
            await uploadRemainingChunks(file, fileId, chunks);
          }

          dispatch(removeUploadingFile({ type: "attachements", fileId }));
          /* dispatch(
            addUploadedAttachOnCreation({
              id: fileId,
              file_name: file.name,
              workorder: formValues.id!,
            })  
          ); */
        } else {
          console.error("Failed to upload first chunk");
        }
      } catch (err) {
        console.error("Error submitting first chunk", err);
      } finally {
        setIsLoading(false);
      }
    };

    const handle_files_with_one_chunk = async (file: File) => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }
      const formData = new FormData();
      formData.append("name", file.name);
      formData.append("type", "1");
      formData.append("file", file);

      for (const pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      setIsLoading(true);

      try {
        const response = await fetch(`${baseUrl}/file/upload-file`, {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
          },
          body: formData,
        });
        console.log(response.status);
        if (response.ok) {
          const data = await response.json();
          const fileId = data.id;

          setformValues((prevFormValues) => ({
            ...prevFormValues,
            attachments: [
              ...(prevFormValues.attachments || []),
              { id: fileId, progress: 100.0, file },
            ],
          }));
          dispatch(
            updateFileProgress({
              type: "attachements",
              fileId,
              progress: 100.0,
            })
          );
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
        className={`hidden fixed z-30 top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] sm:px-[56px] sm:py-[43px] px-[20px] pt-[25px] pb-[20px] flex-col sm:items-end items-center gap-[35px] rounded-[34px] lg:w-[56vw] sm:w-[75vw] w-[90vw] overflow-y-visible`}
      >
        {currentSliderIndex === 1 ? (
          <form className="w-full flex flex-col gap-[30px]">
            <div className="flex items-center flex-col gap-[17.5px] w-full">
              <div className="flex flex-col sm:flex-row items-start gap-[17px] w-full">
                <div className="flex flex-col items-start gap-[8px] w-full">
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
                          className="absolute top-0 flex items-center justify-center w-full h-full text-white bg-550 opacity-0 hover:bg-opacity-40 z-30 hover:opacity-100 cursor-pointer rounded-[50%]"
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
                      {isFocusedAssignInput && searchQueryEng !== "" && (
                        <div
                          className="rounded-[20px] py-[18px] bg-white absolute w-full shadow-md flex flex-col gap-[12px] z-50 overflow-auto"
                          style={{ top: "100%", left: 0 }}
                        >
                          {loaderAssignSearch ? (
                            <div className="w-full py-[10px] px-[18px] flex items-center justify-center">
                              <RotatingLines
                                strokeWidth="4"
                                strokeColor="#4A3AFF"
                                width="20"
                              />
                            </div>
                          ) : searchEngs !== null && searchEngs.length > 0 ? (
                            searchEngs.map((eng) => {
                              return (
                                <div
                                  key={eng.id}
                                  className="flex items-center gap-[8px] px-[18px] w-full cursor-pointer hover:bg-slate-100"
                                  onClick={() => {
                                    setformValues((prev) => ({
                                      ...prev,
                                      assigned_to: eng,
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
                                  <div className="flex flex-col items-start">
                                    <span className="text-n700 text-[14px]">
                                      {eng.email}
                                    </span>
                                    <span
                                      className={`text-[12px] font-medium leading-[18px] ${
                                        eng.is_active
                                          ? "text-[#23B4A6]"
                                          : "text-[#DB2C2C]"
                                      }`}
                                    >
                                      {eng.is_active ? "active" : "banned"}
                                    </span>
                                  </div>
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
                    htmlFor="priority"
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
                        strokeWidth="2.5"
                        fillOpacity="round"
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
                        strokeWidth="2.5"
                        fillOpacity="round"
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

              <div className="items-center gap-[7px] hidden md:flex">
                  <input
                    type="checkbox"
                    id="return-voucher"
                    className="hidden peer"
                    checked={formValues.require_return_voucher ? true : false}
                    onChange={(e) => {
                      setformValues((prev) => ({
                        ...prev,
                        require_return_voucher: e.target.checked,
                      }));
                    }}
                  />
                  <label
                    htmlFor="return-voucher"
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
                    htmlFor="return-voucher"
                    className="text-550 text-[14px] leading-[20px] font-medium"
                  >
                    Require Return voucher
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
                  <div
                    className="absolute right-1 top-[50%] translate-y-[-50%] z-50 flex items-center gap-2 cursor-pointer sm:border-[2px] sm:border-n500 rounded-[15px] p-[6px]"
                    onClick={() => {
                      setTypeOfSearchPopupVisible(!typeOfSearchPopupVisible);
                    }}
                  >
                    <span className="text-n500 text-[14px] sm:flex hidden">
                      {typeOfSearchForCoord === "Groupes"
                        ? "Search by Groups"
                        : "Search by Emails"}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="16"
                      viewBox="0 0 18 16"
                      fill="none"
                    >
                      <path
                        d="M16.7077 8.00023H6.41185M2.77768 8.00023H1.29102M2.77768 8.00023C2.77768 7.51842 2.96908 7.05635 3.30977 6.71566C3.65046 6.37497 4.11254 6.18357 4.59435 6.18357C5.07616 6.18357 5.53824 6.37497 5.87893 6.71566C6.21962 7.05635 6.41102 7.51842 6.41102 8.00023C6.41102 8.48204 6.21962 8.94412 5.87893 9.28481C5.53824 9.6255 5.07616 9.8169 4.59435 9.8169C4.11254 9.8169 3.65046 9.6255 3.30977 9.28481C2.96908 8.94412 2.77768 8.48204 2.77768 8.00023ZM16.7077 13.5061H11.9177M11.9177 13.5061C11.9177 13.988 11.7258 14.4506 11.3851 14.7914C11.0443 15.1321 10.5821 15.3236 10.1002 15.3236C9.61837 15.3236 9.1563 15.1313 8.81561 14.7906C8.47491 14.45 8.28352 13.9879 8.28352 13.5061M11.9177 13.5061C11.9177 13.0241 11.7258 12.5624 11.3851 12.2216C11.0443 11.8808 10.5821 11.6894 10.1002 11.6894C9.61837 11.6894 9.1563 11.8808 8.81561 12.2215C8.47491 12.5622 8.28352 13.0243 8.28352 13.5061M8.28352 13.5061H1.29102M16.7077 2.4944H14.1202M10.486 2.4944H1.29102M10.486 2.4944C10.486 2.01259 10.6774 1.55051 11.0181 1.20982C11.3588 0.869133 11.8209 0.677734 12.3027 0.677734C12.5412 0.677734 12.7775 0.724724 12.9979 0.81602C13.2183 0.907316 13.4186 1.04113 13.5873 1.20982C13.756 1.37852 13.8898 1.57878 13.9811 1.79919C14.0724 2.0196 14.1193 2.25583 14.1193 2.4944C14.1193 2.73297 14.0724 2.9692 13.9811 3.18961C13.8898 3.41002 13.756 3.61028 13.5873 3.77898C13.4186 3.94767 13.2183 4.08149 12.9979 4.17278C12.7775 4.26408 12.5412 4.31107 12.3027 4.31107C11.8209 4.31107 11.3588 4.11967 11.0181 3.77898C10.6774 3.43829 10.486 2.97621 10.486 2.4944Z"
                        stroke="#A0A3BD"
                        strokeWidth="1.25"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                      />
                    </svg>
                    {typeOfSearchPopupVisible && (
                      <div className="bg-white shadow-xl shadow-slate-400 p-[17px] rounded-[10px] flex flex-col items-start gap-[14px] absolute right-1 top-8">
                        <span className="text-[13px] text-n700 font-medium">
                          Search by :{" "}
                        </span>
                        <div className="flex items-center gap-[4px]">
                          <button
                            className={`px-[20px] py-[5px] rounded-[26px] border-[1px]  text-[12px] leading-[18px]  font-medium ${
                              typeOfSearchForCoord === "Emails"
                                ? "text-primary border-primary"
                                : "text-n600 border-n400"
                            }`}
                            onClick={() => {
                              setTypeOfSearchForCoord("Emails");
                            }}
                          >
                            Emails
                          </button>
                          <button
                            className={`px-[20px] py-[5px] rounded-[26px] border-[1px] text-[12px] leading-[18px] font-medium ${
                              typeOfSearchForCoord === "Groupes"
                                ? "text-primary border-primary"
                                : "text-n600 border-n400"
                            }`}
                            onClick={() => {
                              setTypeOfSearchForCoord("Groupes");
                            }}
                          >
                            Groupes
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {isFocusedMailInput && searchQueryCoord !== "" ? (
                    <div className="rounded-[20px] py-[18px] z-40 bg-white absolute w-full shadow-md flex flex-col gap-[12px]">
                      {loaderCoordSearch ? (
                        <div className="w-full px-[18px] py-[10px] flex items-center justify-center">
                          <RotatingLines
                            strokeWidth="4"
                            strokeColor="#4A3AFF"
                            width="20"
                          />
                        </div>
                      ) : searchCoords !== null && searchCoords.length > 0 ? (
                        searchCoords.map((coord) =>
                          typeOfSearchForCoord === "Emails" ? (
                            <div
                              key={coord.id}
                              className="flex items-center px-[18px] gap-[8px] w-full cursor-pointer hover:bg-slate-100"
                              onClick={() => {
                                setformValues((prev) => {
                                  if (!prev.emails.includes(coord.email!)) {
                                    return {
                                      ...prev,
                                      emails: [...prev.emails, coord.email],
                                    };
                                  }
                                  return prev;
                                });
                                setSelectedCoord((prev) => {
                                  if (!prev.includes(coord.email!)) {
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
                          ) : (
                            <div
                              key={coord.id}
                              className="flex items-center px-[18px] gap-[8px] w-full cursor-pointer hover:bg-slate-100"
                              onClick={() => {
                                fetchGroupMembers(
                                  coord.id,
                                  setSelectedCoord,
                                  setLoaderGettingGroupMembers,
                                  setformValues
                                );
                                setSearchQueryCoord("");
                              }}
                            >
                              <img
                                src="avatar.png"
                                alt="avatar"
                                className="w-[35px]"
                              />
                              <span className="text-n700 text-[14px]">
                                {coord.name}
                              </span>
                            </div>
                          )
                        )
                      ) : (
                        <span className="text-n700 w-full flex justify-center text-[14px]">
                          no result found
                        </span>
                      )}
                    </div>
                  ) : (
                    loaderGettingGroupMembers &&
                    typeOfSearchForCoord === "Groupes" && (
                      <div className="rounded-[20px] py-[18px] z-40 bg-white absolute w-full shadow-md flex justify-center items-center text-[14px] text-primary font-medium">
                        Getting group members ...
                      </div>
                    )
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
                              className="absolute top-0 flex items-center justify-center w-full h-full text-white bg-550 opacity-0 hover:bg-opacity-40 z-20 hover:opacity-100 cursor-pointer rounded-[50%]"
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
                  accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.txt,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg"
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
                        return (
                          <UploadingFile
                            key={index}
                            id={file.id}
                            file={file.file}
                            progress={file.progress}
                            fileType="attachements"
                          />
                        );
                      })}
                    </div>
                  )
                : null}
              <div className="flex flex-col items-start gap-3 sm:hidden">
                {/*   Heeeere   */}

                <div className="items-center gap-[7px] flex">
                  <input
                    type="checkbox"
                    id="return-voucher"
                    className="hidden peer"
                    checked={formValues.require_return_voucher ? true : false}
                    onChange={(e) => {
                      setformValues((prev) => ({
                        ...prev,
                        require_return_voucher: e.target.checked,
                      }));
                    }}
                  />
                  <label
                    htmlFor="return-voucher"
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
                    htmlFor="return-voucher"
                    className="text-550 text-[14px] leading-[20px] font-medium"
                  >
                    Require Return voucher
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end  sm:justify-between w-full">

              <div className="flex items-center gap-[6px] justify-end w-full">
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
            </div>
          </>
        )}
      </dialog>
    );
  }
);

export default ModernisationPopup;
