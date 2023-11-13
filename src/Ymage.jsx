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
    onError,
    style,
    className="",
    color="#b7b7b7", 
    bg="#d0d0d0",
    w, h, wh, r,
    ...props
}) {

	const container = useRef();
	const isVisible = (lazy === false) ? true : useIntersectionObserver(container, lazy);
    const options = {as: type, copyright: copyright, color: color }; 

    function stylesFromProps(props) {
        const styles = {};
        if(w) styles.width = w;
        if(h) styles.height = h;
        if(r) styles.borderRadius = r;
        if(wh) styles.aspectRatio = wh;
        if(bg) styles.backgroundColor = bg;
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
        style={{...stylesFromProps(), ...style}}
        ref={container} 
        className={"Ymage " + className}
        onContextMenu={contextMenuHandler}>
			{isVisible ? 
                <FetchImage 
                    url={url} 
                    options={options} 
                    onSize={onSize} 
                    onLoad={onLoad}
                    onError={onError}
                /> : null }
		</figure>
	)
}


const FetchImage = ({url, options, onLoad, onSize, onError}) => {
    const imageData = useImageFetcher(url, onSize, onLoad, handleError);
    const [showLoader, setShowLoader] = useState(true);
    const [showError, setShowError] = useState(false);
    const fade = useRef(false);

    function handleError(e) {
        setShowError(true);
        setShowLoader(false);
        if(typeof onError === "function") onError()
    }

    useEffect(()=>{
        if(showLoader && imageData)
            setTimeout(() => setShowLoader(false), 1000)
    },[imageData])

    useEffect(()=>{
        if(imageData === null)
            fade.current = true;
    },[])


    return (<>
        {showLoader ? <Loader color={options.color}/> : null}
        {(imageData && !showError) ? 
            <PrintImage url={imageData} options={{...options, fade: fade.current}}/> : null}
        {showError ? <ImageError color={options.color} /> : null}
        </>)
}


const PrintImage = ({url, options}) => {
    const imageRef = useRef(null);
    useEffect(()=>{
        if(options.as === "img"){
            imageRef.current.src = null;
            imageRef.current.src = url;
        } else 
            imageRef.current.style.backgroundImage="url('"+url+"')";
    }, [url])

    if(options.as === "img")
        return <img
            ref={imageRef}
            className = {
                  (options.fade ? "fade-in" : "") 
                + (options.copyright ? " copyright" : "")}
            />
    else return <div 
            ref={imageRef}
            className = {
                  (options.fade ? "fade-in" : "") 
                + (options.copyright ? " copyright" : "")} 
            ></div>
}


const Loader = ({color}) =>{
	return( 
        <svg 
            data-testid="placeholder-spinner"
            className="ymage-spinner" 
            xmlns="http://www.w3.org/2000/svg" 
            xmlnsXlink="http://www.w3.org/1999/xlink" 
            viewBox="0 0 100 100" 
            enableBackground="new 0 0 0 0" >

            <path fill={color} d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50"></path>
        </svg>
    )
}

const ImageError = ({color}) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
        <path fill={color} d="M 16 7 C 13.36052 7 11.067005 8.2378107 9.421875 10.052734 C 9.2797018 10.03501 9.1552693 10 9 10 C 6.8026661 10 5 11.802666 5 14 C 5 14.0074 5.0018931 14.008395 5.0019531 14.015625 C 3.2697139 15.069795 2 16.832921 2 19 C 2 22.301625 4.6983746 25 8 25 L 24 25 C 27.301625 25 30 22.301625 30 19 C 30 15.842259 27.509898 13.303165 24.40625 13.082031 C 23.18074 9.5665933 19.923127 7 16 7 z M 16 9 C 19.27847 9 22.005734 11.243586 22.775391 14.271484 L 22.978516 15.072266 L 23.800781 15.023438 C 24.012411 15.011276 24.071091 15 24 15 C 26.220375 15 28 16.779625 28 19 C 28 21.220375 26.220375 23 24 23 L 8 23 C 5.7796254 23 4 21.220375 4 19 C 4 17.338324 5.0052754 15.930166 6.4335938 15.320312 L 7.1289062 15.023438 L 7.03125 14.271484 C 7.0103607 14.109285 7 14.025078 7 14 C 7 12.883334 7.8833339 12 9 12 C 9.14 12 9.2894098 12.02145 9.4628906 12.0625 L 10.087891 12.208984 L 10.482422 11.703125 C 11.765559 10.05801 13.75001 9 16 9 z M 15.984375 10.986328 A 1.0001 1.0001 0 0 0 15 12 L 15 16 A 1.0001 1.0001 0 1 0 17 16 L 17 12 A 1.0001 1.0001 0 0 0 15.984375 10.986328 z M 16 19 A 1 1 0 0 0 15 20 A 1 1 0 0 0 16 21 A 1 1 0 0 0 17 20 A 1 1 0 0 0 16 19 z" fontWeight="400" fontFamily="sans-serif" white-space="normal" overflow="visible"/>
        </svg>
    )
}



