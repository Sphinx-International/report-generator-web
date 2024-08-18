import { ReqMission } from "../assets/types/Mission";

export interface FormErrors {
    title?: string;
    description?: string;
    id?: string;
    emails?: string
  }

export const validateForm1 = (formValues:ReqMission): FormErrors => {
    const formErrors:FormErrors = {};
    if (formValues.title === "") formErrors.title = 'Title is required';
    if (formValues.description === "") formErrors.description = 'Description is required';
    if (formValues.id === undefined || String(formValues.id) === "") formErrors.id = 'ID is required';
    return formErrors;
  };

  export const validateForm2 = (formValues:ReqMission): FormErrors => {
    const formErrors:FormErrors = {};
    if (formValues.emails.length === 0) formErrors.emails = 'At least enter someone to receive mail';
    return formErrors;
  };