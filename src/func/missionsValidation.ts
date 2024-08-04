import { ReqMission } from "../assets/types/Mission";

export interface FormErrors {
    title?: string;
    description?: string;
    ticker_number?: string;
    accounts?: string
  }

export const validateForm1 = (formValues:ReqMission): FormErrors => {
    const formErrors:FormErrors = {};
    if (formValues.title === "") formErrors.title = 'Title is required';
    if (formValues.description === "") formErrors.description = 'Description is required';
    if (formValues.ticker_number === undefined) formErrors.ticker_number = 'Ticket number is required';
    return formErrors;
  };

  export const validateForm2 = (formValues:ReqMission): FormErrors => {
    const formErrors:FormErrors = {};
    if (formValues.accounts.length === 0) formErrors.accounts = 'At least enter someone to receive mail';
    return formErrors;
  };