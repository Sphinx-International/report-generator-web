import { ReqMission } from "../assets/types/Mission";
import { ReqModernisation } from "../assets/types/Modernisation";

export interface MissionFormErrors {
    title?: string;
    description?: string;
    id?: string;
    emails?: string
  }

  export interface ModernisationFormErrors {
    title?: string;
    description?: string;
    emails?: string
  }

export const validateForm1 = (formValues:ReqMission): MissionFormErrors => {
    const formErrors:MissionFormErrors = {};
    if (formValues.title === "") formErrors.title = 'Title is required';
    if (formValues.description === "") formErrors.description = 'Description is required';
    if (formValues.id === undefined || String(formValues.id) === "") formErrors.id = 'ID is required';
    return formErrors;
  };

  export const validateForm2 = (formValues:ReqMission): MissionFormErrors => {
    const formErrors:MissionFormErrors = {};
    if (formValues.emails.length === 0) formErrors.emails = 'At least enter someone to receive mail';
    return formErrors;
  };


  export const validateModernisationForm1 = (formValues:ReqModernisation): ModernisationFormErrors => {
    const formErrors:MissionFormErrors = {};
    if (formValues.title === "") formErrors.title = 'Title is required';
    if (formValues.description === "") formErrors.description = 'Description is required';
    return formErrors;
  };

  export const validateModernisationForm2 = (formValues:ReqModernisation): ModernisationFormErrors => {
    const formErrors:MissionFormErrors = {};
    if (formValues.emails.length === 0) formErrors.emails = 'At least enter someone to receive mail';
    return formErrors;
  };