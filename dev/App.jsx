import Ymage from '../src/Ymage'
import "./App.scss"
import { useState } from 'react';



export function App() {
    const [state, setState] = useState(true);

    const url = [
        "dev/assets/p-1.jpg",
        "dev/assets/p-2.jpg",
        "dev/assets/p-3.jpg",
        "dev/assets/p-4.jpg",
        "dev/assets/p-5.jpg",
        "dev/assets/p-6.jpg",
        "dev/assets/p-7.jpg",
        "dev/assets/pro1.jpg",
        "dev/assets/webp60.webp"
    ];
    const cross = [
        "https://picsum.photos/200/300",
        ""
    ];

    const clickHandler = () =>{
        setState(!state);
    }

    return (
        <>
            <button onClick={clickHandler}>Toggle</button>
            <p>{state? "on" : "off"}</p>
            {state ? <>
                <Ymage 
                    url={url[7]} 
                    w={300} wh={3/2} r={10} 
                    type="div"
                    onSize={size => console.log("onSize: "+size.x+"/"+size.y)} 
                    copyright />
                <Ymage 
                    url={url[6]} 
                    w={300} wh={3/2} r={10} 
                    onSize={size => console.log("onSize: "+size.x+"/"+size.y)} />

            </>
                : null 
            }
        </>
    )
}

               // <img src={url[10]} alt="big webp" width="600" />

