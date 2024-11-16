import { ReqLosExecution } from "../../../assets/types/LosCommands";

export interface ExectionPopupErrors {
  hba?: string;
  latitude?: string;
  longitude?: string;
}

export const validateForm1 = (
  formValues: ReqLosExecution
): ExectionPopupErrors => {
  const formErrors: ExectionPopupErrors = {};
  if (formValues.hba === null) formErrors.hba = "HBA is required";
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
