import {CustomEventCallback} from "./CustomEventCallback";

export class CustomEvent<T> {
    private listeners: CustomEventCallback<T>[] = [];

    subscribe(callback: CustomEventCallback<T>) {
        this.listeners.push(callback);
    }

    unsubscribe(callback: CustomEventCallback<T>) {
        const index = this.listeners.indexOf(callback);
        if (index !== -1) {
            this.listeners.splice(index, 1);
        }
    }

    trigger(data: T) {
        for (const listener of this.listeners) {
            listener(data);
        }
    }
}