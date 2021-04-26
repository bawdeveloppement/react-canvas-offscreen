import { useMemo } from "react";


export const useWorker = ( worker ) => {
    // Return a memoised version of the worker. To avoid recreation of the worker when app is updating and when deps haven't change.
    return useMemo(() => {
        const workerString = worker.toString()
        const workerBlob = new Blob(["(" + workerString + ")()"]);
        const workerUrl = URL.createObjectURL(workerBlob);
        return new Worker(workerUrl);
    }, [worker]) 
}