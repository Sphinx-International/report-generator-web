export const getUserAccess = (): number[] => {
  try {
    const userString = localStorage.getItem("user");
    if (!userString) return [];

    const user = JSON.parse(userString) as { has_access_to?: number[] };

    return user.has_access_to || [];
  } catch (error) {
    console.error("Error retrieving user access:", error);
    return [];
  }
};
