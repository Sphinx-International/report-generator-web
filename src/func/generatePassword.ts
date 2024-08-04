export const generatePassword = (): string => {
    const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
  
    const getRandomChar = (chars: string): string => chars[Math.floor(Math.random() * chars.length)];
  
    // Generate 6 random alphabetic characters
    let password = Array.from({ length: 6 }, () => getRandomChar(alphabet)).join('');
  
    // Generate 2 random numeric characters
    const digits = Array.from({ length: 2 }, () => getRandomChar(numbers)).join('');
  
    // Insert the numeric characters at random positions in the password
    for (const digit of digits) {
      const pos = Math.floor(Math.random() * (password.length + 1));
      password = password.slice(0, pos) + digit + password.slice(pos);
    } 
    console.log(password)
  
    return password;
  };
  
  export default generatePassword;
  