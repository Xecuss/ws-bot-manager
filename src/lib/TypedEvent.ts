interface Listener<T>{
    <T>(event: T): any;
}

export interface Disposable {
    dispose(): any;
}

export class TypedEvent<N, T> {
    private listeners: Map<N, Listener<T>[]> = new Map();
    private listenersOncer: Map<N, Listener<T>[]> = new Map();

    public on = (eventType: N, listener: Listener<T>): Disposable => {
        let listenerList = this.listeners.get(eventType);

        if(listenerList === undefined){
            listenerList = [];
            this.listeners.set(eventType, listenerList);
        }

        listenerList.push(listener);

        return {
            dispose: () => this.off(eventType, listener)
        };
    };

    public once = (eventType: N, listener: Listener<T>): void => {
        let listenerOnceList = this.listenersOncer.get(eventType);

        if(listenerOnceList === undefined){
            listenerOnceList = [];
            this.listenersOncer.set(eventType, listenerOnceList);
        }

        listenerOnceList.push(listener);
    };

    public off = (eventType: N, listener: Listener<T>): void => {
        let listenerList = this.listeners.get(eventType);

        if(listenerList === undefined) return;

        const callbackIndex = listenerList.indexOf(listener);
        if (callbackIndex > -1) listenerList.splice(callbackIndex, 1);
    };

    public emit = (eventType: N, event: T) => {
        let listenerList = this.listeners.get(eventType);

        if(listenerList !== undefined) {
            listenerList.forEach(listener => listener(event));
        }

        let listenerOnceList = this.listenersOncer.get(eventType);

        if(listenerOnceList !== undefined) {
            listenerOnceList.forEach(listener => listener(event));
            this.listenersOncer.set(eventType, []);
        }
    };
}