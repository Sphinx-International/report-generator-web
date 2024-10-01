import { Resmail } from "../assets/types/Mails&Notifications";
const baseUrl = import.meta.env.VITE_BASE_URL;
import { EditingGroupMembers } from "../components/mails/View_edit_groupPopup";

export const fetchGroupMembers = async (
  group_id: number,
  setGroupMember: React.Dispatch<React.SetStateAction<string[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  updateFormValues?: React.Dispatch<React.SetStateAction<any>> // Optional parameter
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

    const data: Resmail[] = await response.json();

    // Extract emails and update the state
    const emails = data.map((member) => member.email);
    setGroupMember((prevMembers) => {
      const newEmails = emails.filter((email) => !prevMembers.includes(email));
      return [...prevMembers, ...newEmails];
    });

    // Update form values if function provided
    if (updateFormValues) {
      updateFormValues((prev: any) => {
        const newEmails = emails.filter((email) => !prev.emails.includes(email));
        return {
          ...prev,
          emails: [...prev.emails, ...newEmails],
        };
      });
    }
  } catch (err) {
    console.error("Error: ", err);
  } finally {
    setIsLoading(false);
  }
};

export const fetchGroupMembersForResmailArray = async (
  group_id: number,
  setGroupMember: React.Dispatch<React.SetStateAction<Resmail[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  updateFormValues?: React.Dispatch<React.SetStateAction<any>> // Optional parameter
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

    const data: Resmail[] = await response.json();

    setGroupMember((prevMembers) => {
      const newMembers = data.filter(
        (member) =>
          !prevMembers.some(
            (existingMember) => existingMember.email === member.email
          )
      );

      return [...prevMembers, ...newMembers];
    });

    // Update form values if function provided
    if (updateFormValues) {
      updateFormValues((prev: any) => {
        const newEmails = data
          .map((member) => member.email)
          .filter((email) => !prev.emails.includes(email));
        return {
          ...prev,
          emails: [...prev.emails, ...newEmails],
        };
      });
    }
  } catch (err) {
    console.error("Error: ", err);
  } finally {
    setIsLoading(false);
  }
};

export const fetchGroupMembersForEditing = async (
  group_id: number,
  setGroupMember: React.Dispatch<React.SetStateAction<EditingGroupMembers>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  existingMembers: Resmail[], // New parameter for existing members
  updateFormValues?: React.Dispatch<React.SetStateAction<any>> // Optional parameter
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

    const data: Resmail[] = await response.json();

    // Update the state with new members after double-checking for duplicates
    setGroupMember((prevState) => {
      const currentAddedEmails = new Set(prevState.add.map((member) => member.email));
      const existingEmails = new Set(existingMembers.map((member) => member.email));

      const newMembers = data.filter(
        (member) =>
          !existingEmails.has(member.email) && // Check if not in `existingMembers`
          !currentAddedEmails.has(member.email) // Check if not already in `setGroupMember.add`
      );

      return {
        ...prevState,
        add: [...prevState.add, ...newMembers], // Add unique new members
        group_id: group_id,
      };
    });

    // Update form values if the function is provided
    if (updateFormValues) {
      updateFormValues((prev: any) => {
        const newEmails = data
          .map((member) => member.email)
          .filter((email) => !prev.emails.includes(email));
        return {
          ...prev,
          emails: [...prev.emails, ...newEmails],
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
