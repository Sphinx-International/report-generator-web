export const getRole = (): number | null => {
    const role = localStorage.getItem('role');
    return role ? Number(role) : null;
  };