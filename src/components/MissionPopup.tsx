import {
  forwardRef,
  useState,
  ChangeEvent,
  FormEvent,
  MouseEvent,
  useEffect,
  useCallback,
} from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "../styles/PrioritySelector.css";
import { ReqMission } from "../assets/types/Mission";
import {
  validateForm1,
  validateForm2,
  FormErrors,
} from "../func/missionsValidation";
import { formatFileSize } from "../func/formatFileSize";
import { RotatingLines } from "react-loader-spinner";
import { User } from "../assets/types/User";
interface MissionPopupProps {
  title: boolean;
  textAreaTitle: string;
  textAreaPlaceholder: string;
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
      ticker_number: undefined,
      require_acceptence: false,
      accounts: [],
      attachments: [],
    });

    if (formValues.assigned_to) {
      console.log(formValues.assigned_to);
    }
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
        ticker_number: undefined,
        require_acceptence: false,
        accounts: [],
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
        setformValues((prevFormValues) => ({
          ...prevFormValues,
          attachments: [...(prevFormValues.attachments || []), file],
        }));
      }
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

    const handleChange = (
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const { name, value } = e.target;
      setformValues((prev) => ({ ...prev, [name]: value }));
    };

    const removeEng = () => {
      setSelectedEng(null);
      setformValues((prev) => ({
        ...prev,
        assigned_to: "",
      }));
    };
    const removeCoord = (deletedItem:string) => {
      setSelectedCoord((prev) => prev.filter((item) => item !== deletedItem));
      
      setformValues((prev) => ({
        ...prev,
        accounts: prev.accounts.filter((item) => item !== deletedItem),
      }));
    };
    
    const handleFocusMailedUsersInput = () => {
      setIsFocusedMailInput(true);
      setFormErrs((prev) => ({ ...prev, accounts: "" }));
    };

    const handleCreateWorkorder = async (e: FormEvent) => {
      e.preventDefault();

      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const formData = new FormData();
      formData.append("title", formValues.title);
      formData.append(
        "ticker_number",
        formValues.ticker_number?.toString() || ""
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

      formValues.accounts.forEach((account) => {
        formData.append("accounts", account);
      });

      if (formValues.attachments) {
        formValues.attachments.forEach((file) => {
          formData.append("attachments", file);
        });
      }

      // Log formData contents
      for (const pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      setIsLoading(true);

      try {
        const response = await fetch("/workorder/create-workorder", {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
          },
          body: formData,
        });

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
        props.fetchWorkOrders!()
        localStorage.setItem("selectedFilter","all")
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
        console.log(formValues);
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

    const searchForEngs = useCallback(() => {
      if (!searchQueryEng) {
        console.log("No search query provided");
        return;
      }
      setLoaderAssignSearch(true);

      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const url = `ws://89.116.110.42:8000/ws/search-account/engineer`;
      const socket = new WebSocket(url);

      socket.onopen = () => {
        console.log("WebSocket connection opened");
        const message = `search|${token}|${searchQueryEng}`;
        socket.send(message);
      };

      socket.onmessage = (event) => {
        console.log("WebSocket message received");
        try {
          const data = event.data;
          setSearchEngs(JSON.parse(data));
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
        } finally {
          setLoaderAssignSearch(false);
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      socket.onclose = () => {
        console.log("WebSocket connection closed");
      };

      return () => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.close();
        }
      };
    }, [searchQueryEng]);

    const searchForCoords = useCallback(() => {
      if (!searchQueryCoord) {
        console.log("No search query provided");
        return;
      }
      setLoaderCoordSearch(true);

      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const url = `ws://89.116.110.42:8000/ws/search-account/coordinator`;
      const socket = new WebSocket(url);

      socket.onopen = () => {
        console.log("WebSocket connection opened");
        const message = `search|${token}|${searchQueryCoord}`;
        socket.send(message);
      };

      socket.onmessage = (event) => {
        console.log("WebSocket message received");
        try {
          const data = event.data;
          setSearchCoords(JSON.parse(data));
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
        } finally {
          setLoaderCoordSearch(false);
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      socket.onclose = () => {
        console.log("WebSocket connection closed");
      };

      return () => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.close();
        }
      };
    }, [searchQueryCoord]);

    useEffect(() => {
      searchForEngs();
    }, [searchForEngs]);

    useEffect(() => {
      searchForCoords();
    }, [searchForCoords]);

    return (
      <dialog
        ref={ref}
        id="Mission-popup"
        className={`hidden fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] sm:px-[56px] sm:py-[43px] px-[20px] pt-[25px] pb-[20px] flex-col sm:items-end items-center gap-[35px] rounded-[34px] lg:w-[56vw] sm:w-[75vw] w-[90vw]`}
      >
        {currentSliderIndex === 1 ? (
          <form className="w-full flex flex-col gap-[30px]">
            <div className="flex items-center flex-col gap-[17.5px] w-full">
              {props.title && (
                <div className="flex items-start gap-[17px] w-full">
                  <div className="flex flex-col items-start gap-[8px] w-[50%]">
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
                        handleChange(e);
                      }}
                    />
                    {formErrs.title !== "" && formErrs.title !== undefined && (
                      <span className="ml-[12px] text-[14px] text-[#DB2C2C] leading-[22px]">
                        {formErrs.title}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-start gap-[8px] w-[50%]">
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
                          <div className="rounded-[20px] p-[18px] bg-white absolute w-full shadow-md flex flex-col gap-[12px]">
                            {loaderAssignSearch ? (
                              <div className="w-full py-[10px] flex items-center justify-center">
                                <RotatingLines
                                  strokeWidth="4"
                                  strokeColor="#4A3AFF"
                                  width="20"
                                />
                              </div>
                            ) : (
                              searchEngs.map((eng) => {
                                return (
                                  <div
                                    className="flex items-center gap-[8px] w-full cursor-pointer"
                                    onClick={() => {
                                      setformValues((prev) => ({
                                        ...prev,
                                        assigned_to: eng.email,
                                      }));
                                      console.log(eng.email);
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
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col items-start gap-[8px] w-full">
                <label
                  htmlFor="description"
                  className="leading-[21px] font-medium ml-[9px] text-n700"
                >
                  {props.textAreaTitle}
                </label>
                <textarea
                  name="description"
                  id="description"
                  value={formValues.description}
                  placeholder={props.textAreaPlaceholder}
                  className="rounded-[21px] border-[1px] border-n400 w-full p-[20px] h-[140px] max-h-[300px]"
                  onChange={(e) => {
                    handleChange(e);
                  }}
                />
                {formErrs.description !== "" && (
                  <span className="ml-[12px] text-[14px] text-[#DB2C2C] leading-[22px]">
                    {formErrs.description}
                  </span>
                )}
              </div>

              <div className="flex items-start gap-[17px] w-full">
                <div className="flex flex-col items-start gap-[8px] w-[50%]">
                  <label
                    htmlFor="title"
                    className="leading-[21px] font-medium ml-[9px] text-n700"
                  >
                    Ticket number
                  </label>
                  <input
                    type="number"
                    name="ticker_number"
                    id="ticker_number"
                    value={formValues.ticker_number}
                    placeholder="0000"
                    className="rounded-[19px] h-[47px] border-[1px] border-n400 w-full px-[23px]"
                    onChange={(e) => {
                      handleChange(e);
                    }}
                  />
                  {formErrs.ticker_number !== "" && (
                    <span className="ml-[12px] text-[14px] text-[#DB2C2C] leading-[22px]">
                      {formErrs.ticker_number}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-start gap-[8px] w-[50%]">
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

                    <div className="flex-grow relative py-[16px] rounded-[100px] bg-[#FEF6FF]">
                      <TransitionGroup>
                        <CSSTransition
                          key={priorities[currentPriorityIndex]}
                          timeout={300}
                          classNames="fade"
                        >
                          <span
                            className={`absolute top-[50%] translate-y-[-50%] inset-0 flex items-center justify-center  font-medium leading-[15px] text-[10px] text-center ${
                              currentPriorityIndex === 0
                                ? "text-primary"
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
              <div className="flex items-center gap-[7px]">
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
            <div className="flex items-center flex-col gap-[20px] w-full">
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
                    <div className="rounded-[20px] p-[18px] z-50 bg-white absolute w-full shadow-md flex flex-col gap-[12px]">
                      {loaderCoordSearch ? (
                        <div className="w-full py-[10px] flex items-center justify-center">
                          <RotatingLines
                            strokeWidth="4"
                            strokeColor="#4A3AFF"
                            width="20"
                          />
                        </div>
                      ) : (
                        searchCoords.map((coord) => {
                          return (
                            <div
                              className="flex items-center gap-[8px] w-full cursor-pointer"
                              onClick={() => {
                                setformValues((prev) => {
                                  if (!prev.accounts.includes(coord.email)) {
                                    return {
                                      ...prev,
                                      accounts: [...prev.accounts, coord.email],
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
                      )}
                    </div>
                  )}
                </div>
                {formErrs.accounts !== "" && formErrs.accounts !== undefined ? (
                  <span className="ml-[12px] text-[14px] text-[#DB2C2C] leading-[22px]">
                    {formErrs.accounts}
                  </span>
                ) : (
                  selectedCoord && (
                    <div className="flex items-center gap-[5px] pl-4">
                      {selectedCoord.map((coord, index) => {
                        return (
                          <div className="" key={index}>
                            <div className="relative">
                              <img
                                src="avatar1.png"
                                alt="avatar"
                                className="w-[35px]"
                              />
                              <span
                                className="absolute top-0 flex items-center justify-center w-full h-full text-white bg-550 opacity-0 hover:bg-opacity-40 z-50 hover:opacity-100 cursor-pointer rounded-[50%]"
                                onClick={() => { removeCoord(coord) }}
                              >
                                🗙
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                )}
              </div>

              <div className="flex flex-col items-start gap-[8px] w-[100%]">
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
                        return (
                          <div
                            key={index}
                            className="w-full flex items-center justify-between px-[12px] py-[8px] border-[1px] border-n300 rounded-[15px]"
                          >
                            <div className="flex items-center gap-[7px]">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="22"
                                height="26"
                                viewBox="0 0 22 26"
                                fill="none"
                              >
                                <path
                                  opacity="0.2"
                                  d="M20.375 6.33984V19.4648C20.375 19.7135 20.2762 19.9519 20.1004 20.1278C19.9246 20.3036 19.6861 20.4023 19.4375 20.4023H16.625V10.0898L11.9375 5.40234H5.375V2.58984C5.375 2.3412 5.47377 2.10275 5.64959 1.92693C5.8254 1.75112 6.06386 1.65234 6.3125 1.65234H15.6875L20.375 6.33984Z"
                                  fill="#6F6C8F"
                                />
                                <path
                                  d="M21.0383 5.67656L16.3508 0.989063C16.2637 0.902031 16.1602 0.833017 16.0464 0.785966C15.9326 0.738915 15.8107 0.714747 15.6875 0.714844H6.3125C5.81522 0.714844 5.33831 0.912388 4.98668 1.26402C4.63504 1.61565 4.4375 2.09256 4.4375 2.58984V4.46484H2.5625C2.06522 4.46484 1.58831 4.66239 1.23667 5.01402C0.885044 5.36565 0.6875 5.84256 0.6875 6.33984V23.2148C0.6875 23.7121 0.885044 24.189 1.23667 24.5407C1.58831 24.8923 2.06522 25.0898 2.5625 25.0898H15.6875C16.1848 25.0898 16.6617 24.8923 17.0133 24.5407C17.365 24.189 17.5625 23.7121 17.5625 23.2148V21.3398H19.4375C19.9348 21.3398 20.4117 21.1423 20.7633 20.7907C21.115 20.439 21.3125 19.9621 21.3125 19.4648V6.33984C21.3126 6.21669 21.2884 6.09473 21.2414 5.98092C21.1943 5.86711 21.1253 5.76369 21.0383 5.67656ZM15.6875 23.2148H2.5625V6.33984H11.5496L15.6875 10.4777V23.2148ZM19.4375 19.4648H17.5625V10.0898C17.5626 9.96669 17.5384 9.84473 17.4914 9.73092C17.4443 9.61711 17.3753 9.51369 17.2883 9.42656L12.6008 4.73906C12.5137 4.65203 12.4102 4.58302 12.2964 4.53597C12.1826 4.48891 12.0607 4.46475 11.9375 4.46484H6.3125V2.58984H15.2996L19.4375 6.72773V19.4648ZM12.875 15.7148C12.875 15.9635 12.7762 16.2019 12.6004 16.3778C12.4246 16.5536 12.1861 16.6523 11.9375 16.6523H6.3125C6.06386 16.6523 5.8254 16.5536 5.64959 16.3778C5.47377 16.2019 5.375 15.9635 5.375 15.7148C5.375 15.4662 5.47377 15.2277 5.64959 15.0519C5.8254 14.8761 6.06386 14.7773 6.3125 14.7773H11.9375C12.1861 14.7773 12.4246 14.8761 12.6004 15.0519C12.7762 15.2277 12.875 15.4662 12.875 15.7148ZM12.875 19.4648C12.875 19.7135 12.7762 19.9519 12.6004 20.1278C12.4246 20.3036 12.1861 20.4023 11.9375 20.4023H6.3125C6.06386 20.4023 5.8254 20.3036 5.64959 20.1278C5.47377 19.9519 5.375 19.7135 5.375 19.4648C5.375 19.2162 5.47377 18.9777 5.64959 18.8019C5.8254 18.6261 6.06386 18.5273 6.3125 18.5273H11.9375C12.1861 18.5273 12.4246 18.6261 12.6004 18.8019C12.7762 18.9777 12.875 19.2162 12.875 19.4648Z"
                                  fill="#6F6C8F"
                                />
                              </svg>
                              <div className="flex flex-col items-start">
                                <span className="text-[13px] font-medium leading-[20px] text-n600">
                                  {file.name}
                                </span>
                                <span className="text-[12px] leading-[20px] text-n600">
                                  {formatFileSize(file.size)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                : null}
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
                className="text-white sm:px-[42px] px-[36px] sm:py-[10px] py-[7px]  font-semibold rounded-[86px] bg-primary sm:text-[15px] text-[13px]"
                onClick={(e) => {
                  handleSecondSubmit(e);
                }}
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
