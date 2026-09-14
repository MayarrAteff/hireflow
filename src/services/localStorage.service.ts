/** Safe wrapper around window.localStorage (it can throw in private mode or when storage is blocked). */
export class LocalStorageService {
  getItem(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // storage unavailable; ignore
    }
  }

  delete(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // storage unavailable; ignore
    }
  }
}

export const localStorage = new LocalStorageService();
