import { createRef, useCallback, useEffect, useMemo, useState } from "react"
import { useWorker } from "../Hooks/useWorker";
import CanvasWorker from './CanvasWorker';


const decodeKeys = {
    90: "up",
    83: "down",
    81: "left",
    68: "right"
}

const ShopItem = ({ name, price}) => {
    return <div style={{ border: "1px solid black"}}>
        {price} - {name}
    </div>
}

const Shop = () => {
    const shopItems = useMemo(() => [
        { name: "Banana", price: 50 }, 
        { name: "Health Potion", price: 100 },
        { name: "Dexterity Potion", price: 200 },
    ].map((props, i) => <ShopItem key={i} {...props} /> ));
    return <div>
        {shopItems}
    </div>
}

export const Canvas = () => {
    const thisRef = useMemo(() => createRef(), []) 
    const thisWorker = useWorker(CanvasWorker);
    const [ offSetup, setOffSetup ] = useState()
    const [ mousePos, setMousePos ] = useState({ x: 0, y: 0 });
    const [ mousePressed, setMousePressed ] = useState(false);
    const [ keyboardPressed, setKeyboardPressed ] = useState({
        down: false,
        up: false,
        left: false,
        right: false,
    });
    const [ money, setMoney ] = useState(0)

    useEffect(() => {
        // Offscreen need to be transferred to bdazdae cloned  via array in 2nd arg. So you could not do postMessage({ canvas: offscreen });
        // In the future we want to detect once we transfer an object to avoid 
        if ( !!thisRef.current && ('OffscreenCanvas' in window) && !offSetup) {
            const offscreen = thisRef.current.transferControlToOffscreen()
            thisWorker.postMessage({ id: 0, data: offscreen }, [ offscreen ]);
            setOffSetup(true);
        }
    }, [ thisRef, offSetup, thisWorker ]);

    const handleWorkerMessage = useCallback((e) => {
        if (!!e.data.id) {
            if (e.data.id === 2) {
                console.log(typeof(e.data.data))
                setMoney(money + e.data.data);
            }
        }
    }, [ thisWorker, money ])

    useEffect(() => {
        thisWorker.addEventListener("message", handleWorkerMessage);
        return () => thisWorker.removeEventListener("message", handleWorkerMessage);
    });

    //#region Send states to the worker after each state update;
    useEffect(() => {
        thisWorker.postMessage({ id: 1, data: mousePos });
    }, [ mousePos, thisWorker ])

    useEffect(() => {
        thisWorker.postMessage({ id: 2, data: mousePressed });
    }, [ mousePressed, thisWorker ]);

    //#endregion

    //#region BIND EVENTS + CALLBACKS MEMOISED
    const handleMouseMove = useCallback(function (event) {
        setMousePos({ x: event.clientX, y: event.clientY });
    }, []);
    const handleMouseDown = useCallback(function (event) {
        setMousePressed(true);
    }, []);
    const handleMouseUp = useCallback(function (event) {
        setMousePressed(false);
    }, []);
    
    const handleKeyUp = useCallback(function (event) {
        thisWorker.postMessage({ id: 4, keyCode: event.keyCode})
    }, []);
    const handleKeyDown = useCallback(function (event) {
        thisWorker.postMessage({ id: 3, keyCode: event.keyCode})
    }, []);
    const handleWindowResize = useCallback((event) => {
        thisWorker.postMessage({
            id: 5,  
            width: event.currentTarget.innerWidth,
            height: event.currentTarget.innerHeight
        });
    }, []);

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('mousedown', handleMouseDown);
        return () => {
            document.removeEventListener("mousedown", handleMouseDown);
        }
    }, []);
    
    useEffect(() => {
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener("mouseup", handleMouseUp);
        }
    }, []);
    
    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        }
    }, []);
    
    useEffect(() => {
        document.addEventListener('keyup', handleKeyUp);
        return () => {
            document.removeEventListener("keyup", handleKeyUp);
        }
    }, []);

    useEffect(() => {
        window.addEventListener('resize', handleWindowResize);
        return () => window.removeEventListener('resize', handleWindowResize);
    }, []);
    //#endregion
    

    return (
        <div>
            <canvas ref={thisRef} width={window.innerWidth} height={600}>
                <div style={{ zIndex: 40}}>dzadaz</div>
            </canvas>
            <div style={{ border: "2px black solid" }}>
                Interface
                <div>
                    My money: {money}
                </div>
            </div>
            { money > 0 ? <Shop/> : null }
        </div>
    );
}