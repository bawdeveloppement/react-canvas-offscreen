import { useEffect } from "react"

export const useDidMount = ( callback ) => {
    useEffect(() => {
        callback();
    //eslint-disable-next-line
    }, []);
}