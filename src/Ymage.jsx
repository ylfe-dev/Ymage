import React from 'react'
import './Ymage.scss';

import { useRef, useState, useEffect } from 'react';
import useIntersectionObserver from "./useIntersectionObserver.jsx"

export default function Ymage({url, copyright, lazy="200px", type="img", onLoad, style, className="", ...props}) {
	const container = useRef();
	const isVisible = (lazy === false) ? true : useIntersectionObserver(container, lazy);
    const options = {as: type, copyright: copyright}; 

    function stylesFromProps(props) {
        const styles = {};
        if(props.w) styles.width = props.w;
        if(props.h) styles.height = props.h;
        if(props.r) styles.borderRadius = props.r;
        if(props.wh) styles.aspectRatio = props.wh;
        return styles;
    }

    function contextMenuHandler(){
        if(options.copyright) {
            container.current.classList.add("copyright")
            setTimeout(() => container.current.classList.remove("copyright"), 1000);
        }
    }

    return (
		<figure 
        {...props} 
        style={{...stylesFromProps(props), ...style}}
        ref={container} 
        className={"Ymage " + className}
        onContextMenu={contextMenuHandler}>
			{isVisible ? <FetchImageNative url={url} options={options} onLoad={onLoad}/> : null }
		</figure>
	)
}

const FetchImageNative = ({url, options, onLoad}) => {
    const [showImage, setShowImage] = useState(true);
    const loading = useRef(true);
    const fade = useRef(false);

    useEffect(()=>{
       setTimeout(()=>{
           if(loading.current)
               setShowImage(false)
       }, 17)
    },[])

    const img_tmp = new Image();
    img_tmp.src = url;
    img_tmp.onload = () => {
        loading.current = false;
        if(onLoad) onLoad({x: img_tmp.width, y: img_tmp.height})
        img_tmp.src = null;
        if(!showImage){
            setShowImage(true);
            fade.current = true;
        }
    }

return showImage ? 
    <PrintImage url={url} options={{...options, fade: fade.current}}/>
    :
    <Loader/>
}

const PrintImage = ({url, options}) => {
    if(options.as === "img")
        return <img
            src={url} 
            className = {(options.fade ? "fade-in" : "") + (options.copyright ? " copyright" : "")}
            />
    else return <div 
            className = {(options.fade ? "fade-in" : "") + (options.copyright ? " copyright" : "")} 
            style = {{backgroundImage:"url('" + url + "')"}}
            ></div>
}


const Loader = () =>{
	return( 
        <svg 
            className="ymage-spinner" 
            xmlns="http://www.w3.org/2000/svg" 
            xmlnsXlink="http://www.w3.org/1999/xlink" 
            viewBox="0 0 100 100" 
            enableBackground="new 0 0 0 0" >

            <path fill="#fff" d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50"></path>
        </svg>
    )
}


