import { forwardRef, useState, FormEvent, MouseEvent, useEffect } from "react";
import "../../styles/PrioritySelector.css";
import {
  ReqLosExecution,
  ResLosExecution,
} from "../../assets/types/LosCommands";
import {
  validateForm1,
  ExectionPopupErrors,
  validateEditing,
} from "../../func/los/validation/validateExectionPopup";
import { handleCloseDialog } from "../../func/openDialog";
import handleChange from "../../func/handleChangeFormsInput";
import {
  updateDMSFromDecimal,
  handleDMSChange,
  handleDMSDirectionChange,
  DimensionDMS,
} from "../../func/los/Dms_Decimal";
import {
  siteResult,
  fetchSiteResult,
  updateAccessStatus,
  updateSiteResult,
} from "../../func/los/orders";
import { RotatingLines } from "react-loader-spinner";
import SiteLocationPopup from "./SiteLocationPopup";
import SitePositionPopup from "./SitePositionPopup";
import SiteAdditionalPicsPopup from "./SiteAdditionalPics";

interface LosPopupProps {
  siteInfo: {
    losId: number | null;
    altId: number | null;
    site_type: 1 | 2 | null;
    site_name: string;
    losStatus: 1 | 2 | 3 | null;
    accessibility: boolean;
    image_count: number | null;
  };

  setSelectedSiteInfo: React.Dispatch<
    React.SetStateAction<{
      losId: number | null;
      altId: number | null;
      site_type: 1 | 2 | null;
      site_name: string;
      losStatus: 1 | 2 | 3 | null;
      accessibility: boolean;
      image_count: number | null;
    }>
  >;

  fetchOrder: () => void;
}
const LosExcutionPopup = forwardRef<HTMLDialogElement, LosPopupProps>(
  ({ siteInfo, fetchOrder, setSelectedSiteInfo }, ref) => {
    const [currentSliderIndex, setCurrentSliderIndex] = useState<1 | 2 | 3 | 4>(
      1
    );
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingFirstSubmit, setLoadingFirstSubmit] =
      useState<boolean>(false);
    const [formValues, setformValues] = useState<ReqLosExecution>({
      los_result: null,
      site_type: null,
      hba: null,
      longitude: null,
      latitude: null,
    });

    const [editingFormValues, setEditingFormValues] = useState<{
      hba: number | null;
      longitude: number | null;
      latitude: number | null;
    }>({
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

    const [editingLatitude, setEditingLatitude] = useState<DimensionDMS>({
      degrees: null,
      minutes: null,
      seconds: null,
      direction: "N",
    });

    const [editingLongitude, setEditingLongitude] = useState<DimensionDMS>({
      degrees: null,
      minutes: null,
      seconds: null,
      direction: "E",
    });

    const [site, setSite] = useState<ResLosExecution | null>(null);
    const [isLoadingAccCheckBox, setIsLoadingAccCheckBox] =
      useState<boolean>(false);
    const [errorUpdatingAccess, setErrorUpdatingAccess] =
      useState<boolean>(false);
    const [editing, setEditing] = useState<boolean>(false);

    const handleFirst = (
      e: FormEvent<HTMLFormElement> | MouseEvent<HTMLButtonElement>
    ) => {
      e.preventDefault();
      if (site) {
        if (!editing) {
          setCurrentSliderIndex(2);
        } else {
          setFormErrs({});
          setErrorUpdatingAccess(false);
          const formErrors = validateEditing(editingFormValues);
          if (Object.keys(formErrors).length === 0) {
            updateSiteResult(
              editingFormValues,
              site.id,
              setLoadingFirstSubmit,
              setSite,
              setFormErrs
            );
            setFormErrs({});
            setEditingFormValues({
              hba: null,
              longitude: null,
              latitude: null,
            });
            setEditing(false);
          } else {
            setFormErrs(formErrors);
          }
        }
      } else {
        setFormErrs({});
        setErrorUpdatingAccess(false);
        const formErrors = validateForm1(formValues);
        if (Object.keys(formErrors).length === 0) {
          siteResult(
            formValues,
            setLoadingFirstSubmit,
            setCurrentSliderIndex,
            setSite,
            setFormErrs
          );
          setFormErrs({});
        } else {
          setFormErrs(formErrors);
        }
      }
    };

    const handleClose = () => {
      handleCloseDialog(ref);
      setCurrentSliderIndex(1);
      setFormErrs({});
      setErrorUpdatingAccess(false);
    };

    const handleSeconderyButton = () => {
      setEditing(!editing);
      if (editing) {
        setEditingFormValues({
          hba: null,
          longitude: null,
          latitude: null,
        });
        setEditingLatitude({
          degrees: null,
          minutes: null,
          seconds: null,
          direction: "E",
        });
        setEditingLongitude({
          degrees: null,
          minutes: null,
          seconds: null,
          direction: "N",
        });
      } else {
        setEditingFormValues({
          hba: formValues.hba,
          latitude: formValues.latitude,
          longitude: formValues.longitude,
        });
        setEditingLatitude({
          degrees: latitude.degrees,
          minutes: latitude.minutes,
          seconds: latitude.seconds,
          direction: latitude.direction,
        });

        setEditingLongitude({
          degrees: longitude.degrees,
          minutes: longitude.minutes,
          seconds: longitude.seconds,
          direction: longitude.direction,
        });
      }
    };

    useEffect(() => {
      setformValues((prev) => ({
        ...prev,
        site_type: siteInfo.site_type,
        los_result: siteInfo.altId,
      }));
      fetchSiteResult(
        setSite,
        setIsLoading,
        siteInfo.altId,
        siteInfo.site_type
      );
      if (siteInfo.losStatus === 3) {
        setformValues((prev) => ({ ...prev, hba: 0 }));
      }
    }, [siteInfo]);

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
          los_result: siteInfo.altId,
          site_type: siteInfo.site_type,
          hba: siteInfo.losStatus === 3 ? 0 : null,
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
    }, [site, siteInfo]);

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
              <h3 className="text-[19px] text-primary font-medium">
                Execution of {siteInfo.site_name}
              </h3>
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
                      if (editing) {
                        handleChange(e, setEditingFormValues);
                      } else {
                        handleChange(e, setformValues);
                      }
                    }}
                    value={
                      siteInfo.losStatus === 3
                        ? 0
                        : editing
                        ? editingFormValues.hba ?? ""
                        : formValues.hba ?? ""
                    }
                    disabled={
                      editing && siteInfo.losStatus !== 3
                        ? false
                        : Boolean(
                            site ||
                              siteInfo.losStatus === 3 ||
                              !siteInfo.losStatus ||
                              !siteInfo.accessibility
                          )
                    }
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
                      value={
                        editing
                          ? editingLatitude.degrees ?? ""
                          : latitude.degrees ?? ""
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        if (
                          value === "" ||
                          (/^\d+$/.test(value) &&
                            parseInt(value, 10) >= 0 &&
                            parseInt(value, 10) <= 90)
                        ) {
                          if (editing) {
                            handleDMSChange(
                              e,
                              setEditingLatitude,
                              true,
                              setEditingFormValues
                            );
                          } else {
                            handleDMSChange(
                              e,
                              setLatitude,
                              true,
                              setformValues
                            );
                          }
                        }
                      }}
                      disabled={
                        editing
                          ? false
                          : Boolean(
                              site ||
                                !siteInfo.losStatus ||
                                !siteInfo.accessibility
                            )
                      }
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
                      value={
                        editing
                          ? editingLatitude.minutes ?? ""
                          : latitude.minutes ?? ""
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        if (
                          value === "" ||
                          (/^\d+$/.test(value) &&
                            parseInt(value, 10) >= 0 &&
                            parseInt(value, 10) <= 59)
                        ) {
                          if (editing) {
                            handleDMSChange(
                              e,
                              setEditingLatitude,
                              true,
                              setEditingFormValues
                            );
                          } else {
                            handleDMSChange(
                              e,
                              setLatitude,
                              true,
                              setformValues
                            );
                          }
                        }
                      }}
                      disabled={
                        editing
                          ? false
                          : Boolean(
                              site ||
                                !siteInfo.losStatus ||
                                !siteInfo.accessibility
                            )
                      }
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
                      value={
                        editing
                          ? editingLatitude.seconds ?? ""
                          : latitude.seconds ?? ""
                      }
                      disabled={
                        editing
                          ? false
                          : Boolean(
                              site ||
                                !siteInfo.losStatus ||
                                !siteInfo.accessibility
                            )
                      }
                      onChange={(e) => {
                        const target = e.target;
                        const value = target.value.replace(",", "."); // Replace comma with dot

                        // Check if the value is valid
                        if (
                          value === "" ||
                          (parseFloat(value) >= 0 && parseFloat(value) <= 59.99)
                        ) {
                          if (editing) {
                            handleDMSChange(
                              e,
                              setEditingLatitude,
                              true,
                              setEditingFormValues
                            );
                          } else {
                            handleDMSChange(
                              e,
                              setLatitude,
                              true,
                              setformValues
                            );
                          }
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
                            checked={
                              editing
                                ? editingLatitude.direction === "N"
                                : latitude.direction === "N"
                            }
                            disabled={
                              editing
                                ? false
                                : Boolean(
                                    site ||
                                      !siteInfo.losStatus ||
                                      !siteInfo.accessibility
                                  )
                            }
                            onChange={(e) => {
                              if (editing) {
                                handleDMSDirectionChange(
                                  e,
                                  setEditingLatitude,
                                  true,
                                  setEditingFormValues
                                );
                              } else {
                                handleDMSDirectionChange(
                                  e,
                                  setLatitude,
                                  true,
                                  setformValues
                                );
                              }
                            }}
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
                            checked={
                              editing
                                ? editingLatitude.direction === "S"
                                : latitude.direction === "S"
                            }
                            disabled={
                              editing
                                ? false
                                : Boolean(
                                    site ||
                                      !siteInfo.losStatus ||
                                      !siteInfo.accessibility
                                  )
                            }
                            onChange={(e) => {
                              if (editing) {
                                handleDMSDirectionChange(
                                  e,
                                  setLatitude,
                                  true,
                                  setEditingFormValues
                                );
                              } else {
                                handleDMSDirectionChange(
                                  e,
                                  setLatitude,
                                  true,
                                  setformValues
                                );
                              }
                            }}
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
                    value={
                      editing
                        ? editingFormValues.latitude ?? ""
                        : formValues.latitude ?? ""
                    }
                    placeholder="Decimal"
                    className="rounded-[46px] h-[45px] border-[1px] border-n300 px-[24px] w-full"
                    disabled={
                      editing
                        ? false
                        : Boolean(
                            site ||
                              !siteInfo.losStatus ||
                              !siteInfo.accessibility
                          )
                    }
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
                        if (editing) {
                          updateDMSFromDecimal(
                            value,
                            setEditingLatitude,
                            true,
                            setEditingFormValues
                          );
                        } else {
                          updateDMSFromDecimal(
                            value,
                            setLatitude,
                            true,
                            setformValues
                          );
                        }
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
                      disabled={
                        editing
                          ? false
                          : Boolean(
                              site ||
                                !siteInfo.losStatus ||
                                !siteInfo.accessibility
                            )
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        if (
                          value === "" ||
                          (/^\d+$/.test(value) &&
                            parseInt(value, 10) >= 0 &&
                            parseInt(value, 10) <= 180)
                        ) {
                          if (editing) {
                            handleDMSChange(
                              e,
                              setEditingLongitude,
                              false,
                              setEditingFormValues
                            );
                          } else {
                            handleDMSChange(
                              e,
                              setLongitude,
                              false,
                              setformValues
                            );
                          }
                        }
                      }}
                      value={
                        editing
                          ? editingLongitude.degrees ?? ""
                          : longitude.degrees ?? ""
                      }
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
                      disabled={
                        editing
                          ? false
                          : Boolean(
                              site ||
                                !siteInfo.losStatus ||
                                !siteInfo.accessibility
                            )
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        if (
                          value === "" ||
                          (/^\d+$/.test(value) &&
                            parseInt(value, 10) >= 0 &&
                            parseInt(value, 10) <= 59)
                        ) {
                          if (editing) {
                            handleDMSChange(
                              e,
                              setEditingLongitude,
                              false,
                              setEditingFormValues
                            );
                          } else {
                            handleDMSChange(
                              e,
                              setLongitude,
                              false,
                              setformValues
                            );
                          }
                        }
                      }}
                      value={
                        editing
                          ? editingLongitude.minutes ?? ""
                          : longitude.minutes ?? ""
                      }
                    />
                    <input
                      type="text"
                      id="longitude-second"
                      className="rounded-[46px] h-[45px] border-[1px] border-n300 px-[24px] w-[28%]"
                      placeholder="Second"
                      name="seconds"
                      maxLength={12}
                      disabled={
                        editing
                          ? false
                          : Boolean(
                              site ||
                                !siteInfo.losStatus ||
                                !siteInfo.accessibility
                            )
                      }
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const target = e.target as HTMLInputElement;
                        const value = target.value.replace(",", "."); // Replace comma with dot

                        // Check if the value is valid
                        if (
                          value === "" ||
                          (parseFloat(value) >= 0 && parseFloat(value) <= 59.99)
                        ) {
                          if (editing) {
                            handleDMSChange(
                              e,
                              setEditingLongitude,
                              false,
                              setEditingFormValues
                            );
                          } else {
                            handleDMSChange(
                              e,
                              setLongitude,
                              false,
                              setformValues
                            );
                          }
                        }
                      }}
                      onInput={(e: React.FormEvent<HTMLInputElement>) => {
                        const target = e.target as HTMLInputElement;
                        target.value = target.value.replace(/[^\d,.]/g, "");
                      }}
                      value={
                        editing
                          ? editingLongitude.seconds ?? ""
                          : longitude.seconds ?? ""
                      }
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
                            checked={
                              editing
                                ? editingLongitude.direction === "E"
                                : longitude.direction === "E"
                            }
                            disabled={
                              editing
                                ? false
                                : Boolean(
                                    site ||
                                      !siteInfo.losStatus ||
                                      !siteInfo.accessibility
                                  )
                            }
                            onChange={(e) => {
                              if (editing) {
                                handleDMSDirectionChange(
                                  e,
                                  setEditingLongitude,
                                  false,
                                  setEditingFormValues
                                );
                              } else {
                                handleDMSDirectionChange(
                                  e,
                                  setLongitude,
                                  false,
                                  setformValues
                                );
                              }
                            }}
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
                            checked={
                              editing
                                ? editingLongitude.direction === "W"
                                : longitude.direction === "W"
                            }
                            disabled={
                              editing
                                ? false
                                : Boolean(
                                    site ||
                                      !siteInfo.losStatus ||
                                      !siteInfo.accessibility
                                  )
                            }
                            onChange={(e) => {
                              if (editing) {
                                handleDMSDirectionChange(
                                  e,
                                  setEditingLongitude,
                                  false,
                                  setEditingFormValues
                                );
                              } else {
                                handleDMSDirectionChange(
                                  e,
                                  setLongitude,
                                  false,
                                  setformValues
                                );
                              }
                            }}
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
                    value={
                      editing
                        ? editingFormValues.longitude ?? ""
                        : formValues.longitude ?? ""
                    }
                    placeholder="Decimal"
                    className="rounded-[46px] h-[45px] border-[1px] border-n300 px-[24px] w-full"
                    disabled={
                      editing
                        ? false
                        : Boolean(
                            site ||
                              !siteInfo.losStatus ||
                              !siteInfo.accessibility
                          )
                    }
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
                        if (editing) {
                          updateDMSFromDecimal(
                            value,
                            setEditingLongitude,
                            false,
                            setEditingFormValues
                          );
                        } else {
                          updateDMSFromDecimal(
                            value,
                            setLongitude,
                            false,
                            setformValues
                          );
                        }
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
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center">
                <div className="relative inline-block">
                  {errorUpdatingAccess && (
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
                        <div className="absolute left-[50%] top-1/2 transform -translate-y-1/2 ml-2 hidden group-hover:flex bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-40">
                          {
                            "This site already execute, you cant update it accessibility"
                          }
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div
                  className={`flex flex-row-reverse items-center gap-2 ml-2`}
                  title={site ? "This site already executed" : undefined}
                >
                  <label
                    htmlFor="access"
                    className={`font-medium text-n600  ${
                      site ? "cursor-not-allowed" : "cursor-pointer"
                    }`}
                  >
                    No access{" "}
                  </label>

                  <label
                    className={`relative inline-flex items-center ${
                      site ? "cursor-not-allowed" : "cursor-pointer"
                    }`}
                  >
                    <input
                      id="access"
                      name="access"
                      type="checkbox"
                      className="sr-only peer"
                      checked={!siteInfo.accessibility}
                      onChange={(e) => {
                        if (!isLoadingAccCheckBox && !site) {
                          // Prevent changing the toggle when loading is true

                          if (e.target.checked) {
                            updateAccessStatus(
                              siteInfo.site_type === 1
                                ? siteInfo.losId!
                                : siteInfo.altId!,
                              "POST",
                              siteInfo.site_type!,
                              setIsLoadingAccCheckBox,
                              setSelectedSiteInfo,
                              setErrorUpdatingAccess,
                              fetchOrder!
                            );
                          } else {
                            updateAccessStatus(
                              siteInfo.site_type === 1
                                ? siteInfo.losId!
                                : siteInfo.altId!,
                              "DELETE",
                              siteInfo.site_type!,
                              setIsLoadingAccCheckBox,
                              setSelectedSiteInfo,
                              setErrorUpdatingAccess,
                              fetchOrder!
                            );
                          }
                        }
                      }}
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-1 dark:peer-focus:ring-n700 rounded-full peer dark:bg-n500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#4A3AFF]"></div>
                  </label>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {site && (
                  <button
                    className={`rounded-[86px] px-[45px] py-[10px]  text-[14px]  font-semibold border-[1px]  flex items-center justify-center border-n400 bg-n300 text-n600`}
                    onClick={handleSeconderyButton}
                    disabled={!site}
                  >
                    {loadingFirstSubmit ? (
                      <RotatingLines strokeColor="white" width="20" />
                    ) : editing ? (
                      "Cancel"
                    ) : (
                      "Edit"
                    )}
                  </button>
                )}

                <button
                  className={`rounded-[86px] px-[45px] py-[10px]  text-[14px]  font-semibold border-[1px]  flex items-center justify-center ${
                    siteInfo.losStatus
                      ? "border-primary bg-primary text-white"
                      : "border-n400 bg-n400 text-n500"
                  }`}
                  onClick={handleFirst}
                  disabled={!siteInfo.losStatus}
                >
                  {loadingFirstSubmit ? (
                    <RotatingLines strokeColor="white" width="20" />
                  ) : editing ? (
                    "Save"
                  ) : (
                    "Next"
                  )}
                </button>
              </div>
            </div>{" "}
          </>
        ) : currentSliderIndex === 2 ? (
          <SiteLocationPopup
            setCurrentSliderIndex={setCurrentSliderIndex}
            site={site}
          />
        ) : currentSliderIndex === 3 ? (
          <SitePositionPopup
            setCurrentSliderIndex={setCurrentSliderIndex}
            site={site}
          />
        ) : (
          <SiteAdditionalPicsPopup
            ref={ref}
            setCurrentSliderIndex={setCurrentSliderIndex}
            site={site}
            image_count={siteInfo.image_count}
            fetchOneOrder={fetchOrder}
          />
        )}

        <button
          className="close-button absolute top-4 right-8 text-[30px] text-550 hover:-rotate-3 transition-transform duration-300 hover:text-n600"
          aria-label="Close"
          onClick={handleClose}
        >
          &times;
        </button>
      </dialog>
    );
  }
);

export default LosExcutionPopup;
