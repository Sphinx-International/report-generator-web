import { forwardRef, useState, useEffect, FormEvent, MouseEvent } from "react";
import { handleCloseDialog } from "../../func/openDialog";
import CustomSelect from "../CustomSelect";
import { ReqSite } from "../../assets/types/LosSites";
import { handleCreateSite } from "../../func/los/Sites";
import {
  validateForm1,
  SiteFormErrors,
  validateForm2,
} from "../../func/los/validation/Validation";
import { RotatingLines } from "react-loader-spinner";

interface CreateSitePopupProps {
  fetchSites: () => void;
}

const CreateSitePopup = forwardRef<HTMLDialogElement, CreateSitePopupProps>(
  ({ fetchSites }, ref) => {
    const [currPage, setCurrPage] = useState<1 | 2>(1);

    const [regionNumber, setRegionNumber] = useState<1 | 2 | 3>(1);
    const [siteType, setSiteType] = useState<1 | 2 | 3 | 4 | 5>(1);
    const [validationErrors, setvalidationErrors] = useState<SiteFormErrors>();

    type DimensionDMS = {
      degrees: number | null;
      minutes: number | null;
      seconds: number | string | null;
      direction: "N" | "S" | "E" | "W";
    };

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

    console.log(formValue.latitude);

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

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target;

      // Casting `value` based on the key type
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

    const decimalToDMS = (decimal: number, isLatitude: boolean = true) => {
      const degrees = Math.floor(Math.abs(decimal));
      const minutesDecimal = (Math.abs(decimal) - degrees) * 60;
      const minutes = Math.floor(minutesDecimal);
      const seconds = ((minutesDecimal - minutes) * 60).toFixed(8);

      const direction = isLatitude
        ? decimal >= 0
          ? "N"
          : "S"
        : decimal >= 0
        ? "E"
        : "W";

      return {
        degrees: degrees,
        minutes: minutes,
        seconds: parseFloat(seconds),
        direction: direction as "N" | "S" | "E" | "W",
      };
    };

    const updateDMSFromDecimal = (
      decimal: string,
      setDMS: React.Dispatch<
        React.SetStateAction<{
          degrees: number | null;
          minutes: number | null;
          seconds: number | string | null;
          direction: "N" | "S" | "E" | "W";
        }>
      >,
      isLatitude: boolean
    ) => {
      const { degrees, minutes, seconds, direction } = decimalToDMS(
        Number(decimal),
        isLatitude
      );

      setDMS({
        degrees: degrees ?? null,
        minutes: minutes ?? null,
        seconds: seconds ?? null,
        direction: direction as "N" | "S" | "E" | "W",
      });

      // Update formValue with the decimal value
      setFormValue((prevFormValue) => ({
        ...prevFormValue,
        [isLatitude ? "latitude" : "longitude"]: decimal,
      }));
    };

    function DMSToDecimal(
      degrees: number,
      minutes: number,
      seconds: number,
      direction: "N" | "S" | "E" | "W"
    ): number {
      let decimal =
        Number(degrees) + Number(minutes) / 60 + Number(seconds) / 3600;

      // Make decimal negative if direction is S (south) or W (west)
      if (direction === "S" || direction === "W") {
        decimal = -decimal;
      }

      return decimal;
    }

    const handleDMSChange = (
      e: React.ChangeEvent<HTMLInputElement>,
      setDMS: React.Dispatch<React.SetStateAction<DimensionDMS>>,
      isLatitude: boolean
    ) => {
      const { name, value } = e.target;

      setDMS((prevState) => {
        const updatedState = {
          ...prevState,
          [name]: value === "" ? null : value,
        };

        // Determine the direction based on isLatitude flag
        const decimalValue = DMSToDecimal(
          updatedState.degrees || 0, // Use 0 if null for calculation
          updatedState.minutes || 0,
          Number(updatedState.seconds) || 0,
          updatedState.direction
        );

        setFormValue((prevFormValue) => ({
          ...prevFormValue,
          [isLatitude ? "latitude" : "longitude"]: decimalValue,
        }));

        return updatedState;
      });
    };

    const handleDMSDirectionChange = (
      e: React.ChangeEvent<HTMLInputElement>,
      setDMS: React.Dispatch<React.SetStateAction<DimensionDMS>>,
      isLatitude: boolean
    ) => {
      const { value } = e.target;

      setDMS((prevState) => {
        const updatedState = {
          ...prevState,
          direction: value as "N" | "S" | "E" | "W",
        };

        const decimalValue = DMSToDecimal(
          updatedState.degrees || 0,
          updatedState.minutes || 0,
          Number(updatedState.seconds) || 0,
          updatedState.direction
        );

        setFormValue((prevFormValue) => ({
          ...prevFormValue,
          [isLatitude ? "latitude" : "longitude"]: decimalValue,
        }));

        return updatedState;
      });
    };

    const handleFirstSubmit = (
      e: FormEvent<HTMLFormElement> | MouseEvent<HTMLButtonElement>
    ) => {
      e.preventDefault();
      setvalidationErrors({});
      const formErrors = validateForm1(formValue);
      if (Object.keys(formErrors).length === 0) {
        setCurrPage(2);
        setvalidationErrors({});
      } else {
        setvalidationErrors(formErrors);
      }
    };

    const handleSecondSubmit = (
      e: FormEvent<HTMLFormElement> | MouseEvent<HTMLButtonElement>
    ) => {
      e.preventDefault();
      setvalidationErrors({});
      const formErrors = validateForm2(formValue);
      if (Object.keys(formErrors).length === 0) {
        handleCreateSite(formValue, setloading, ref, fetchSites);
        setvalidationErrors({});
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
        className="bg-white rounded-[40px] px-[32px] pt-[24px] pb-[40px] hidden flex-col items-center gap-[20px] sm:w-[55%] absolute left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%] overflow-visible"
      >
        {currPage === 1 ? (
          <div className="flex flex-col gap-5 items-end ">
            <div className="flex flex-col w-full gap-[18px]">
              <div className="flex items-center gap-4 w-full">
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
                      className="text-[15px] text-550 leading-[20px] font-medium"
                    >
                      Site Code
                    </label>
                  </div>

                  <input
                    type="text"
                    name="code"
                    value={formValue.code}
                    onChange={handleChange}
                    className={`w-full rounded-[46px] h-[45px] border-[1px] border-n300 px-[24px]`}
                    placeholder={"Enter site code"}
                  />
                </div>
                <div className="flex flex-col items-start gap-[5px] w-[50%]">
                  <label
                    htmlFor="region"
                    className="text-[15px] text-550 leading-[20px] font-medium"
                  >
                    Region
                  </label>
                  <CustomSelect
                    options={["EAST", "CENTER", "WEST"]}
                    setState={setRegionNumber}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4 w-full">
                <div className="flex flex-col items-start gap-[5px] w-[33%%]">
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
                      className="text-[15px] text-550 leading-[20px] font-medium"
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
                    className="w-full rounded-[46px] h-[45px] border-[1px] border-n300 px-[24px]"
                    placeholder="Enter wilaya"
                    maxLength={15}
                  />
                </div>
                <div className="flex flex-col items-start gap-[5px] w-[33%]">
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
                      className="text-[15px] text-550 leading-[20px] font-medium"
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
                    className="w-full rounded-[46px] h-[45px] border-[1px] border-n300 px-[24px]"
                    placeholder="select daira"
                    maxLength={20}
                  />
                </div>
                <div className="flex flex-col items-start gap-[5px] w-[33%]">
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
                      className="text-[15px] text-550 leading-[20px] font-medium"
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
                    className="w-full rounded-[46px] h-[45px] border-[1px] border-n300 px-[24px]"
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
                        handleDMSChange(e, setLatitude, true);
                      }
                    }}
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
                        handleDMSChange(e, setLatitude, true);
                      }
                    }}
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

                        handleDMSChange(modifiedEvent, setLatitude, true);
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
                            handleDMSDirectionChange(e, setLatitude, true)
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
                          onChange={(e) =>
                            handleDMSDirectionChange(e, setLatitude, true)
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
                  type="text" // Change type to "text" to allow commas and signs
                  id="dec-latitude"
                  name="latitude"
                  value={formValue.latitude ? formValue.latitude : ""}
                  placeholder="Decimal"
                  className="rounded-[46px] h-[45px] border-[1px] border-n300 px-[24px] w-full"
                  onChange={(e) => {
                    const target = e.target;
                    const value = target.value.replace(",", "."); // Replace comma with dot

                    if (
                      value === "" ||
                      (/^[-+]?\d*\.?\d*$/.test(value) &&
                        parseFloat(value) >= -90 &&
                        parseFloat(value) <= 90)
                    ) {
                      updateDMSFromDecimal(value, setLatitude, true);
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
                      (target.value.includes(",") || target.value.includes("."))
                    ) {
                      e.preventDefault();
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
                    onChange={(e) => {
                      const value = e.target.value;
                      if (
                        value === "" ||
                        (/^\d+$/.test(value) &&
                          parseInt(value, 10) >= 0 &&
                          parseInt(value, 10) <= 180)
                      ) {
                        handleDMSChange(e, setLongitude, false);
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
                    onChange={(e) => {
                      const value = e.target.value;
                      if (
                        value === "" ||
                        (/^\d+$/.test(value) &&
                          parseInt(value, 10) >= 0 &&
                          parseInt(value, 10) <= 59)
                      ) {
                        handleDMSChange(e, setLongitude, false);
                      }
                    }}
                    value={longitude.minutes ? longitude.minutes : ""}
                  />
                  <input
                    type="text" // Change type to "text" to allow commas
                    id="longitude-second"
                    className="rounded-[46px] h-[45px] border-[1px] border-n300 px-[24px] w-[28%]"
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
                        handleDMSChange(modifiedEvent, setLongitude, false);
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
                            handleDMSDirectionChange(e, setLongitude, false)
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
                          onChange={(e) =>
                            handleDMSDirectionChange(e, setLongitude, false)
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
                  value={formValue.longitude ? formValue.longitude : ""}
                  placeholder="Decimal"
                  className="rounded-[46px] h-[45px] border-[1px] border-n300 px-[24px] w-full"
                  onChange={(e) => {
                    const target = e.target;
                    const value = target.value.replace(",", ".");

                    if (
                      value === "" ||
                      (/^[-+]?\d*\.?\d*$/.test(value) &&
                        parseFloat(value) >= -180 &&
                        parseFloat(value) <= 180)
                    ) {
                      updateDMSFromDecimal(value, setLongitude, false);
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
                      (target.value.includes(",") || target.value.includes("."))
                    ) {
                      e.preventDefault();
                    }
                  }}
                />
              </div>
            </div>
            <div className="flex items-center gap-[6px]">
              <button
                className="py-[10px] w-[130px] rounded-[86px] border-[1px] border-n400 bg-n300 text-[14px] text-n600 font-semibold"
                onClick={() => {
                  handleCloseDialog(ref);
                }}
              >
                Cancel
              </button>
              <button
                className="py-[10px] w-[130px] rounded-[86px] border-[1px] border-primary bg-primary text-[14px] text-white font-semibold"
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
                      className="text-[15px] text-550 leading-[20px] font-medium"
                    >
                      Building height
                    </label>
                  </div>
                  <input
                    type="text"
                    name="building_height"
                    value={formValue.building_height ?? ""}
                    id="building-height"
                    className="w-full rounded-[46px] h-[45px] border-[1px] border-n300 px-[24px]"
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
                      className="text-[15px] text-550 leading-[20px] font-medium"
                    >
                      Site height
                    </label>
                  </div>
                  <input
                    type="text"
                    id="gm-height"
                    name="site_height"
                    value={formValue.site_height ?? ""}
                    onChange={handleChange}
                    className="w-full rounded-[46px] h-[45px] border-[1px] border-n300 px-[24px]"
                    placeholder="XX m"
                  />
                </div>
              </div>
              <div className="flex items-center gap-5 w-full">
                <div className="flex flex-col items-start gap-[5px] w-full">
                  <label
                    htmlFor="type"
                    className="text-[15px] text-550 leading-[20px] font-medium"
                  >
                    Type of Site
                  </label>
                  <CustomSelect
                    options={[
                      "Building Rooftop (RT)",
                      "Wall Tower (WT)",
                      "Microcell (MICRO)",
                      "Greenfield (GF)",
                      "Mobile Station (MS)"
                    ]}
                    setState={setSiteType}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-[6px]">
              <button
                className="py-[10px] w-[130px] rounded-[86px] border-[1px] border-n400 bg-n300 text-[14px] text-n600 font-semibold"
                onClick={() => {
                  setCurrPage(1);
                }}
              >
                previous
              </button>
              <button
                className="py-[10px] w-[130px] flex items-center justify-center rounded-[86px] border-[1px] border-primary bg-primary text-[14px] text-white font-semibold"
                onClick={(e) => {
                  handleSecondSubmit(e);
                }}
              >
                {loading ? (
                  <RotatingLines strokeColor="white" width="20" />
                ) : (
                  "Create"
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
