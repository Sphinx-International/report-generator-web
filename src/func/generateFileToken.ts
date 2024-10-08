import { ResOfOneMission } from "../assets/types/Mission";

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
  fileType: "attachements" | "report" | "certificate",
  workorderId?: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("fileStorageDB", 3); // Increment version to trigger onupgradeneeded

    request.onupgradeneeded = function (event) {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create or upgrade the "files" object store
      let objectStore;
      if (!db.objectStoreNames.contains("files")) {
        // Create the object store with "fileId" as the key path
        objectStore = db.createObjectStore("files", { keyPath: "fileId" });

        // Create an index on 'workorderId'
        objectStore.createIndex("workorderId", "workorderId", { unique: false });
      } else {
        // If the object store already exists, get it from the transaction
        objectStore = request.transaction?.objectStore("files");

        // Create the index on 'workorderId' if it does not already exist
        if (objectStore && !objectStore.indexNames.contains("workorderId")) {
          objectStore.createIndex("workorderId", "workorderId", { unique: false });
        }
      }
    };

    request.onsuccess = function (event) {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction("files", "readwrite");
      const objectStore = transaction.objectStore("files");

      const fileData = {
        fileId,
        fileType,
        fileContent: file, // Store the file as a Blob
        workorderId,
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
      const request = indexedDB.open("fileStorageDB", 3);
  
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
      const request = indexedDB.open("fileStorageDB", 3);
  
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

  function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("fileStorageDB", 3);
      request.onupgradeneeded = function (event) {
        const db = (event.target as IDBOpenDBRequest).result;
  
        // Create the object store if it doesn't exist
        if (!db.objectStoreNames.contains("files")) {
          const objectStore = db.createObjectStore("files", { keyPath: "fileId" });
  
          // Create an index for workorderId
          objectStore.createIndex("workorderId", "workorderId");
        }
      };
  
      request.onsuccess = function (event) {
        resolve((event.target as IDBOpenDBRequest).result);
      };
  
      request.onerror = function () {
        reject(request.error);
      };
    });
  }
  
  
  

  export async function getFilesByWorkorderIdFromIndexedDB(workorderId: string): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await openDatabase();
        const transaction = db.transaction("files", "readonly");
        const objectStore = transaction.objectStore("files");

        // Ensure the index name matches what was created in onupgradeneeded
        const index = objectStore.index("workorderId");
        const range = IDBKeyRange.only(workorderId);
        const cursorRequest = index.openCursor(range);
        const results: any[] = [];

        cursorRequest.onsuccess = function (event) {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
  
          if (cursor) {
            results.push(cursor.value);
            cursor.continue();
          } else {
            resolve(results);
          }
        };
  
        cursorRequest.onerror = function () {
          reject(cursorRequest.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }
  
  
  
  
  export async function syncIndexedDBWithFetchedFiles(
    workorderId: string,
    fetchedData: ResOfOneMission
  ): Promise<void> {
    try {
      // Retrieve files from IndexedDB for the given workorderId
      const indexedDBFiles = await getFilesByWorkorderIdFromIndexedDB(workorderId);
  
      // Collect all file IDs from fetched data
      const fetchedFileIds = new Set<number>();
  
      // Collect file IDs from attachments, reports, and certificates
      fetchedData.attachments.forEach((file) => fetchedFileIds.add(file.id));
      fetchedData.reports?.forEach((file) => fetchedFileIds.add(file.id));
      fetchedData.acceptance_certificates?.forEach((file) => fetchedFileIds.add(file.id));
  
      // Filter out files that are present in IndexedDB but not in the fetched data
      const filesToDelete = indexedDBFiles.filter((file) => {
        // Check if the file is not in the fetched data
        const isFileMissingFromFetchedData = !fetchedFileIds.has(file.fileId);
  
        // Check if the file is in the fetched data and marked as completed
        const isFileCompleted = fetchedData.attachments.some(
          (f) => f.id === file.fileId && f.is_completed
        ) ||
        fetchedData.reports?.some((f) => f.id === file.fileId && f.is_completed) ||
        fetchedData.acceptance_certificates?.some((f) => f.id === file.fileId && f.is_completed);
  
        // Return files to delete if they are either missing from fetched data or completed
        return isFileMissingFromFetchedData || isFileCompleted;
      });
  
     // console.log("Files to delete:", filesToDelete);
  
      // Delete files that are no longer present in the fetched data or are completed
      for (const file of filesToDelete) {
        await deleteFileFromIndexedDB(file.fileId);
        console.log(`Deleted file with fileId ${file.fileId} from IndexedDB.`);
      }  
    } catch (error) {
      console.error("Error syncing files between IndexedDB and fetched data:", error);
    }
  }
  
