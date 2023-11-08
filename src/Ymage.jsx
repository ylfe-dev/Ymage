import React from 'react'
import './Ymage.scss';

import { useRef, useState, useEffect } from 'react';
import useIntersectionObserver from "./useIntersectionObserver.jsx"
import useImageFetcher from './useImageFetcher.jsx'


export default function Ymage({
    url, 
    copyright, 
    lazy="200px", 
    type="img", 
    onLoad, 
    onSize,
    style,
    className="", 
    ...props
}) {

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
            container.current.classList.add("copyright");
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
			{isVisible ? <FetchImage url={url} options={options} onSize={onSize} onLoad={onLoad}/> : null }
		</figure>
	)
}


const FetchImage = ({url, options, onLoad, onSize}) => {
    const imageData = useImageFetcher(url, onSize, onLoad);
    const [showLoader, setShowLoader] = useState(true);
    const fade = useRef(false);

    useEffect(()=>{

        console.log("new urlData: "+ imageData)
        if(showLoader && imageData)
            setTimeout(() => setShowLoader(false), 1000)
    },[imageData])

    useEffect(()=>{
        if(imageData === null){
            fade.current = true;
            console.log("image fetching = fading/loading")
        }
    },[])


    return (<>
        {showLoader ? <Loader/> : null}
        {imageData ? 
            <PrintImage url={imageData} options={{...options, fade: fade.current}}/> : null}
        </>)
}


const PrintImage = ({url, options}) => {
    const imageRef = useRef(null);
    useEffect(()=>{
        imageRef.current.src = null;
        imageRef.current.src = url;

    }, [url])

    if(options.as === "img")
        return <img
            ref={imageRef}
            className = {
                  (options.fade ? "fade-in" : "") 
                + (options.copyright ? " copyright" : "")}
            />
    else return <div 
            className = {
                  (options.fade ? "fade-in" : "") 
                + (options.copyright ? " copyright" : "")} 
            style = {{backgroundImage:"url('" + url + "')"}}
            ></div>
}


const Loader = () =>{
	return( 
        <svg 
            data-testid="placeholder-spinner"
            className="ymage-spinner" 
            xmlns="http://www.w3.org/2000/svg" 
            xmlnsXlink="http://www.w3.org/1999/xlink" 
            viewBox="0 0 100 100" 
            enableBackground="new 0 0 0 0" >

            <path fill="#fff" d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50"></path>
        </svg>
    )
}



