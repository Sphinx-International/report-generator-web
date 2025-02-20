import { forwardRef, useState, useEffect, FormEvent, MouseEvent } from "react";
import { handleCloseDialog } from "../../func/openDialog";
import CustomSelect from "../CustomSelect";
import { ReqSite } from "../../assets/types/LosSites";
import { handleCreateSite, addSiteLocation } from "../../func/los/Sites";
import {
  validateForm1,
  SiteFormErrors,
  validateForm2,
  validateRelocateSiteForm1,
} from "../../func/los/validation/Validation";
import { RotatingLines } from "react-loader-spinner";
import {
  updateDMSFromDecimal,
  handleDMSChange,
  handleDMSDirectionChange,
  DimensionDMS,
} from "../../func/los/Dms_Decimal";

interface CreateSitePopupProps {
  fetchSites: () => void;
  method: "create" | "update";
  siteId?: number;
}

const CreateSitePopup = forwardRef<HTMLDialogElement, CreateSitePopupProps>(
  ({ fetchSites, method, siteId }, ref) => {
    const [currPage, setCurrPage] = useState<1 | 2>(1);

    const [regionNumber, setRegionNumber] = useState<1 | 2 | 3>(1);
    const [siteType, setSiteType] = useState<1 | 2 | 3 | 4 | 5>(1);
    const [validationErrors, setvalidationErrors] = useState<SiteFormErrors>();

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

    const [formValue, setFormValue] = useState<ReqSite>({
      code: "",
      region: regionNumber,
      state: "",
      district: "",
      municipality: "",
      type: siteType,
      building_height: null,
      site_height: null,
      latitude: null,
      longitude: null,
    });    

    const [loading, setloading] = useState<boolean>(false);

    const updateFormValue = <K extends keyof ReqSite>(
      key: K,
      value: ReqSite[K]
    ) => {
      setFormValue((prevState) => ({
        ...prevState,
        [key]: value,
      }));
    };

    const clearState = () => {
      console.log('SUCCESS');
      setvalidationErrors({});
        setFormValue({
          code: "",
          region: regionNumber,
          state: "",
          district: "",
          municipality: "",
          type: siteType,
          building_height: null,
          site_height: null,
          latitude: null,
          longitude: null,
        });
        setCurrPage(1);
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
        setSiteType(1);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target;

      if (
        name === "region" ||
        name === "type" ||
        name === "building_height" ||
        name === "site_height"
      ) {
        updateFormValue(
          name as keyof ReqSite,
          value === "" ? null : Number(value)
        );
      } else if (name === "latitude" || name === "longitude") {
        updateFormValue(
          name as keyof ReqSite,
          value === "" ? null : parseFloat(value)
        );
      } else {
        updateFormValue(name as keyof ReqSite, value);
      }
    };

    const handleFirstSubmit = (
      e: FormEvent<HTMLFormElement> | MouseEvent<HTMLButtonElement>
    ) => {
      e.preventDefault();
      setvalidationErrors({});
      const formErrors =
        method === "create"
          ? validateForm1(formValue)
          : validateRelocateSiteForm1(formValue);
      if (Object.keys(formErrors).length === 0) {
        setCurrPage(2);
        setvalidationErrors({});
      } else {
        setvalidationErrors(formErrors);
      }
    };

    const handleSecondSubmit = async (
      e: FormEvent<HTMLFormElement> | MouseEvent<HTMLButtonElement>
    ) => {
      e.preventDefault();
      setvalidationErrors({});
      const formErrors = validateForm2(formValue);
      if (Object.keys(formErrors).length === 0) {
        method === "create"
          ? await handleCreateSite(formValue, setloading, ref, fetchSites, clearState)
          : await addSiteLocation(
              {
                site: siteId!,
                district: formValue.district,
                municipality: formValue.municipality,
                type: formValue.type,
                building_height: formValue.building_height!,
                site_height: formValue.site_height!,
                latitude: formValue.latitude!,
                longitude: formValue.longitude!,
              },
              setloading
            );
      } else {
        setvalidationErrors(formErrors);
      }
    };

    useEffect(() => {
      setFormValue((prevFormValue) => ({
        ...prevFormValue,
        region: regionNumber,
        type: siteType,
        building_height:
          siteType === 4 || siteType === 5 ? 0 : prevFormValue.building_height,
      }));
    }, [regionNumber, siteType]);

    return (
      <dialog
        ref={ref}
        className="bg-white rounded-[40px] px-[32px] pt-[24px] pb-[40px] hidden flex-col items-center gap-[20px] sm:w-[78%] lg:w-[55%] w-[90%] absolute left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%] overflow-visible"
      >
        {currPage === 1 ? (
          <div className="flex flex-col gap-5 items-end ">
            <div className="flex flex-col w-full gap-[18px]">
              <div
                className={` items-center gap-4 w-full ${
                  method === "create" ? "flex" : "hidden"
                }`}
              >
                <div className="flex flex-col items-start gap-[5px] w-[50%]">
                  <div className="flex items-center">
                    <div className="relative inline-block">
                      {validationErrors?.siteCode && (
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
                              {validationErrors.siteCode}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <label
                      htmlFor="site-code"
                      className="text-[13px] sm:text-[15px] text-550 leading-[20px] font-medium"
                    >
                      Site Code
                    </label>
                  </div>

                  <input
                    type="text"
                    name="code"
                    value={formValue.code}
                    onChange={handleChange}
                    className={`w-full rounded-[46px] h-[35px] sm:h-[45px] border-[1px] border-n300 px-[24px] sm:text-[16px] text-[13px]`}
                    placeholder={"Enter site code"}
                  />
                </div>
                <div className="flex flex-col items-start gap-[5px] w-[50%]">
                  <label
                    htmlFor="region"
                    className="text-[13px] sm:text-[15px] text-550 leading-[20px] font-medium"
                  >
                    Region
                  </label>
                  <CustomSelect
                    options={["EAST", "CENTER", "WEST"]}
                    setState={setRegionNumber}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4 w-full flex-wrap sm:flex-nowrap">
                <div
                  className={`flex flex-col items-start gap-[5px] w-[33%] flex-grow ${
                    method === "create" ? "flex" : "hidden"
                  }`}
                >
                  <div className="flex items-center">
                    <div className="relative inline-block">
                      {validationErrors?.wilaya && (
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
                              {validationErrors.wilaya}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <label
                      htmlFor="wilaya"
                      className="text-[13px] sm:text-[15px] text-550 leading-[20px] font-medium"
                    >
                      Wilaya
                    </label>
                  </div>
                  <input
                    type="text"
                    id="wilaya"
                    name="state"
                    value={formValue.state}
                    onChange={handleChange}
                    className="w-full rounded-[46px] h-[35px] sm:h-[45px] border-[1px] border-n300 px-[24px] sm:text-[16px] text-[13px]"
                    placeholder="Enter wilaya"
                    maxLength={15}
                  />
                </div>
                <div className="flex flex-col items-start gap-[5px] w-[33%] flex-grow">
                  <div className="flex items-center">
                    <div className="relative inline-block">
                      {validationErrors?.daira && (
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
                              {validationErrors.daira}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <label
                      htmlFor="daira"
                      className="text-[13px] sm:text-[15px] text-550 leading-[20px] font-medium"
                    >
                      Daira
                    </label>
                  </div>
                  <input
                    type="text"
                    id="daira"
                    name="district"
                    value={formValue.district}
                    onChange={handleChange}
                    className="w-full rounded-[46px] h-[35px] sm:h-[45px] border-[1px] border-n300 px-[24px] sm:text-[16px] text-[13px]"
                    placeholder="select daira"
                    maxLength={20}
                  />
                </div>
                <div className="flex flex-col items-start gap-[5px] w-[33%] flex-grow">
                  <div className="flex items-center">
                    <div className="relative inline-block">
                      {validationErrors?.baladia && (
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
                              {validationErrors.baladia}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <label
                      htmlFor="baladia"
                      className="text-[13px] sm:text-[15px] text-550 leading-[20px] font-medium"
                    >
                      Baladia
                    </label>
                  </div>
                  <input
                    type="text"
                    id="baladia"
                    name="municipality"
                    value={formValue.municipality}
                    onChange={handleChange}
                    className="w-full rounded-[46px] h-[35px] sm:h-[45px] border-[1px] border-n300 px-[24px] sm:text-[16px] text-[13px]"
                    placeholder="select baladia"
                    maxLength={30}
                  />
                </div>
              </div>
              <div className="flex flex-col items-start gap-[10px] w-full">
                <div className="flex items-center">
                  <div className="relative inline-block">
                    {validationErrors?.latitude && (
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
                            {validationErrors.latitude}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <label
                    htmlFor="latitude"
                    className="text-[13px] sm:text-[15px] text-550 leading-[20px] font-medium"
                  >
                    Latitude
                  </label>
                </div>
                <div className="flex items-center justify-center w-full gap-3 flex-wrap sm:flex-nowrap">
                  <input
                    type="text"
                    id="degrees"
                    className="rounded-[46px] h-[35px] sm:h-[45px] border-[1px] border-n300 px-[24px] w-[28%] flex-grow sm:text-[16px] text-[13px]"
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
                        handleDMSChange(e, setLatitude, true, setFormValue);
                      }
                    }}
                  />
                  <input
                    type="text"
                    id="minutes"
                    className="rounded-[46px] h-[35px] sm:h-[45px] border-[1px] border-n300 px-[24px] w-[28%] flex-grow sm:text-[16px] text-[13px]"
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
                        handleDMSChange(e, setLatitude, true, setFormValue);
                      }
                    }}
                  />
                  <input
                    type="text" // Change type to "text" to allow commas
                    id="latitude-second"
                    className="rounded-[46px] h-[35px] sm:h-[45px] border-[1px] border-n300 px-[24px] w-[28%] flex-grow sm:text-[16px] text-[13px]"
                    placeholder="Second"
                    min={0}
                    max={59.99}
                    maxLength={12}
                    name="seconds"
                    value={latitude.seconds ?? ""}
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
                          setFormValue
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
                          onChange={(e) =>
                            handleDMSDirectionChange(
                              e,
                              setLatitude,
                              true,
                              setFormValue
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
                        className="text-primary text-[13px] sm:text-[15px] font-medium leading-[15px]"
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
                          onChange={(e) =>
                            handleDMSDirectionChange(
                              e,
                              setLatitude,
                              true,
                              setFormValue
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
                        className="text-primary text-[13px] sm:text-[15px] font-medium leading-[15px]"
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
                  value={formValue.latitude || ""}
                  placeholder="Decimal"
                  className="rounded-[46px] h-[35px] sm:h-[45px] border-[1px] border-n300 px-[24px] w-full sm:text-[16px] text-[13px]"
                  onChange={(e) => {
                    let value = e.target.value.replace(",", "."); // Replace comma with dot

                    if (value.startsWith("-")) {
                      value = "-" + value.slice(1).replace(/[^0-9.]/g, "");
                    } else {
                      value = value.replace(/[^0-9.]/g, "");
                    }

                    if (value.split(".").length > 2) {
                      value = value.slice(0, -1);
                    }

                    if (
                      value === "" || // Allow clearing the input
                      value === "-" || // Allow just a minus sign initially
                      (/^-?\d*\.?\d*$/.test(value) &&
                        parseFloat(value) >= -90 &&
                        parseFloat(value) <= 90)
                    ) {
                      updateDMSFromDecimal(
                        value,
                        setLatitude,
                        true,
                        setFormValue
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
                      (target.value.includes(",") || target.value.includes("."))
                    ) {
                      e.preventDefault(); // Prevent multiple decimal points
                    }
                  }}
                />
              </div>
              <div className="flex flex-col items-start gap-[10px] w-full">
                <div className="flex items-center">
                  <div className="relative inline-block">
                    {validationErrors?.longitude && (
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
                            {validationErrors.longitude}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <label
                    htmlFor="longitude"
                    className="text-[13px] sm:text-[15px] text-550 leading-[20px] font-medium"
                  >
                    Longitude
                  </label>
                </div>
                <div className="flex items-center justify-center w-full gap-3 flex-wrap sm:flex-nowrap">
                  <input
                    type="text"
                    id="longitude-degree"
                    className="rounded-[46px] h-[35px] sm:h-[45px] border-[1px] border-n300 px-[24px] w-[28%] flex-grow sm:text-[16px] text-[13px]"
                    placeholder="Degree"
                    min={0}
                    max={180}
                    maxLength={3}
                    name="degrees"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (
                        value === "" ||
                        (/^\d+$/.test(value) &&
                          parseInt(value, 10) >= 0 &&
                          parseInt(value, 10) <= 180)
                      ) {
                        handleDMSChange(e, setLongitude, false, setFormValue);
                      }
                    }}
                    value={longitude.degrees ? longitude.degrees : ""}
                  />
                  <input
                    type="text"
                    id="longitude-minute"
                    className="rounded-[46px] h-[35px] sm:h-[45px] border-[1px] border-n300 px-[24px] w-[28%] flex-grow sm:text-[16px] text-[13px]"
                    placeholder="Minute"
                    min={0}
                    max={59}
                    maxLength={2}
                    name="minutes"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (
                        value === "" ||
                        (/^\d+$/.test(value) &&
                          parseInt(value, 10) >= 0 &&
                          parseInt(value, 10) <= 59)
                      ) {
                        handleDMSChange(e, setLongitude, false, setFormValue);
                      }
                    }}
                    value={longitude.minutes ? longitude.minutes : ""}
                  />
                  <input
                    type="text" // Change type to "text" to allow commas
                    id="longitude-second"
                    className="rounded-[46px] h-[35px] sm:h-[45px] border-[1px] border-n300 px-[24px] w-[28%] flex-grow sm:text-[16px] text-[13px]"
                    placeholder="Second"
                    name="seconds"
                    maxLength={12}
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
                          setFormValue
                        );
                      }
                    }}
                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                      const target = e.target as HTMLInputElement;
                      // Allow digits, commas, and dots
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
                          onChange={(e) =>
                            handleDMSDirectionChange(
                              e,
                              setLongitude,
                              false,
                              setFormValue
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
                        className="text-primary text-[13px] sm:text-[15px] font-medium leading-[15px]"
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
                          onChange={(e) =>
                            handleDMSDirectionChange(
                              e,
                              setLongitude,
                              false,
                              setFormValue
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
                        className="text-primary text-[13px] sm:text-[15px] font-medium leading-[15px]"
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
                  value={formValue.longitude || ""}
                  placeholder="Decimal"
                  className="rounded-[46px] h-[35px] sm:h-[45px] border-[1px] border-n300 px-[24px] w-full sm:text-[16px] text-[13px]"
                  onChange={(e) => {
                    let value = e.target.value.replace(",", "."); // Replace comma with dot

                    // Allow only a minus at the beginning, numbers, and a single dot
                    if (value.startsWith("-")) {
                      value = "-" + value.slice(1).replace(/[^0-9.]/g, "");
                    } else {
                      value = value.replace(/[^0-9.]/g, "");
                    }

                    // Ensure only one decimal point
                    if (value.split(".").length > 2) {
                      value = value.slice(0, -1); // Remove extra dots
                    }

                    // Allow an empty string, a single "-", or values within range -180 to 180
                    if (
                      value === "" || // Allow clearing the input
                      value === "-" || // Allow just a minus sign initially
                      (/^-?\d*\.?\d*$/.test(value) &&
                        parseFloat(value) >= -180 &&
                        parseFloat(value) <= 180)
                    ) {
                      updateDMSFromDecimal(
                        value,
                        setLongitude,
                        false,
                        setFormValue
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
                      (target.value.includes(",") || target.value.includes("."))
                    ) {
                      e.preventDefault(); // Prevent multiple decimal points
                    }
                  }}
                />
              </div>
            </div>
            <div className="flex items-center gap-[6px]">
              <button
                className="py-[6px] sm:py-[10px] w-[100px] sm:w-[130px] rounded-[86px] border-[1px] border-n400 bg-n300 text-[14px] text-n600 font-semibold"
                onClick={() => {
                  handleCloseDialog(ref);
                }}
              >
                Cancel
              </button>
              <button
                className="py-[6px] sm:py-[10px] w-[100px] sm:w-[130px] rounded-[86px] border-[1px] border-primary bg-primary text-[14px] text-white font-semibold"
                onClick={(e) => {
                  handleFirstSubmit(e);
                }}
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-8 items-end w-full">
            <div className="flex flex-col w-full gap-[25px]">
              <div className="flex items-center gap-5 w-full">
                <div className="flex flex-col items-start gap-[5px] w-[50%]">
                  <div className="flex items-center">
                    <div className="relative inline-block">
                      {validationErrors?.buildingHeight && (
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
                              {validationErrors.buildingHeight}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <label
                      htmlFor="building_height"
                      className="text-[13px] sm:text-[15px] text-550 leading-[20px] font-medium"
                    >
                      Building height
                    </label>
                  </div>
                  <input
                    type="text"
                    name="building_height"
                    value={formValue.building_height ?? ""}
                    id="building-height"
                    className="w-full rounded-[46px] h-[35px] sm:h-[45px] border-[1px] border-n300 px-[24px] sm:text-[16px] text-[13px]"
                    placeholder="XX m"
                    disabled={siteType === 4 || siteType === 5 ? true : false}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || parseInt(value, 10) >= 0) {
                        handleChange(e);
                      }
                    }}
                  />
                </div>
                <div className="flex flex-col items-start gap-[5px] w-[50%]">
                  <div className="flex items-center">
                    <div className="relative inline-block">
                      {validationErrors?.siteHeight && (
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
                              {validationErrors.siteHeight}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <label
                      htmlFor="site_height"
                      className="text-[13px] sm:text-[15px] text-550 leading-[20px] font-medium"
                    >
                      Structure height
                    </label>
                  </div>
                  <input
                    type="text"
                    id="gm-height"
                    name="site_height"
                    value={formValue.site_height ?? ""}
                    onChange={handleChange}
                    className="w-full rounded-[46px] h-[35px] sm:h-[45px] border-[1px] border-n300 px-[24px] sm:text-[16px] text-[13px]"
                    placeholder="XX m"
                  />
                </div>
              </div>
              <div className="flex items-center gap-5 w-full">
                <div className="flex flex-col items-start gap-[5px] w-full">
                  <label
                    htmlFor="type"
                    className="text-[13px] sm:text-[15px] text-550 leading-[20px] font-medium"
                  >
                    Type of Site
                  </label>
                  <CustomSelect
                    options={[
                      "Building Rooftop (RT)",
                      "Wall Tower (WT)",
                      "Microcell (MICRO)",
                      "Greenfield (GF)",
                      "Mobile Station (MS)",
                    ]}
                    setState={setSiteType}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-[6px]">
              <button
                className="py-[6px] sm:py-[10px] w-[100px] sm:w-[130px] rounded-[86px] border-[1px] border-n400 bg-n300 text-[14px] text-n600 font-semibold"
                onClick={() => {
                  setCurrPage(1);
                }}
              >
                previous
              </button>
              <button
                className="py-[6px] sm:py-[10px] w-[100px] sm:w-[130px] flex items-center justify-center rounded-[86px] border-[1px] border-primary bg-primary text-[14px] text-white font-semibold"
                onClick={(e) => {
                  handleSecondSubmit(e);
                }}
              >
                {loading ? (
                  <RotatingLines strokeColor="white" width="20" />
                ) : method === "create" ? (
                  "Create"
                ) : (
                  "Relocate"
                )}
              </button>
            </div>
          </div>
        )}
      </dialog>
    );
  }
);

export default CreateSitePopup;
