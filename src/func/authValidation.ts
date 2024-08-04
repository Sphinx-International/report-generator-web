export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): boolean {
    const passwordRegex = /^(?=.*[a-z]).{6,}$/;
    return passwordRegex.test(password);
  }

  //  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?]).{8,}$/;

  
export const check4DigitCode = (code: string[]) => {
  const allFilled = code.every((value) => value !== "");
  if (allFilled) {
    return true;
  } else {
    return false;
  }
};
