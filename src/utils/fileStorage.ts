import type { Client } from '../types';

let fileHandle: FileSystemFileHandle | null = null;

export function isFileConnected(): boolean {
  return fileHandle !== null;
}

/** Open an existing JSON file or create a new one and load its clients. */
export async function connectFile(): Promise<Client[] | null> {
  try {
    [fileHandle] = await (window as any).showOpenFilePicker({
      types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }],
      multiple: false,
    });
    const file = await fileHandle!.getFile();
    const text = await file.text();
    return JSON.parse(text) as Client[];
  } catch {
    fileHandle = null;
    return null;
  }
}

/** Create a new JSON file and save clients to it. */
export async function createFile(clients: Client[]): Promise<boolean> {
  try {
    fileHandle = await (window as any).showSaveFilePicker({
      suggestedName: 'kendra-clients.json',
      types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }],
    });
    return writeToFile(clients);
  } catch {
    fileHandle = null;
    return false;
  }
}

/** Write clients to the connected file. */
export async function writeToFile(clients: Client[]): Promise<boolean> {
  if (!fileHandle) return false;
  try {
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(clients, null, 2));
    await writable.close();
    return true;
  } catch {
    return false;
  }
}

export function disconnectFile(): void {
  fileHandle = null;
}
