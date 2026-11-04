import {createResponseHandler} from "./createResponseHandler";
import {SimpleEventBus, SimpleEventBusData} from "../types/eventbus.types";
import {createEventHandler} from "./createEventHandler";

type Listener = (data: SimpleEventBusData) => void;

const createFakeEventBus = () => {
    const listeners = new Set<Listener>();

    const eventBus: SimpleEventBus = {
        emit: (data) => {
            // Deliver asynchronously, like IPC does.
            setTimeout(() => listeners.forEach((listener) => listener(data)), 0);
        },
        listen: (callback) => {
            listeners.add(callback as Listener);

            return () => listeners.delete(callback as Listener);
        },
        listenOnce: (callback) => {
            const handle: Listener = (data) => {
                listeners.delete(handle);
                (callback as Listener)(data);
            }

            listeners.add(handle);
        },
    };

    return {eventBus, listenerCount: () => listeners.size};
}

describe('createResponseHandler - requestResponse', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('resolves with the response data when the handler answers in time', async () => {
        const {eventBus, listenerCount} = createFakeEventBus();
        const eventHandler = createEventHandler(eventBus);
        const responseHandler = createResponseHandler(eventHandler);

        responseHandler.handleResponse<{ name: string }, { history: number[] }>('settings', () => true, () => ({
            history: [1, 2, 3],
        }));

        const request = responseHandler.requestResponse<{ history: number[] }, { name: string }>('settings', {name: 'clipboard'}, {timeout: 1000});

        await jest.advanceTimersByTimeAsync(10);

        await expect(request).resolves.toEqual({history: [1, 2, 3]});
        // Only the handleResponse listener is left behind.
        expect(listenerCount()).toBe(1);
    });

    it('still resolves when the handler is slow but within the timeout', async () => {
        const {eventBus} = createFakeEventBus();
        const eventHandler = createEventHandler(eventBus);
        const responseHandler = createResponseHandler(eventHandler);

        responseHandler.handleResponse('settings', () => true, () => new Promise<SimpleEventBusData>((resolve) => {
            setTimeout(() => resolve({slow: true}), 500);
        }));

        const request = responseHandler.requestResponse('settings', {}, {timeout: 1000});

        await jest.advanceTimersByTimeAsync(600);

        await expect(request).resolves.toEqual({slow: true});
    });

    it('rejects and stops listening when the timeout is hit', async () => {
        const {eventBus, listenerCount} = createFakeEventBus();
        const eventHandler = createEventHandler(eventBus);
        const responseHandler = createResponseHandler(eventHandler);

        // Nobody handles the request.
        const request = responseHandler.requestResponse('settings', {}, {timeout: 200});
        const assertion = expect(request).rejects.toMatch(/Timed out/);

        expect(listenerCount()).toBe(1);

        await jest.advanceTimersByTimeAsync(250);

        await assertion;
        expect(listenerCount()).toBe(0);
    });

    it('never times out when no timeout is given', async () => {
        const {eventBus} = createFakeEventBus();
        const eventHandler = createEventHandler(eventBus);
        const responseHandler = createResponseHandler(eventHandler);

        responseHandler.handleResponse('settings', () => true, () => new Promise<SimpleEventBusData>((resolve) => {
            setTimeout(() => resolve({late: true}), 60_000);
        }));

        const request = responseHandler.requestResponse('settings', {});

        await jest.advanceTimersByTimeAsync(61_000);

        await expect(request).resolves.toEqual({late: true});
    });
});
