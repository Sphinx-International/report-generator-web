const baseUrl = import.meta.env.VITE_BASE_URL;

export const fetchGroupMembers = async (
  group_id: number,
  setGroupMember: React.Dispatch<React.SetStateAction<string[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  updateFormValues?: React.Dispatch<React.SetStateAction<any>> // Optional parameter
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }

  setIsLoading(true);
  const url = `${baseUrl}/mail/get-group-members/${group_id}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response text: ", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Extract emails from the returned data
    const emails = data.map((member: { email: string }) => member.email);

    // Update the state with the new unique emails
    setGroupMember((prevMembers) => {
      // Flatten prevMembers if it contains nested arrays
      const flatPrevMembers = prevMembers.flat();

      // Filter out new emails that are not in the existing flattened list
      const newMembers = emails.filter(
        (email: string) => !flatPrevMembers.includes(email)
      );

      console.log(newMembers);

      // Log for debugging

      return [...flatPrevMembers, ...newMembers]; // Combine and update state
    });

    // If the optional updateFormValues function is provided, update the form values
    if (updateFormValues) {
      updateFormValues((prev: any) => {
        const newEmails = emails.filter(
          (email: string) => !prev.emails.includes(email)
        );
        return {
          ...prev,
          emails: [...prev.emails, ...newEmails], // Append new unique emails to existing ones
        };
      });
    }
  } catch (err) {
    console.error("Error: ", err);
  } finally {
    setIsLoading(false);
  }
};

export const fetchGroupMembersThenAddThemToWorkorder = async (
    workorder_id: string,
    group_id: number,
    currentMembers: string[], // Add this parameter to receive current members
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
    fetchOneWorkOrder: () => void
  ) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }
  
    setIsLoading(true);
    const url = `${baseUrl}/mail/get-group-members/${group_id}`;
  
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response text: ", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
  
      // Extract emails from the returned data
      const emails = data.map((member: { email: string }) => member.email);
  
      // Flatten currentMembers in case it's nested
      const flatCurrentMembers = currentMembers.flat();
  
      // Filter out new emails that are not in the current members list
      const newMembers = emails.filter((email: string) => !flatCurrentMembers.includes(email));
  
      // Call handle_add_group_mailedPerson with new emails
      handle_add_group_mailedPerson(workorder_id, newMembers, setIsLoading, fetchOneWorkOrder);
  
    } catch (err) {
      console.error("Error: ", err);
    } finally {
      setIsLoading(false);
    }
  };

export const handle_add_group_mailedPerson = async (
  workorder_id: string,
  Emails: string[],
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  fetchOneWorkOrder: () => void
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }
    try {
    const response = await fetch(
      `${baseUrl}/workorder/update-workorder-mails`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ workorder_id, add: Emails }),
      }
    );
    if (response) {
      switch (response.status) {
        case 200:
          fetchOneWorkOrder();
          break;
        case 400:
          console.log("verify your data");
          break;
        default:
          console.log("error");
          break;
      }
    }
  } catch (err) {
    console.error("Error submitting form", err);
  } finally {
    setIsLoading(false);
  }
};
