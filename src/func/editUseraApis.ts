const baseUrl = import.meta.env.VITE_BASE_URL;

export const handle_active_or_deactivate_user = async (
  action: "active" | "deactive",
  account_id: string,
  fetchUser: () => void,
  enqueueSnackbar: (message: string, options?: any) => void
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }
  try {
    const response = await fetch(
      action === "active"
        ? `${baseUrl}/account/activate-account/${account_id}`
        : `${baseUrl}/account/disactivate-account/${account_id}`,

      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      }
    );
    if (response.ok) {
      fetchUser();
      action === "active"
        ? enqueueSnackbar("User successfully activated.", {
            variant: "success",
            autoHideDuration: 3000,
          })
        : enqueueSnackbar("User successfully deactivated.", {
            variant: "info",
            autoHideDuration: 3000,
          });
    }
  } catch (err) {
    console.error("Error submitting form", err);
  }
};

export const handle_delete_user = async (
  account_id: number,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  enqueueSnackbar: (message: string, options?: any) => void
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }
  setIsLoading(true);
  try {
    const response = await fetch(`${baseUrl}/account/delete-accounts`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({
        accounts: [account_id],
      }),
    });
    switch (response.status) {
      case 200:
        window.location.href = "/users";

        break;
      case 406:
        enqueueSnackbar(
          "Cannot delete this user as it will affect related data.",
          {
            variant: "error",
            autoHideDuration: 3000,
          }
        );

        break;

      default:
        break;
    }
  } catch (err) {
    console.error("Error submitting form", err);
  } finally {
    setIsLoading(false);
  }
};
