import { forwardRef, useState, FormEvent, MouseEvent, useEffect } from "react";
import "../../styles/PrioritySelector.css";
import {
  ReqLosExecution,
  ResLosExecution,
} from "../../assets/types/LosCommands";
import {
  validateForm1,
  ExectionPopupErrors,
} from "../../func/los/validation/validateExectionPopup";
import { handleCreateOrder } from "../../func/los/orders";
import { handleCloseDialog } from "../../func/openDialog";
import handleChange from "../../func/handleChangeFormsInput";
import {
  updateDMSFromDecimal,
  handleDMSChange,
  handleDMSDirectionChange,
  DimensionDMS,
} from "../../func/los/Dms_Decimal";
import { siteResult, fetchSiteResult } from "../../func/los/orders";
import { RotatingLines } from "react-loader-spinner";

interface LosPopupProps {
  altId: number;
  site_type: 1 | 2;
  site_name: string;
  fetchOrders?: () => void;
}

const LosExcutionPopup = forwardRef<HTMLDialogElement, LosPopupProps>(
  ({ altId, site_type, site_name, fetchOrders }, ref) => {
    const [currentSliderIndex, setCurrentSliderIndex] = useState<1 | 2>(1);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingFirstSubmit, setLoadingFirstSubmit] =
      useState<boolean>(false);

    const [formValues, setformValues] = useState<ReqLosExecution>({
      los_result: altId,
      site_type,
      hba: null,
      longitude: null,
      latitude: null,
    });

    const [formErrs, setFormErrs] = useState<ExectionPopupErrors>({});

    const [latitude, setLatitude] = useState<DimensionDMS>({
      degrees: null,
      minutes: null,
      seconds: null,
      direction: "N",
    });

    const [longitude, setLongitude] = useState<DimensionDMS>({
      degrees: null,
      minutes: null,
      seconds: null,
      direction: "E",
    });

    const [site, setSite] = useState<ResLosExecution | null>(null);

    const handleFirst = (
      e: FormEvent<HTMLFormElement> | MouseEvent<HTMLButtonElement>
    ) => {
      e.preventDefault();
      if (site) {
        setCurrentSliderIndex(2);
      } else {
        setFormErrs({});
        const formErrors = validateForm1(formValues);
        if (Object.keys(formErrors).length === 0) {
          siteResult(formValues, setLoadingFirstSubmit, setCurrentSliderIndex);
          setFormErrs({});
        } else {
          setFormErrs(formErrors);
        }
      }
    };

    const handleSecondSubmit = (
      e: FormEvent<HTMLFormElement> | MouseEvent<HTMLButtonElement>
    ) => {
      e.preventDefault();
      // setFormErrs({});
      const formErrors = validateLosForm2(formValues);

      if (Object.keys(formErrors).length === 0) {
        handleCreateOrder(formValues, setIsLoading, ref, props.fetchOrders);
        //  setFormErrs({});
      } else {
        // setFormErrs(formErrors);
      }
    };

    const handleCancel = () => {
      handleCloseDialog(ref);
      setCurrentSliderIndex(1);
      setFormErrs({});
    };

    /* useWebSocketSearch({
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
  });  */

    useEffect(() => {
      setformValues((prev) => ({ ...prev, site_type, los_result: altId }));
      fetchSiteResult(setSite, setIsLoading, altId, site_type);
    }, [site_type, altId]);

    useEffect(() => {
      if (site) {
        setformValues((prev) => ({
          ...prev,
          hba: site.hba,
          latitude: site.latitude,
          longitude: site.longitude,
        }));

        updateDMSFromDecimal(
          String(site.latitude),
          setLatitude,
          true,
          setformValues
        );
        updateDMSFromDecimal(
          String(site.longitude),
          setLongitude,
          false,
          setformValues
        );
      } else {
        setformValues({
          los_result: altId,
          site_type,
          hba: null,
          longitude: null,
          latitude: null,
        });
        setLatitude({
          degrees: null,
          minutes: null,
          seconds: null,
          direction: "N",
        });
        setLongitude({
          degrees: null,
          minutes: null,
          seconds: null,
          direction: "E",
        });
      }
    }, [site, altId, site_type]);

    return (
      <dialog
        ref={ref}
        id="execute-los-popup"
        className={`hidden fixed z-30 top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] sm:px-[40px] sm:py-[30px] px-[20px] pt-[25px] pb-[20px] flex-col ${
          isLoading ? "sm:items-center" : "sm:items-end"
        }  items-center gap-[35px] rounded-[34px] ${
          currentSliderIndex === 1 ? "lg:w-[50vw]" : "lg:w-[40vw]"
        }  sm:w-[75vw] w-[90vw] overflow-y-visible`}
      >
        {isLoading ? (
          <RotatingLines strokeColor="#4A3AFF" width="45" />
        ) : currentSliderIndex === 1 ? (
          <>
            <div className="flex flex-col items-start gap-[22px] w-full">
              <div className="flex w-full items-center justify-between">
                <h3 className="text-[19px] text-primary font-medium">
                  Execution of {site_name}
                </h3>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="access"
                    className="font-medium text-n600 cursor-pointer"
                  >
                    No access{" "}
                  </label>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="access"
                      name="access"
                      type="checkbox"
                      className="sr-only peer"
                      onChange={(e) => {}}
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-1 dark:peer-focus:ring-n700 rounded-full peer dark:bg-n500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#4A3AFF]"></div>
                  </label>
                </div>
              </div>
              <div className="flex flex-col items-start gap-[18px] w-full">
                <div className="flex flex-col items-start gap-2 w-full">
                  <div className="flex items-center">
                    <div className="relative inline-block">
                      {formErrs.hba && (
                        <>
                          <div className="relative group inline-block">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-[16px] h-[16px] text-red-500 inline-block mr-2 cursor-pointer"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-10.5a.75.75 0 011.5 0v4a.75.75 0 01-1.5 0v-4zm.75 7a1 1 0 110-2 1 1 0 010 2z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <div className="absolute left-[50%] top-1/2 transform -translate-y-1/2 ml-2 hidden group-hover:flex bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                              {formErrs.hba}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <label
                      htmlFor="hba"
                      className="text-n600 text-[14px] font-medium"
                    >
                      HBA
                    </label>
                  </div>
                  <input
                    type="number"
                    name="hba"
                    id="hba"
                    placeholder="Enter hba"
                    className="rounded-[19px] h-[47px] border-[1px] border-n400 w-full px-[23px]"
                    onChange={(e) => {
                      handleChange(e, setformValues);
                    }}
                    value={formValues.hba ?? ""}
                    disabled={site ? true : false}
                  />
                </div>

                <div className="flex flex-col items-start gap-[10px] w-full">
                  <div className="flex items-center">
                    <div className="relative inline-block">
                      {formErrs.latitude && (
                        <>
                          <div className="relative group inline-block">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-[16px] h-[16px] text-red-500 inline-block mr-2 cursor-pointer"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-10.5a.75.75 0 011.5 0v4a.75.75 0 01-1.5 0v-4zm.75 7a1 1 0 110-2 1 1 0 010 2z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <div className="absolute left-[50%] top-1/2 transform -translate-y-1/2 ml-2 hidden group-hover:flex bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                              {formErrs.latitude}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <label
                      htmlFor="latitude"
                      className="text-[15px] text-550 leading-[20px] font-medium"
                    >
                      Latitude
                    </label>
                  </div>
                  <div className="flex items-center w-full gap-3">
                    <input
                      type="text"
                      id="degrees"
                      className="rounded-[46px] h-[45px] border-[1px] border-n300 px-[24px] w-[28%]"
                      placeholder="Degrees"
                      min={0}
                      max={90}
                      name="degrees"
                      value={latitude.degrees ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (
                          value === "" ||
                          (/^\d+$/.test(value) &&
                            parseInt(value, 10) >= 0 &&
                            parseInt(value, 10) <= 90)
                        ) {
                          handleDMSChange(e, setLatitude, true, setformValues);
                        }
                      }}
                      disabled={site ? true : false}
                    />
                    <input
                      type="text"
                      id="minutes"
                      className="rounded-[46px] h-[45px] border-[1px] border-n300 px-[24px] w-[28%]"
                      placeholder="Minute"
                      min={0}
                      max={59}
                      maxLength={2}
                      name="minutes"
                      value={latitude.minutes ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (
                          value === "" ||
                          (/^\d+$/.test(value) &&
                            parseInt(value, 10) >= 0 &&
                            parseInt(value, 10) <= 59)
                        ) {
                          handleDMSChange(e, setLatitude, true, setformValues);
                        }
                      }}
                      disabled={site ? true : false}
                    />
                    <input
                      type="text" // Change type to "text" to allow commas
                      id="latitude-second"
                      className="rounded-[46px] h-[45px] border-[1px] border-n300 px-[24px] w-[28%]"
                      placeholder="Second"
                      min={0}
                      max={59.99}
                      maxLength={12}
                      name="seconds"
                      value={latitude.seconds ?? ""}
                      disabled={site ? true : false}
                      onChange={(e) => {
                        const target = e.target;
                        const value = target.value.replace(",", "."); // Replace comma with dot

                        // Check if the value is valid
                        if (
                          value === "" ||
                          (parseFloat(value) >= 0 && parseFloat(value) <= 59.99)
                        ) {
                          const modifiedEvent = {
                            ...e,
                            target: {
                              ...target,
                              name: target.name,
                              value: value,
                            },
                          } as React.ChangeEvent<HTMLInputElement>;

                          handleDMSChange(
                            modifiedEvent,
                            setLatitude,
                            true,
                            setformValues
                          );
                        }
                      }}
                      onInput={(e) => {
                        const target = e.target as HTMLInputElement;
                        // Allow digits, commas, and dots
                        target.value = target.value.replace(/[^\d,.]/g, "");
                      }}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        const target = e.currentTarget;
                        if (
                          (e.key === "," || e.key === ".") &&
                          (target.value.includes(",") ||
                            target.value.includes("."))
                        ) {
                          e.preventDefault();
                        }
                      }}
                    />

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-[5px]">
                        <div className="rounded-full border-[2px] border-primary p-[2px]">
                          <input
                            type="checkbox"
                            id="north"
                            className="hidden peer"
                            name="direction"
                            value="N"
                            checked={latitude.direction === "N"}
                            disabled={site ? true : false}
                            onChange={(e) =>
                              handleDMSDirectionChange(
                                e,
                                setLatitude,
                                true,
                                setformValues
                              )
                            }
                          />
                          <label
                            htmlFor="north"
                            className=" w-[16px] h-[16px] rounded-full peer-checked:bg-primary flex items-center justify-center cursor-pointer"
                          ></label>
                        </div>
                        <label
                          htmlFor="north"
                          className="text-primary text-[15px] font-medium leading-[15px]"
                        >
                          N
                        </label>
                      </div>
                      <div className="flex items-center gap-[5px]">
                        <div className="rounded-full border-[2px] border-primary p-[2px]">
                          <input
                            type="checkbox"
                            name="direction"
                            id="south"
                            value="S"
                            className="hidden peer"
                            checked={latitude.direction === "S"}
                            disabled={site ? true : false}
                            onChange={(e) =>
                              handleDMSDirectionChange(
                                e,
                                setLatitude,
                                true,
                                setformValues
                              )
                            }
                          />
                          <label
                            htmlFor="south"
                            className=" w-[16px] h-[16px] rounded-full peer-checked:bg-primary flex items-center justify-center cursor-pointer"
                          ></label>
                        </div>
                        <label
                          htmlFor="south"
                          className="text-primary text-[15px] font-medium leading-[15px]"
                        >
                          S
                        </label>
                      </div>
                    </div>
                  </div>
                  <input
                    type="text"
                    id="dec-latitude"
                    name="latitude"
                    value={formValues.latitude ?? ""}
                    placeholder="Decimal"
                    className="rounded-[46px] h-[45px] border-[1px] border-n300 px-[24px] w-full"
                    disabled={site ? true : false}
                    onChange={(e) => {
                      let value = e.target.value.replace(",", ".");

                      if (value.startsWith("-")) {
                        value = "-" + value.slice(1).replace(/[^0-9.]/g, "");
                      } else {
                        value = value.replace(/[^0-9.]/g, "");
                      }

                      if (value.split(".").length > 2) {
                        value = value.slice(0, -1);
                      }

                      if (
                        value === "" ||
                        value === "-" ||
                        (/^-?\d*\.?\d*$/.test(value) &&
                          parseFloat(value) >= -90 &&
                          parseFloat(value) <= 90)
                      ) {
                        updateDMSFromDecimal(
                          value,
                          setLatitude,
                          true,
                          setformValues
                        );
                      }
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLInputElement;
                      // Allow only digits, commas, dots, and one minus sign at the beginning
                      target.value = target.value.replace(/(?!^-)[^\d,.]/g, "");
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      const target = e.currentTarget;
                      if (
                        (e.key === "," || e.key === ".") &&
                        (target.value.includes(",") ||
                          target.value.includes("."))
                      ) {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>
                <div className="flex flex-col items-start gap-[10px] w-full">
                  <div className="flex items-center">
                    <div className="relative inline-block">
                      {formErrs.longitude && (
                        <>
                          <div className="relative group inline-block">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-[16px] h-[16px] text-red-500 inline-block mr-2 cursor-pointer"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-10.5a.75.75 0 011.5 0v4a.75.75 0 01-1.5 0v-4zm.75 7a1 1 0 110-2 1 1 0 010 2z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <div className="absolute left-[50%] top-1/2 transform -translate-y-1/2 ml-2 hidden group-hover:flex bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                              {formErrs.longitude}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <label
                      htmlFor="longitude"
                      className="text-[15px] text-550 leading-[20px] font-medium"
                    >
                      Longitude
                    </label>
                  </div>
                  <div className="flex items-center w-full gap-3">
                    <input
                      type="text"
                      id="longitude-degree"
                      className="rounded-[46px] h-[45px] border-[1px] border-n300 px-[24px] w-[28%]"
                      placeholder="Degree"
                      min={0}
                      max={180}
                      maxLength={3}
                      name="degrees"
                      disabled={site ? true : false}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (
                          value === "" ||
                          (/^\d+$/.test(value) &&
                            parseInt(value, 10) >= 0 &&
                            parseInt(value, 10) <= 180)
                        ) {
                          handleDMSChange(
                            e,
                            setLongitude,
                            false,
                            setformValues
                          );
                        }
                      }}
                      value={longitude.degrees ? longitude.degrees : ""}
                    />
                    <input
                      type="text"
                      id="longitude-minute"
                      className="rounded-[46px] h-[45px] border-[1px] border-n300 px-[24px] w-[28%]"
                      placeholder="Minute"
                      min={0}
                      max={59}
                      maxLength={2}
                      name="minutes"
                      disabled={site ? true : false}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (
                          value === "" ||
                          (/^\d+$/.test(value) &&
                            parseInt(value, 10) >= 0 &&
                            parseInt(value, 10) <= 59)
                        ) {
                          handleDMSChange(
                            e,
                            setLongitude,
                            false,
                            setformValues
                          );
                        }
                      }}
                      value={longitude.minutes ? longitude.minutes : ""}
                    />
                    <input
                      type="text"
                      id="longitude-second"
                      className="rounded-[46px] h-[45px] border-[1px] border-n300 px-[24px] w-[28%]"
                      placeholder="Second"
                      name="seconds"
                      maxLength={12}
                      disabled={site ? true : false}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const target = e.target as HTMLInputElement;
                        const value = target.value.replace(",", "."); // Replace comma with dot

                        // Check if the value is valid
                        if (
                          value === "" ||
                          (parseFloat(value) >= 0 && parseFloat(value) <= 59.99)
                        ) {
                          const modifiedEvent = {
                            ...e,
                            target: {
                              ...target,
                              name: target.name,
                              value: value,
                            },
                          } as React.ChangeEvent<HTMLInputElement>;
                          handleDMSChange(
                            modifiedEvent,
                            setLongitude,
                            false,
                            setformValues
                          );
                        }
                      }}
                      onInput={(e: React.FormEvent<HTMLInputElement>) => {
                        const target = e.target as HTMLInputElement;
                        target.value = target.value.replace(/[^\d,.]/g, "");
                      }}
                      value={longitude.seconds ? longitude.seconds : ""}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        const target = e.currentTarget;
                        if (
                          (e.key === "," || e.key === ".") &&
                          (target.value.includes(",") ||
                            target.value.includes("."))
                        ) {
                          e.preventDefault();
                        }
                      }}
                    />

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-[5px]">
                        <div className="rounded-full border-[2px] border-primary p-[2px]">
                          <input
                            type="checkbox"
                            id="east"
                            className="hidden peer"
                            name="direction"
                            value="E"
                            checked={longitude.direction === "E"}
                            disabled={site ? true : false}
                            onChange={(e) =>
                              handleDMSDirectionChange(
                                e,
                                setLongitude,
                                false,
                                setformValues
                              )
                            }
                          />
                          <label
                            htmlFor="east"
                            className=" w-[16px] h-[16px] rounded-full peer-checked:bg-primary flex items-center justify-center cursor-pointer"
                          ></label>
                        </div>
                        <label
                          htmlFor="east"
                          className="text-primary text-[15px] font-medium leading-[15px]"
                        >
                          E
                        </label>
                      </div>
                      <div className="flex items-center gap-[5px]">
                        <div className="rounded-full border-[2px] border-primary p-[2px]">
                          <input
                            type="checkbox"
                            id="west"
                            className="hidden peer"
                            name="direction"
                            value="W"
                            checked={longitude.direction === "W"}
                            disabled={site ? true : false}
                            onChange={(e) =>
                              handleDMSDirectionChange(
                                e,
                                setLongitude,
                                false,
                                setformValues
                              )
                            }
                          />
                          <label
                            htmlFor="west"
                            className=" w-[16px] h-[16px] rounded-full peer-checked:bg-primary flex items-center justify-center cursor-pointer"
                          ></label>
                        </div>
                        <label
                          htmlFor="west"
                          className="text-primary text-[15px] font-medium leading-[15px]"
                        >
                          W
                        </label>
                      </div>
                    </div>
                  </div>
                  <input
                    type="text"
                    name="longitude"
                    id="longitude"
                    value={formValues.longitude || ""}
                    placeholder="Decimal"
                    className="rounded-[46px] h-[45px] border-[1px] border-n300 px-[24px] w-full"
                    disabled={site ? true : false}
                    onChange={(e) => {
                      let value = e.target.value.replace(",", ".");

                      if (value.startsWith("-")) {
                        value = "-" + value.slice(1).replace(/[^0-9.]/g, "");
                      } else {
                        value = value.replace(/[^0-9.]/g, "");
                      }

                      // Ensure only one decimal point
                      if (value.split(".").length > 2) {
                        value = value.slice(0, -1);
                      }

                      // Allow an empty string, a single "-", or values within range -180 to 180
                      if (
                        value === "" ||
                        value === "-" ||
                        (/^-?\d*\.?\d*$/.test(value) &&
                          parseFloat(value) >= -180 &&
                          parseFloat(value) <= 180)
                      ) {
                        updateDMSFromDecimal(
                          value,
                          setLongitude,
                          false,
                          setformValues
                        );
                      }
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLInputElement;
                      target.value = target.value.replace(/(?!^-)[^\d,.]/g, "");
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      const target = e.currentTarget;
                      if (
                        (e.key === "," || e.key === ".") &&
                        (target.value.includes(",") ||
                          target.value.includes("."))
                      ) {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-[6px]">
              <button
                className="rounded-[86px] px-[45px] py-[10px] bg-n300 text-[14px] text-n600 font-semibold border-[1px] border-n400"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                className="rounded-[86px] px-[45px] py-[10px] bg-primary text-[14px] text-white font-semibold border-[1px] border-primary flex items-center justify-center"
                onClick={handleFirst}
              >
                {loadingFirstSubmit ? (
                  <RotatingLines strokeColor="white" width="20" />
                ) : (
                  "Next"
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-start gap-[24px] w-full">
              <h3 className="text-[19px] text-primary font-medium">
                Site Location NE
              </h3>
              <div className="flex flex-col items-start gap-[18px] w-full">
                <div
                  className="w-full"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const files = e.dataTransfer.files;

                    // Ensure files are not null and handle each file
                    if (files) {
                      Array.from(files).forEach(async (file) => {
                        /*  await handleFileChange(
              dispatch,
              props.workorderId!,
              "certificate",
              props.extantionType,
              file,
              setIsLoading,
              props.fetchOneWorkOrder,
              undefined,
              certType
            );
            setFile({ file: file, progress: 0 });  */
                      });
                    }
                  }}
                >
                  <input
                    type="file"
                    name="site-location"
                    id="site-location"
                    accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.txt,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files ? e.target.files[0] : null;
                      if (file) {
                        /* await handleFileChange(
              dispatch,
              props.workorderId!,
              "certificate",
              props.extantionType,
              file,
              setIsLoading,
              props.fetchOneWorkOrder,
              undefined,
              certType
            );
            setFile({ file: file, progress: 0 }); */
                      }
                    }}
                  />
                  <label
                    htmlFor="site-location"
                    className="cursor-pointer w-full py-[18px] px-[45px] flex items-center justify-center bg-white border-dashed border-[1px] border-n500 rounded-[15px]"
                  >
                    <span className="text-[14px] text-n600 font-medium leading-[15px] py-[38px] px-[5px] text-center flex flex-col items-center ">
                      Drag & drop your file here <br /> or
                      <span className="text-primary"> chooses file</span>
                    </span>
                  </label>
                </div>
                <textarea
                  name="comment"
                  id="comment"
                  placeholder="Add Comment"
                  className="rounded-[19px] border-[2px] border-n300 p-4 w-full shadow-[#7090B008] text-[14px] font-medium max-h-[180px]"
                />
              </div>
            </div>
            <div className="flex items-center gap-[6px]">
              <button
                className="rounded-[86px] px-[45px] py-[10px] bg-n300 text-[14px] text-n600 font-semibold border-[1px] border-n400"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button className="rounded-[86px] px-[45px] py-[10px] bg-primary text-[14px] text-white font-semibold border-[1px] border-primary flex items-center justify-center">
                Next
              </button>
            </div>
          </>
        )}
      </dialog>
    );
  }
);

export default LosExcutionPopup;
