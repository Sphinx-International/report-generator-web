export async function generateFileToken(file: File): Promise<string> {
    const crypto = window.crypto; // For compatibility with older browsers

    // Read the file content as an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Create a hash using SHA-256
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);

    // Convert the hash buffer to a hexadecimal string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

    return hashHex;
}

