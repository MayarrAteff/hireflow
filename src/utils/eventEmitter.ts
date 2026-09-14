import type { SnackbarEvent } from '@/types/general.types';

type EventMap = {
  snackbar: SnackbarEvent;
};

type Listener<T> = (payload: T) => void;

/**
 * Tiny typed event bus so code outside React (e.g. the axios interceptor) can talk to the UI.
 * @example eventEmitter.emit('snackbar', { message: 'Network error occurred', variant: 'error' });
 */
class EventEmitter {
  private listeners = new Map<keyof EventMap, Set<Listener<any>>>();

  on<K extends keyof EventMap>(event: K, listener: Listener<EventMap[K]>): void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(listener);
  }

  off<K extends keyof EventMap>(event: K, listener: Listener<EventMap[K]>): void {
    this.listeners.get(event)?.delete(listener);
  }

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    this.listeners.get(event)?.forEach((listener) => listener(payload));
  }
}

export const eventEmitter = new EventEmitter();
