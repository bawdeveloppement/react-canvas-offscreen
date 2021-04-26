import { createContext } from "react"

const CanvasContext = createContext({})

const Canvas = () => {
    
}

// useCanvas is here to analyse message and pass it canvasRenderer
export const useCanvasContext = () => {
    return useContext(CanvasContext)
}