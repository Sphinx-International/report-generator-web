import SideBar from "../../components/SideBar";
import Header from "../../components/Header";
import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { updateSiteCode, updateSiteinfo } from "../../func/los/Sites";
import { ResOfOneSite } from "../../assets/types/LosSites";
import { RotatingLines } from "react-loader-spinner";
import {
  DimensionDMS,
  decimalToDMS,
  handleDMSChange,
  handleDMSDirectionChange,
  updateDMSFromDecimal,
} from "../../func/los/Dms_Decimal";
import CreateSitePopup from "../../components/los/CreateSitePopup";
import { handleOpenDialog } from "../../func/openDialog";
import { getRole } from "../../func/getUserRole";
const baseUrl = import.meta.env.VITE_BASE_URL;

type SiteLocationUpdate = {
  code?: string;
  district?: string;
  municipality?: string;
  type?: 1 | 2 | 3 | 4 | 5;
  building_height?: number;
  site_height?: number;
  latitude?: number;
  longitude?: number;
};
export type EditingFields = {
  [K in keyof SiteLocationUpdate]: boolean;
};

const EditSite = () => {
  const { id } = useParams();
  const relocateSiteRef = useRef<HTMLDialogElement>(null);

  const [openDivs, setOpenDivs] = useState<number[]>([]);
  const [site, setSite] = useState<ResOfOneSite | null>(null);
  const [loader, setLoader] = useState<boolean>(false);
  const [editing, setEditing] = useState<EditingFields>({
    code: false,
    district: false,
    municipality: false,
    type: false,
    building_height: false,
    site_height: false,
    latitude: false,
    longitude: false,
  });
  const [editedFields, setEditedFields] = useState<SiteLocationUpdate>({});
  const [editCodeLoader, setEditCodeLoader] = useState<boolean>(false);

  const [dmsLatitude, setDmsLatitude] = useState<DimensionDMS>({
    degrees: null,
    minutes: null,
    seconds: null,
    direction: "N",
  });
  const [dmsLongtitude, setDmsLongtitude] = useState<DimensionDMS>({
    degrees: null,
    minutes: null,
    seconds: null,
    direction: "E",
  });

  const toggleDiv = (id: number) => {
    setOpenDivs((prev) =>
      prev.includes(id) ? prev.filter((divId) => divId !== id) : [...prev, id]
    );
  };

  const handleFieldChange = (key: string, value: any) => {
    setEditedFields((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  const setFieldEditing = (key: keyof EditingFields, value: boolean) => {
    setEditing((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getOneSite = async () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }

    setLoader(true);

    try {
      const response = await fetch(`${baseUrl}/site/get-site/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSite(data);
      } else {
        const errorData = await response.json();
        console.error("Error submitting form", errorData);
      }
    } catch (err) {
      console.error("Error submitting form", err);
    } finally {
      setLoader(false);
    }
  };
  useEffect(() => {
    getOneSite();
  }, [id]);

  useEffect(() => {
    setEditedFields((prev) => ({
      code: prev.code ?? site?.site.code,
      district: prev.district ?? site?.location_history[0].district,
      municipality: prev.municipality ?? site?.location_history[0].municipality,
      type: prev.type ?? site?.location_history[0].type,
      building_height:
        prev.building_height ?? site?.location_history[0].building_height,
      site_height: prev.site_height ?? site?.location_history[0].site_height,
      latitude: prev.latitude ?? site?.location_history[0].latitude,
      longitude: prev.longitude ?? site?.location_history[0].longitude,
    }));
    updateDMSFromDecimal(
      String(site?.location_history[0].latitude),
      setDmsLatitude,
      true,
      setEditedFields
    );

    updateDMSFromDecimal(
      String(site?.location_history[0].longitude),
      setDmsLongtitude,
      false,
      setEditedFields
    );
  }, [editing, site]);
  return (
    <div className="w-full flex md:h-[100vh]">
      <SideBar />
      <div className="lg:pl-[26px] md:pt-[32px] pt-[20px] lg:pr-[30px] sm:px-[30px] px-[15px] pb-[20px] flex flex-col gap-[26px] w-full md:h-[100vh] overflow-y-auto">
        <Header
          pageSentence={`Here are infromations about ${id}`}
          searchBar={false}
        />
        {loader ? (
          <div className="w-full flex items-center justify-center py-3 h-fit">
            <RotatingLines strokeColor="#4A3AFF" width="60" />
          </div>
        ) : (
          site?.location_history.map((history, index) => {
            return (
              <div
                key={index}
                className="w-full rounded-[20px] border-[1px] border-n400 px-[26px] sm:px-[36px] pt-[36px] pb-[50px] flex flex-col items-start gap-[50px] transition-all duration-1000"
                style={{
                  maxHeight:
                    !openDivs.includes(history.id) && index !== 0
                      ? "0px"
                      : "1200px",
                  overflow:
                    !openDivs.includes(history.id) && index !== 0
                      ? "hidden"
                      : "visible", // Only hidden when collapsed
                }}
              >
                <div className="flex flex-col items-start gap-[35px] w-full">
                  <div className="w-full flex items-center justify-between">
                    <h2 className="sm:text-[20px] text-[18px] text-n800 font-semibold">
                      Site information {index + 1}
                    </h2>
                    {index === 0 && getRole() !== 3 && (
                      <button
                        className="py-[5px] sm:py-[6px] px-[12px] sm:px-[20px] rounded-[20px] border-[2px] border-primary text-[12px] text-primary font-semibold"
                        onClick={() => {
                          handleOpenDialog(relocateSiteRef);
                        }}
                      >
                        Relocate site
                      </button>
                    )}
                    {index !== 0 && (
                      <svg
                        className="cursor-pointer"
                        onClick={() => toggleDiv(history.id)}
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="10"
                        viewBox="0 0 24 15"
                        fill="none"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M13.6784 13.4286C13.2331 13.8734 12.6295 14.1232 12.0001 14.1232C11.3707 14.1232 10.7671 13.8734 10.3218 13.4286L1.36325 4.47327C0.917922 4.02773 0.66782 3.42353 0.667969 2.79359C0.668117 2.16364 0.918503 1.55956 1.36404 1.11423C1.80959 0.668899 2.41379 0.418797 3.04373 0.418945C3.67367 0.419094 4.27776 0.66948 4.72309 1.11502L12.0001 8.39202L19.2771 1.11502C19.7248 0.68218 20.3246 0.442507 20.9474 0.447623C21.5701 0.452739 22.1659 0.702234 22.6064 1.14237C23.047 1.58251 23.2971 2.17807 23.3028 2.80079C23.3085 3.42351 23.0693 4.02355 22.6369 4.47169L13.68 13.4302L13.6784 13.4286Z"
                          fill="#666666"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="w-full sm:pr-[82px] flex flex-col items-start gap-[25px]">
                    <div className="w-full flex items-center justify-between">
                      <div className="w-[48%] sm:w-[40%] flex flex-col items-start gap-2">
                        <label
                          htmlFor="site-code"
                          className="text-[14px] text-n600 font-medium"
                        >
                          Site Code
                        </label>
                        <div className="flex w-full items-center justify-between">
                          <div className="relative w-[100%]">
                            <input
                              type="text"
                              id="site-code"
                              name="site-code"
                              className={`w-full border-[1px] border-n300 rounded-[19px]  px-[22px] py-[16px] text-n700 text-[13px] ${
                                !editing.code || (index !== 0 && "bg-n200")
                              }`}
                              value={
                                editing.code
                                  ? editedFields.code
                                  : site.site.code
                              }
                              disabled={!editing.code || index !== 0}
                              maxLength={10}
                              onChange={(e) => {
                                handleFieldChange("code", e.target.value);
                              }}
                            />
                            {!editing.code && index === 0 && getRole() !== 3 &&  (
                              <svg
                                className="absolute top-[50%] translate-y-[-50%] right-4 cursor-pointer"
                                onClick={() => {
                                  setFieldEditing("code", true);
                                }}
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                              >
                                <path
                                  d="M12.4987 5.00007L14.9987 7.50007M10.832 16.6667H17.4987M4.16536 13.3334L3.33203 16.6667L6.66536 15.8334L16.3204 6.17841C16.6328 5.86586 16.8083 5.44201 16.8083 5.00007C16.8083 4.55813 16.6328 4.13429 16.3204 3.82174L16.177 3.67841C15.8645 3.36596 15.4406 3.19043 14.9987 3.19043C14.5568 3.19043 14.1329 3.36596 13.8204 3.67841L4.16536 13.3334Z"
                                  stroke="#514F6E"
                                  stroke-width="1.5"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="w-[48%] sm:w-[40%] flex flex-col items-start gap-2">
                        <label
                          htmlFor="region"
                          className="text-[14px] text-n600 font-medium"
                        >
                          Region
                        </label>
                        <input
                          type="text"
                          id="region"
                          name="region"
                          className="w-full border-[1px] border-n300 rounded-[19px] bg-n200 px-[22px] py-[16px] text-n700 text-[13px]"
                          value={
                            site.site.region === 1
                              ? "EAST"
                              : site.site.region === 2
                              ? "CENTER"
                              : "WEST"
                          }
                          disabled={true}
                        />
                      </div>
                    </div>
                    <div className="w-full flex items-center justify-between">
                      <div className="w-[48%] sm:w-[40%] flex flex-col items-start gap-2">
                        <label
                          htmlFor="wilaya"
                          className="text-[14px] text-n600 font-medium"
                        >
                          Wilaya
                        </label>
                        <input
                          type="text"
                          id="wilaya"
                          name="wilaya"
                          className="w-full border-[1px] border-n300 rounded-[19px] bg-n200 px-[22px] py-[16px] text-n700 text-[13px]"
                          value={site.site.state}
                          disabled={true}
                        />
                      </div>
                      <div className="w-[48%] sm:w-[40%] flex flex-col items-start gap-2">
                        <label
                          htmlFor="daira"
                          className="text-[14px] text-n600 font-medium"
                        >
                          Daira
                        </label>
                        <div className="relative w-[100%]">
                          <input
                            type="text"
                            id="daira"
                            name="daira"
                            className={`w-full border-[1px] border-n300 rounded-[19px]  px-[22px] py-[16px] text-n700 text-[13px] ${
                              (!editing.district || index !== 0) && "bg-n200"
                            }`}
                            value={
                              index === 0
                                ? editing
                                  ? editedFields.district
                                  : history.district
                                : history.district
                            }
                            disabled={!editing.district || index !== 0}
                            onChange={(e) => {
                              handleFieldChange("district", e.target.value);
                            }}
                          />
                          {!editing.district && index === 0 && getRole() !== 3 &&  (
                            <svg
                              className="absolute top-[50%] translate-y-[-50%] right-4 cursor-pointer"
                              onClick={() => {
                                setFieldEditing("district", true);
                              }}
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                            >
                              <path
                                d="M12.4987 5.00007L14.9987 7.50007M10.832 16.6667H17.4987M4.16536 13.3334L3.33203 16.6667L6.66536 15.8334L16.3204 6.17841C16.6328 5.86586 16.8083 5.44201 16.8083 5.00007C16.8083 4.55813 16.6328 4.13429 16.3204 3.82174L16.177 3.67841C15.8645 3.36596 15.4406 3.19043 14.9987 3.19043C14.5568 3.19043 14.1329 3.36596 13.8204 3.67841L4.16536 13.3334Z"
                                stroke="#514F6E"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="w-full flex items-center justify-between">
                      <div className="w-[48%] sm:w-[40%] flex flex-col items-start gap-2">
                        <label
                          htmlFor="commune"
                          className="text-[14px] text-n600 font-medium"
                        >
                          Commune
                        </label>
                        <div className="relative w-full">
                          <input
                            type="text"
                            id="commune"
                            name="commune"
                            className={`w-full border-[1px] border-n300 rounded-[19px]  px-[22px] py-[16px] text-n700 text-[13px] ${
                              (!editing.municipality || index !== 0) &&
                              "bg-n200"
                            }`}
                            value={
                              index === 0
                                ? editing
                                  ? editedFields.municipality
                                  : history.municipality
                                : history.municipality
                            }
                            disabled={!editing.municipality || index !== 0}
                            onChange={(e) => {
                              handleFieldChange("municipality", e.target.value);
                            }}
                          />
                          {!editing.municipality && index === 0 && getRole() !== 3 &&  (
                            <svg
                              className="absolute top-[50%] translate-y-[-50%] right-4 cursor-pointer"
                              onClick={() => {
                                setFieldEditing("municipality", true);
                              }}
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                            >
                              <path
                                d="M12.4987 5.00007L14.9987 7.50007M10.832 16.6667H17.4987M4.16536 13.3334L3.33203 16.6667L6.66536 15.8334L16.3204 6.17841C16.6328 5.86586 16.8083 5.44201 16.8083 5.00007C16.8083 4.55813 16.6328 4.13429 16.3204 3.82174L16.177 3.67841C15.8645 3.36596 15.4406 3.19043 14.9987 3.19043C14.5568 3.19043 14.1329 3.36596 13.8204 3.67841L4.16536 13.3334Z"
                                stroke="#514F6E"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                      <div className="w-[48%] sm:w-[40%] flex flex-col items-start gap-2">
                        <label
                          htmlFor="type"
                          className="text-[14px] text-n600 font-medium"
                        >
                          Type of site{" "}
                        </label>
                        <div className="relative w-full">
                          <input
                            type="text"
                            id="type"
                            name="type"
                            className={`w-full border-[1px] border-n300 rounded-[19px]  px-[22px] py-[16px] text-n700 text-[13px] ${
                              (!editing.type || index !== 0) && "bg-n200"
                            }`}
                            value={
                              history.type === 1
                                ? "Building Rooftop (RT)"
                                : history.type === 2
                                ? "Wall Tower (WT)"
                                : history.type === 3
                                ? "Microcell (MICRO)"
                                : history.type === 4
                                ? "Greenfield (GF)"
                                : "Mobile Station (MS)"
                            }
                            //this will be a select element by tmrw inshalh
                            disabled={!editing.type || index !== 0}
                            onChange={(e) => {
                              handleFieldChange("type", e.target.value);
                            }}
                          />

                          {!editing.type && index === 0 && getRole() !== 3 &&  (
                            <svg
                              className="absolute top-[50%] translate-y-[-50%] right-4 cursor-pointer"
                              onClick={() => {
                                setFieldEditing("type", true);
                              }}
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                            >
                              <path
                                d="M12.4987 5.00007L14.9987 7.50007M10.832 16.6667H17.4987M4.16536 13.3334L3.33203 16.6667L6.66536 15.8334L16.3204 6.17841C16.6328 5.86586 16.8083 5.44201 16.8083 5.00007C16.8083 4.55813 16.6328 4.13429 16.3204 3.82174L16.177 3.67841C15.8645 3.36596 15.4406 3.19043 14.9987 3.19043C14.5568 3.19043 14.1329 3.36596 13.8204 3.67841L4.16536 13.3334Z"
                                stroke="#514F6E"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="w-full flex items-center justify-between">
                      <div className="w-[48%] sm:w-[40%] flex flex-col items-start gap-2">
                        <label
                          htmlFor="building-height"
                          className="text-[14px] text-n600 font-medium"
                        >
                          Building height
                        </label>
                        <div className="relative w-full">
                          <input
                            type="text"
                            id="building-height"
                            name="building-height"
                            className={`w-full border-[1px] border-n300 rounded-[19px]  px-[22px] py-[16px] text-n700 text-[13px] ${
                              (!editing.building_height || index !== 0) &&
                              "bg-n200"
                            }`}
                            value={
                              index === 0
                                ? editing
                                  ? editedFields.building_height
                                  : history.building_height
                                : history.building_height
                            }
                            disabled={!editing.building_height || index !== 0}
                            onChange={(e) => {
                              handleFieldChange(
                                "building_height",
                                e.target.value
                              );
                            }}
                          />
                          {!editing.building_height && index === 0 && getRole() !== 3 &&  (
                            <svg
                              className="absolute top-[50%] translate-y-[-50%] right-4 cursor-pointer"
                              onClick={() => {
                                setFieldEditing("building_height", true);
                              }}
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                            >
                              <path
                                d="M12.4987 5.00007L14.9987 7.50007M10.832 16.6667H17.4987M4.16536 13.3334L3.33203 16.6667L6.66536 15.8334L16.3204 6.17841C16.6328 5.86586 16.8083 5.44201 16.8083 5.00007C16.8083 4.55813 16.6328 4.13429 16.3204 3.82174L16.177 3.67841C15.8645 3.36596 15.4406 3.19043 14.9987 3.19043C14.5568 3.19043 14.1329 3.36596 13.8204 3.67841L4.16536 13.3334Z"
                                stroke="#514F6E"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                      <div className="w-[48%] sm:w-[40%] flex flex-col items-start gap-2">
                        <label
                          htmlFor="mast-height"
                          className="text-[14px] text-n600 font-medium"
                        >
                          MAST height
                        </label>
                        <div className="relative w-full">
                          <input
                            type="text"
                            id="mast-height"
                            name="mast-height"
                            className={`w-full border-[1px] border-n300 rounded-[19px]  px-[22px] py-[16px] text-n700 text-[13px] ${
                              (!editing.site_height || index !== 0) && "bg-n200"
                            }`}
                            value={
                              index === 0
                                ? editing
                                  ? editedFields.site_height
                                  : history.site_height
                                : history.site_height
                            }
                            disabled={!editing.site_height || index !== 0}
                            onChange={(e) => {
                              handleFieldChange("site_height", e.target.value);
                            }}
                          />
                          {!editing.site_height && index === 0 && getRole() !== 3 &&  (
                            <svg
                              className="absolute top-[50%] translate-y-[-50%] right-4 cursor-pointer"
                              onClick={() => {
                                setFieldEditing("site_height", true);
                              }}
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                            >
                              <path
                                d="M12.4987 5.00007L14.9987 7.50007M10.832 16.6667H17.4987M4.16536 13.3334L3.33203 16.6667L6.66536 15.8334L16.3204 6.17841C16.6328 5.86586 16.8083 5.44201 16.8083 5.00007C16.8083 4.55813 16.6328 4.13429 16.3204 3.82174L16.177 3.67841C15.8645 3.36596 15.4406 3.19043 14.9987 3.19043C14.5568 3.19043 14.1329 3.36596 13.8204 3.67841L4.16536 13.3334Z"
                                stroke="#514F6E"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-start gap-[35px] w-full">
                  <h2 className="text-[20px] text-n800 font-semibold">
                    Cordonnées - GPS
                  </h2>
                  <div className="w-full sm:pr-[82px] flex flex-col items-start gap-[28px]">
                    <div className="flex flex-col items-start gap-4 w-full">
                      <label
                        htmlFor="latitude"
                        className="text-[14px] text-n600 font-medium"
                      >
                        Latitude
                      </label>
                      <div className="w-full flex items-center sm:gap-0 gap-x-2 gap-y-3 sm:justify-between flex-wrap justify-center">
                        <input
                          type="text"
                          name="degrees"
                          id="latitude-degrees"
                          className={`w-[30%] border-[1px] border-n300 rounded-[19px] px-[22px] py-[16px] text-n700 text-[13px] sm:flex-grow-0 flex-grow ${
                            (!editing.latitude || index !== 0) && "bg-n200"
                          }`}
                          value={
                            index === 0
                              ? editing.latitude
                                ? dmsLatitude.degrees!
                                : decimalToDMS(history.latitude).degrees
                              : decimalToDMS(history.latitude).degrees
                          }
                          disabled={!editing.latitude || index !== 0}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (
                              value === "" ||
                              (/^\d+$/.test(value) &&
                                parseInt(value, 10) >= 0 &&
                                parseInt(value, 10) <= 90)
                            ) {
                              if (editing.latitude) {
                                handleDMSChange(
                                  e,
                                  setDmsLatitude,
                                  true,
                                  setEditedFields
                                );
                              }
                            }
                          }}
                        />
                        <input
                          type="text"
                          name="minutes"
                          id="latitude-min"
                          className={`w-[30%] sm:flex-grow-0 flex-grow border-[1px] border-n300 rounded-[19px] px-[22px] py-[16px] text-n700 text-[13px] ${
                            (!editing.latitude || index !== 0) && "bg-n200"
                          }`}
                          value={
                            index === 0
                              ? editing.latitude
                                ? dmsLatitude.minutes!
                                : decimalToDMS(history.latitude).minutes
                              : decimalToDMS(history.latitude).minutes
                          }
                          disabled={!editing.latitude || index !== 0}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (
                              value === "" ||
                              (/^\d+$/.test(value) &&
                                parseInt(value, 10) >= 0 &&
                                parseInt(value, 10) <= 59)
                            ) {
                              if (editing.latitude) {
                                handleDMSChange(
                                  e,
                                  setDmsLatitude,
                                  true,
                                  setEditedFields
                                );
                              }
                            }
                          }}
                        />
                        <input
                          type="text"
                          name="seconds"
                          id="latitude-sec"
                          className={`w-[30%] sm:flex-grow-0 flex-grow border-[1px] border-n300 rounded-[19px] px-[22px] py-[16px] text-n700 text-[13px] ${
                            (!editing.latitude || index !== 0) && "bg-n200"
                          }`}
                          value={
                            index === 0
                              ? editing.latitude
                                ? dmsLatitude.seconds!
                                : decimalToDMS(history.latitude).seconds
                              : decimalToDMS(history.latitude).seconds
                          }
                          disabled={!editing.latitude || index !== 0}
                          onChange={(e) => {
                            const target = e.target;
                            const value = target.value.replace(",", "."); // Replace comma with dot

                            // Check if the value is valid
                            if (
                              value === "" ||
                              (parseFloat(value) >= 0 &&
                                parseFloat(value) <= 59.99)
                            ) {
                              if (editing.latitude) {
                                handleDMSChange(
                                  e,
                                  setDmsLatitude,
                                  true,
                                  setEditedFields
                                );
                              }
                            }
                          }}
                          onInput={(e) => {
                            const target = e.target as HTMLInputElement;
                            // Allow digits, commas, and dots
                            target.value = target.value.replace(/[^\d,.]/g, "");
                          }}
                          onKeyDown={(
                            e: React.KeyboardEvent<HTMLInputElement>
                          ) => {
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
                        <div className="flex items-center gap-3 w-[20%] sm:w-[6%]">
                          <div className="flex items-center gap-[5px]">
                            <div className="rounded-full border-[2px] border-primary p-[2px]">
                              <input
                                type="checkbox"
                                id="north"
                                className="hidden peer"
                                name="direction"
                                value="N"
                                checked={
                                  index === 0
                                    ? editing.latitude
                                      ? dmsLatitude.direction === "N"
                                      : decimalToDMS(history.latitude)
                                          .direction === "N"
                                    : decimalToDMS(history.latitude)
                                        .direction === "N"
                                }
                                disabled={!editing.latitude || index !== 0}
                                onChange={(e) => {
                                  if (editing.latitude) {
                                    handleDMSDirectionChange(
                                      e,
                                      setDmsLatitude,
                                      true,
                                      setEditedFields
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
                                  index === 0
                                    ? editing.latitude
                                      ? dmsLatitude.direction === "S"
                                      : decimalToDMS(history.latitude)
                                          .direction === "S"
                                    : decimalToDMS(history.latitude)
                                        .direction === "S"
                                }
                                disabled={!editing.latitude || index !== 0}
                                onChange={(e) => {
                                  if (editing.latitude) {
                                    handleDMSDirectionChange(
                                      e,
                                      setDmsLatitude,
                                      true,
                                      setEditedFields
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
                      <div className="relative w-full">
                        <input
                          type="text"
                          name="latitude-dec"
                          id="latitude-dec"
                          className={`w-full border-[1px] border-n300 rounded-[19px]  px-[22px] py-[16px] text-n700 text-[13px] ${
                            (!editing.latitude || index !== 0) && "bg-n200"
                          }`}
                          value={
                            index === 0
                              ? editing
                                ? editedFields.latitude
                                : history.latitude
                              : history.latitude
                          }
                          disabled={!editing.latitude || index !== 0}
                          onChange={(e) => {
                            let value = e.target.value.replace(",", ".");

                            if (value.startsWith("-")) {
                              value =
                                "-" + value.slice(1).replace(/[^0-9.]/g, "");
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
                              if (editing.latitude) {
                                updateDMSFromDecimal(
                                  e.target.value,
                                  setDmsLatitude,
                                  true,
                                  setEditedFields
                                );
                              }
                            }
                          }}
                          onInput={(e) => {
                            const target = e.target as HTMLInputElement;
                            // Allow only digits, commas, dots, and one minus sign at the beginning
                            target.value = target.value.replace(
                              /(?!^-)[^\d,.]/g,
                              ""
                            );
                          }}
                          onKeyDown={(
                            e: React.KeyboardEvent<HTMLInputElement>
                          ) => {
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
                        {!editing.latitude && index === 0 && getRole() !== 3 &&  (
                          <svg
                            className="absolute top-[50%] translate-y-[-50%] right-4 cursor-pointer"
                            onClick={() => {
                              setFieldEditing("latitude", true);
                            }}
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                          >
                            <path
                              d="M12.4987 5.00007L14.9987 7.50007M10.832 16.6667H17.4987M4.16536 13.3334L3.33203 16.6667L6.66536 15.8334L16.3204 6.17841C16.6328 5.86586 16.8083 5.44201 16.8083 5.00007C16.8083 4.55813 16.6328 4.13429 16.3204 3.82174L16.177 3.67841C15.8645 3.36596 15.4406 3.19043 14.9987 3.19043C14.5568 3.19043 14.1329 3.36596 13.8204 3.67841L4.16536 13.3334Z"
                              stroke="#514F6E"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-4 w-full">
                      <label
                        htmlFor="longitude"
                        className="text-[14px] text-n600 font-medium"
                      >
                        Longitude
                      </label>
                      <div className="w-full flex items-center sm:gap-0 gap-x-2 gap-y-3 sm:justify-between flex-wrap justify-center">
                        <input
                          type="text"
                          name="degrees"
                          id="longitude-degrees"
                          className={`w-[30%] sm:flex-grow-0 flex-grow border-[1px] border-n300 rounded-[19px] px-[22px] py-[16px] text-n700 text-[13px] ${
                            (!editing.longitude || index !== 0) && "bg-n200"
                          }`}
                          value={
                            index === 0
                              ? editing.longitude
                                ? dmsLongtitude.degrees!
                                : decimalToDMS(history.longitude, false).degrees
                              : decimalToDMS(history.longitude, false).degrees
                          }
                          disabled={!editing.longitude || index !== 0}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (
                              value === "" ||
                              (/^\d+$/.test(value) &&
                                parseInt(value, 10) >= 0 &&
                                parseInt(value, 10) <= 180)
                            ) {
                              if (editing.longitude) {
                                handleDMSChange(
                                  e,
                                  setDmsLongtitude,
                                  false,
                                  setEditedFields
                                );
                              }
                            }
                          }}
                        />
                        <input
                          type="text"
                          name="minutes"
                          id="longitude-min"
                          className={`w-[30%] sm:flex-grow-0 flex-grow border-[1px] border-n300 rounded-[19px] px-[22px] py-[16px] text-n700 text-[13px] ${
                            (!editing.longitude || index !== 0) && "bg-n200"
                          }`}
                          value={
                            index === 0
                              ? editing.longitude
                                ? dmsLongtitude.minutes!
                                : decimalToDMS(history.longitude, false).minutes
                              : decimalToDMS(history.longitude, false).minutes
                          }
                          disabled={!editing.longitude || index !== 0}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (
                              value === "" ||
                              (/^\d+$/.test(value) &&
                                parseInt(value, 10) >= 0 &&
                                parseInt(value, 10) <= 59)
                            ) {
                              if (editing.longitude) {
                                handleDMSChange(
                                  e,
                                  setDmsLongtitude,
                                  false,
                                  setEditedFields
                                );
                              }
                            }
                          }}
                        />
                        <input
                          type="text"
                          name="seconds"
                          id="longitude-sec"
                          className={`w-[30%] sm:flex-grow-0 flex-grow border-[1px] border-n300 rounded-[19px] px-[22px] py-[16px] text-n700 text-[13px] ${
                            (!editing.longitude || index !== 0) && "bg-n200"
                          }`}
                          value={
                            index === 0
                              ? editing.longitude
                                ? dmsLongtitude.seconds!
                                : decimalToDMS(history.longitude, false).seconds
                              : decimalToDMS(history.longitude, false).seconds
                          }
                          disabled={!editing.longitude || index !== 0}
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            const target = e.target as HTMLInputElement;
                            const value = target.value.replace(",", "."); // Replace comma with dot

                            // Check if the value is valid
                            if (
                              value === "" ||
                              (parseFloat(value) >= 0 &&
                                parseFloat(value) <= 59.99)
                            ) {
                              if (editing.longitude) {
                                handleDMSChange(
                                  e,
                                  setDmsLongtitude,
                                  false,
                                  setEditedFields
                                );
                              }
                            }
                          }}
                          onInput={(e: React.FormEvent<HTMLInputElement>) => {
                            const target = e.target as HTMLInputElement;
                            target.value = target.value.replace(/[^\d,.]/g, "");
                          }}
                          onKeyDown={(
                            e: React.KeyboardEvent<HTMLInputElement>
                          ) => {
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

                        <div className="flex items-center gap-3 w-[6%]">
                          <div className="flex items-center gap-[5px]">
                            <div className="rounded-full border-[2px] border-primary p-[2px]">
                              <input
                                type="checkbox"
                                id="east"
                                className="hidden peer"
                                name="direction"
                                value="E"
                                checked={
                                  index === 0
                                    ? editing.longitude
                                      ? dmsLongtitude.direction === "E"
                                      : decimalToDMS(history.longitude, false)
                                          .direction === "E"
                                    : decimalToDMS(history.longitude, false)
                                        .direction === "E"
                                }
                                disabled={!editing.longitude || index !== 0}
                                onChange={(e) => {
                                  if (editing.longitude) {
                                    handleDMSDirectionChange(
                                      e,
                                      setDmsLongtitude,
                                      false,
                                      setEditedFields
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
                                name="direction"
                                id="west"
                                value="W"
                                className="hidden peer"
                                checked={
                                  index === 0
                                    ? editing.longitude
                                      ? dmsLongtitude.direction === "W"
                                      : decimalToDMS(history.longitude, false)
                                          .direction === "W"
                                    : decimalToDMS(history.longitude, false)
                                        .direction === "W"
                                }
                                disabled={!editing.longitude || index !== 0}
                                onChange={(e) => {
                                  if (editing.longitude) {
                                    handleDMSDirectionChange(
                                      e,
                                      setDmsLongtitude,
                                      false,
                                      setEditedFields
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

                      <div className="relative w-full">
                        <input
                          type="text"
                          name="longitude-dec"
                          id="longitude-dec"
                          className={`w-full border-[1px] border-n300 rounded-[19px]  px-[22px] py-[16px] text-n700 text-[13px] ${
                            (!editing.longitude || index !== 0) && "bg-n200"
                          }`}
                          value={
                            index === 0
                              ? editing
                                ? editedFields.longitude
                                : history.longitude
                              : history.longitude
                          }
                          disabled={!editing.longitude || index !== 0}
                          onChange={(e) => {
                            let value = e.target.value.replace(",", ".");

                            if (value.startsWith("-")) {
                              value =
                                "-" + value.slice(1).replace(/[^0-9.]/g, "");
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
                              if (editing.longitude) {
                                updateDMSFromDecimal(
                                  e.target.value,
                                  setDmsLongtitude,
                                  false,
                                  setEditedFields
                                );
                              }
                            }
                          }}
                          onInput={(e) => {
                            const target = e.target as HTMLInputElement;
                            target.value = target.value.replace(
                              /(?!^-)[^\d,.]/g,
                              ""
                            );
                          }}
                          onKeyDown={(
                            e: React.KeyboardEvent<HTMLInputElement>
                          ) => {
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
                        {!editing.longitude && index === 0 && getRole() !== 3 &&  (
                          <svg
                            className="absolute top-[50%] translate-y-[-50%] right-4 cursor-pointer"
                            onClick={() => {
                              setFieldEditing("longitude", true);
                            }}
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                          >
                            <path
                              d="M12.4987 5.00007L14.9987 7.50007M10.832 16.6667H17.4987M4.16536 13.3334L3.33203 16.6667L6.66536 15.8334L16.3204 6.17841C16.6328 5.86586 16.8083 5.44201 16.8083 5.00007C16.8083 4.55813 16.6328 4.13429 16.3204 3.82174L16.177 3.67841C15.8645 3.36596 15.4406 3.19043 14.9987 3.19043C14.5568 3.19043 14.1329 3.36596 13.8204 3.67841L4.16536 13.3334Z"
                              stroke="#514F6E"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {Object.values(editing).some(Boolean) && index === 0 && getRole() !== 3 &&  (
                  <div className="w-full flex items-center justify-end">
                    <div className="flex items-center gap-[6px]">
                      <button
                        className={`rounded-[50px] px-[26px] py-[6.5px] text-[13px] font-semibold border-[1px] flex items-center justify-center border-n400 bg-n300 text-n600`}
                        onClick={() => {
                          setEditing({
                            code: false,
                            district: false,
                            municipality: false,
                            type: false,
                            building_height: false,
                            site_height: false,
                            latitude: false,
                            longitude: false,
                          });
                          setEditedFields({});
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className={`rounded-[50px] px-[26px] py-[6.5px] text-[13px] font-semibold border-[1px] flex items-center justify-center ${
                          editedFields.code !== site.site.code ||
                          editedFields.district !==
                            site.location_history[0].district ||
                          editedFields.municipality !==
                            site.location_history[0].municipality ||
                          editedFields.type !== site.location_history[0].type ||
                          Number(editedFields.site_height) !==
                            Number(site.location_history[0].site_height) ||
                          Number(editedFields.building_height) !==
                            Number(site.location_history[0].building_height) ||
                          Number(editedFields.latitude) !==
                            Number(site.location_history[0].latitude) ||
                          Number(editedFields.longitude) !==
                            Number(site.location_history[0].longitude)
                            ? "border-primary bg-primary text-white"
                            : "border-n400 bg-n300 text-n500"
                        }`}
                        onClick={() => {
                          if (editedFields.code !== site.site.code) {
                            updateSiteCode(
                              site.site.id,
                              editedFields.code!,
                              setSite,
                              setEditCodeLoader,
                              setEditing
                            );
                          }
                          if (
                            editedFields.district !==
                              site.location_history[0].district ||
                            editedFields.municipality !==
                              site.location_history[0].municipality ||
                            editedFields.type !==
                              site.location_history[0].type ||
                            Number(editedFields.site_height) !==
                              Number(site.location_history[0].site_height) ||
                            Number(editedFields.building_height) !==
                              Number(
                                site.location_history[0].building_height
                              ) ||
                            Number(editedFields.latitude) !==
                              Number(site.location_history[0].latitude) ||
                            Number(editedFields.longitude) !==
                              Number(site.location_history[0].longitude)
                          ) {
                            updateSiteinfo(
                              site.site.id,
                              {
                                district: editedFields.district,
                                municipality: editedFields.municipality,
                                site_height: Number(editedFields.site_height),
                                building_height: Number(
                                  editedFields.building_height
                                ),
                                type: editedFields.type,
                                longitude: Number(editedFields.longitude),
                                latitude: Number(editedFields.latitude),
                              },
                              setEditCodeLoader,
                              setEditing,
                              getOneSite
                            );
                          }
                        }}
                      >
                        {editCodeLoader ? (
                          <RotatingLines strokeColor="white" width="20" />
                        ) : (
                          "Save"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      <CreateSitePopup
        ref={relocateSiteRef}
        fetchSites={getOneSite}
        method="update"
        siteId={Number(id)}
      />
    </div>
  );
};

export default EditSite;
