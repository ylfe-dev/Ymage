import {useEffect, useState} from 'react'


export default function useImageFetcher(src, onSize, onLoad) {
    const [dataURL, setDataURL] = useState(getImageFromCache(src))

   
    function clearImageCache(){
        localStorage.clear();
    }
    function getImageFromCache() {
        return localStorage.getItem(src);
    }

    function setImageCache(durl) {
        localStorage.setItem(src, durl);
    }

    
    useEffect(()=>{

        window.addEventListener('beforeunload', clearImageCache);

        if(dataURL === null) {
            let imageSize = 0;
            let imageType = null;
                        
            fetch(src)
                .then((response) => {
                    imageType = response.headers.get('Content-Type');
                    imageSize  = response.headers.get('Content-Length');
                    return response.body;
                })
            .then((body) => {
                const reader = body.getReader();

                let size_published = false;
                let sos_markers = 0;
                let sop_marker = false;
                let analizing = (imageType === "image/jpeg");
                let last_update_size = 0;
                let chunks = new Array();
                let durl;

                return new ReadableStream({
                    start(controller) {
                        return pump();

                        function pump() {
                            return reader.read().then(({ done, value }) => {

                                if (done) {
                                    if(!durl)
                                        publishDataURL();
                                    setImageCache(durl);
                                    onLoad();
                                    onSizeHandler();
                                    controller.close();
                                    return;
                                } else {
                                    chunks.push(value);

                                    if (analizing)
                                        readJPGMarkers(value, 
                                            (sos) => {
                                                if(!sop_marker && ++sos_markers > 1)
                                                    jpegIsBaseline();
                                                else if(sop_marker && ++sos_markers > 2)
                                                    jpegFirstScan();
                                            }, 
                                            (sop) => jpegIsProgrssive()
                                        )
                                    else if(sop_marker)
                                        jpegUpdate();
                                }

                                controller.enqueue(value);
                                return pump();
                            });
                        }
                    }
                });



                function jpegIsProgrssive(){
                    sop_marker = true;
                    return false; 
                }

                function jpegIsBaseline(){
                    analizing = false;
                    return true;
                }

                function jpegFirstScan(){
                    if(analizing){
                        jpegUpdate(true);
                        analizing = false;
                    }
                }

                function jpegUpdate(first_scan = false){
                    const current_size = chunksSize(chunks)
                    if( first_scan 
                        || (current_size - last_update_size) >= (imageSize / 3) 
                        || current_size == imageSize )
                    {
                        last_update_size = current_size;
                        publishDataURL();
                        if(first_scan && onSize)
                            onSizeHandler();
                    }
                }

                function publishDataURL(){
                    const blob = new Blob(chunks, { type: imageType });
                    if(durl)
                        URL.revokeObjectURL(durl);
                    durl = URL.createObjectURL(blob);
                    setDataURL(durl)
                }

                function onSizeHandler() {
                    if(!size_published){
                        const tmp_image = new Image();
                        tmp_image.onload = () => {
                            onSize({x: tmp_image.naturalWidth ,y: tmp_image.naturalHeight});
                            size_published = true;
                        }
                        tmp_image.src = durl;
                    }
                }

            })
            .catch((err) => console.error(err));
        }

        return () => {
            window.removeEventListener('beforeunload', clearImageCache);
        }
    }, [])


    return dataURL;
}

const readJPGMarkers = (chunk, onSOS, onSOP) => {
    for(let i = 0; i < chunk.length; ++i){
        if(chunk[i] === 0xFF){
            switch(chunk[++i]){
                case 0xDA: onSOS(i); break;
                case 0xC2: onSOP(i); break;
            }
        } 
    }
}   



function chunksSize(chunks) {
    let size = 0;
    for(const chunk of chunks)
        size += chunk.length;
    return size;
}
