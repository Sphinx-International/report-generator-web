import { ReqSite } from "../../../assets/types/LosSites";
import { reqOrders } from "../../../assets/types/LosCommands";

export interface SiteFormErrors {
  siteCode?: string;
  wilaya?: string;
  daira?: string;
  baladia?: string;
  latitude?: string;
  longitude?: string;
  buildingHeight?: string;
  siteHeight?: string;
}

export const validateForm1 = (formValues: ReqSite): SiteFormErrors => {
  const formErrors: SiteFormErrors = {};
  if (formValues.code === "") formErrors.siteCode = "Site Code is required";
  if (formValues.state === "") formErrors.wilaya = "Wilaya is required";
  if (formValues.district === "") formErrors.daira = "Daira is required";
  if (formValues.municipality === "")
    formErrors.baladia = "Baladia is required";
  if (
    formValues.latitude === 0 ||
    formValues.latitude === null ||
    String(formValues.latitude) === ""
  )
    formErrors.latitude = "Latitude is required";

  if (String(formValues.latitude) === "-")
    formErrors.latitude = "Enter valid latitude value";
  if (
    formValues.longitude === 0 ||
    formValues.longitude === null ||
    String(formValues.longitude) === ""
  )
    formErrors.longitude = "Longitude is required";
  if (String(formValues.longitude) === "-")
    formErrors.longitude = "Enter valid longitude value";
  return formErrors;
};

export const validateRelocateSiteForm1 = (formValues: ReqSite): SiteFormErrors => {
  const formErrors: SiteFormErrors = {};
  if (formValues.district === "") formErrors.daira = "Daira is required";
  if (formValues.municipality === "")
    formErrors.baladia = "Baladia is required";
  if (
    formValues.latitude === 0 ||
    formValues.latitude === null ||
    String(formValues.latitude) === ""
  )
    formErrors.latitude = "Latitude is required";

  if (String(formValues.latitude) === "-")
    formErrors.latitude = "Enter valid latitude value";
  if (
    formValues.longitude === 0 ||
    formValues.longitude === null ||
    String(formValues.longitude) === ""
  )
    formErrors.longitude = "Longitude is required";
  if (String(formValues.longitude) === "-")
    formErrors.longitude = "Enter valid longitude value";
  return formErrors;
};

export const validateForm2 = (formValues: ReqSite): SiteFormErrors => {
  const formErrors: SiteFormErrors = {};

  switch (formValues.type) {
    case 1:
      if (formValues.building_height === null) {
        formErrors.buildingHeight = "Building height is required";
      } else if (formValues.building_height < 3) {
        formErrors.buildingHeight = "Building height must be greater than 3";
      }
      if (formValues.site_height === null) {
        formErrors.siteHeight = "Site height is required";
      } else if (formValues.site_height < 2 || formValues.site_height > 20) {
        formErrors.siteHeight = "Site height must be between [2-20]";
      }

      break;
    case 2:
      if (formValues.building_height === null) {
        formErrors.buildingHeight = "Building height is required";
      } else if (formValues.building_height < 3) {
        formErrors.buildingHeight = "Building height must be greater than 3";
      }
      if (formValues.site_height === null) {
        formErrors.siteHeight = "Site height is required";
      } else if (formValues.site_height < 1 || formValues.site_height > 10) {
        formErrors.siteHeight = "Site height must be between [1-10]";
      }

      break;

    case 3:
      if (formValues.building_height === null) {
        formErrors.buildingHeight = "Building height is required";
      } else if (formValues.building_height < 3) {
        formErrors.buildingHeight = "Building height must be greater than 3";
      }
      if (formValues.site_height === null) {
        formErrors.siteHeight = "Site height is required";
      } else if (formValues.site_height < 1 || formValues.site_height > 5) {
        formErrors.siteHeight = "Site height must be between [1-5]";
      }

      break;

    case 4:
      if (formValues.building_height === null) {
        formErrors.buildingHeight = "Building height is required";
      } else if (formValues.building_height !== 0) {
        formErrors.buildingHeight = "Building height must be 0";
      }
      if (formValues.site_height === null) {
        formErrors.siteHeight = "Site height is required";
      } else if (formValues.site_height < 10 || formValues.site_height > 150) {
        formErrors.siteHeight = "Site height must be between [10-150]";
      }

      break;

    case 5:
      if (formValues.building_height === null) {
        formErrors.buildingHeight = "Building height is required";
      } else if (formValues.building_height !== 0) {
        formErrors.buildingHeight = "Building height must be 0";
      }
      if (formValues.site_height === null) {
        formErrors.siteHeight = "Site height is required";
      } else if (formValues.site_height < 5 || formValues.site_height > 30) {
        formErrors.siteHeight = "Site height must be between [5-30]";
      }
      break;

    default:
      break;
  }

  if (formValues.building_height === null)
    formErrors.buildingHeight = "Building Height is required ";
  if (formValues.site_height === null)
    formErrors.siteHeight = "Site Height is required ";
  return formErrors;
};

export interface LosFormErrors {
  siteNE?: string;
  alternatives?: string;
  emails?: string;
}

export const validateLosForm1 = (formValues: reqOrders): LosFormErrors => {
  const formErrors: LosFormErrors = {};
  if (formValues.near_end_location === null)
    formErrors.siteNE = "Choose a near end location";
  if (
    formValues.alternative_far_ends === null ||
    formValues.alternative_far_ends.length === 0
  )
    formErrors.alternatives = "At least choose one alt";
  return formErrors;
};

export const validateLosForm2 = (formValues: reqOrders): LosFormErrors => {
  const formErrors: LosFormErrors = {};
  if (formValues.emails === null || formValues.emails.length === 0)
    formErrors.emails = "At least enter someone to receive mail";
  return formErrors;
};
