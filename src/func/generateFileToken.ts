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

export async function storeFileInIndexedDB(
  file: File,
  fileId: number,
  fileType: "attachements" | "report" | "certificate"
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("fileStorageDB", 1);
       console.log("enterd")
    request.onupgradeneeded = function (event) {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("files")) {
        db.createObjectStore("files", { keyPath: "fileId" }); // KeyPath is fileId
      }
    };

    request.onsuccess = function (event) {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction("files", "readwrite");
      const objectStore = transaction.objectStore("files");

      const fileData = {
        fileId, // Ensure this is defined and valid
        fileType,
        fileContent: file, // Store the file as a Blob
      };

      console.log("Adding file data to IndexedDB:", fileData);

      const addRequest = objectStore.add(fileData);

      addRequest.onsuccess = function () {
        console.log("File stored successfully in IndexedDB with fileId:", fileId);
        resolve();
      };

      addRequest.onerror = function () {
        console.error("Error storing file in IndexedDB:", addRequest.error);
        reject(addRequest.error);
      };
    };

    request.onerror = function () {
      console.error("Error opening IndexedDB:", request.error);
      reject(request.error);
    };
  });
} 
  
 export interface IndexedDBFile {
    fileId: number;
    fileType: "attachements" |"report" |"certificate"; 
    fileContent: File; // This will be a `File` object
  }

  export async function getFilesByIdFromIndexedDB(fileId: number): Promise<IndexedDBFile[]> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("fileStorageDB", 1);
  
      // Handle the case when the database is newly created or upgraded
      request.onupgradeneeded = function (event) {
        const db = (event.target as IDBOpenDBRequest).result;
  
        // Check if the "files" object store exists; if not, create it
        if (!db.objectStoreNames.contains("files")) {
          db.createObjectStore("files", { keyPath: "fileId" }); // Define "fileId" as the keyPath
        }
      };
  
      request.onsuccess = function (event) {
        const db = (event.target as IDBOpenDBRequest).result;
  
        // Make sure the "files" object store exists
        if (!db.objectStoreNames.contains("files")) {
          console.error("Object store 'files' does not exist");
          reject(new Error("Object store 'files' does not exist"));
          return;
        }
  
        const transaction = db.transaction("files", "readonly");
        const objectStore = transaction.objectStore("files");
  
        const cursorRequest = objectStore.openCursor();
        const results: IndexedDBFile[] = []; // Array to store matching results
  
        cursorRequest.onsuccess = function (event) {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
  
          if (cursor) {
            const result = cursor.value as IndexedDBFile;
  
            // Compare the fileId with the stored fileId
            if (result.fileId === fileId) {
              results.push(result); // Add matching result to the array
            }
  
            cursor.continue(); // Continue searching for more matches
          } else {
            console.log("Files retrieved successfully from IndexedDB");
            resolve(results); // Return the array of results
          }
        };
  
        cursorRequest.onerror = function () {
          console.error("Error retrieving files from IndexedDB");
          reject(cursorRequest.error);
        };
      };
  
      request.onerror = function () {
        console.error("Error opening IndexedDB");
        reject(request.error);
      };
    });
  }
  
  
  export async function deleteFileFromIndexedDB(fileId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("fileStorageDB", 1);
  
      request.onsuccess = function (event) {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction("files", "readwrite");
        const objectStore = transaction.objectStore("files");
  
        const deleteRequest = objectStore.delete(fileId);
  
        deleteRequest.onsuccess = function () {
          console.log("File deleted successfully from IndexedDB with fileId:", fileId);
          resolve();
        };
  
        deleteRequest.onerror = function () {
          console.error("Error deleting file from IndexedDB");
          reject(deleteRequest.error);
        };
      };
  
      request.onerror = function () {
        console.error("Error opening IndexedDB");
        reject(request.error);
      };
    });
  }
  

