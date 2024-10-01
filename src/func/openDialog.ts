import { ForwardedRef } from "react";


export const handleOpenDialog = (dialogRef: React.RefObject<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (dialog) {
      dialog.style.display = "flex";
      dialog.showModal();
    }
  };

  export const handleCloseDialog = (dialogRef: ForwardedRef<HTMLDialogElement>) => {
    if (dialogRef && typeof dialogRef === "object" && "current" in dialogRef) {
      const dialog = dialogRef.current;
  
      if (dialog) {
        dialog.style.display = "none";
        dialog.close()
      }
    }
  };