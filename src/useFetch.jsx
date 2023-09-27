import { useState, useRef, useEffect, useMemo  } from 'react';
import { fetcher } from './fetchers';


const defaults = {
  while_updating: "loader", // loader, static
};



export default function useFetch (options) {
  const type_select = {
    blob:()=>{return FetchOptions({...options, type: "blob"})},
    json:()=>{return FetchOptions({...options, type: "json"})},
    text:()=>{return FetchOptions({...options, type: "text"})}
  }
  return type_select
}



const FetchOptions = options => useFetcher({...defaults, ...options})


const useFetcher = (options) => {  
    const request = useRef({
        state: "PENDING",
        url: null, 
    });
  
    const [retrieved, setRetrieved] = useState();
    const last_content = useRef(null);
    const fetched_data = useRef(initFetchData[options.type]);

    const onLoad = (data) => {
        fetched_data.current = data;
        setTimeout(()=>{
            request.current.state = "OK";
            setRetrieved(data);
        }, Math.random()*800);
    }

    const onError = (err) => {
        fetched_data.current = err;
        request.current.state = "ERROR";
    }

    const load = (url) => {
        if(request.current.url !== url){
            request.current.url = url;                
            request.current.state = "PENDING";
            fetcher(request.current.url, 3)
            .then(data => {
                switch(options.type){
                    case "blob": return data.blob();
                    case "json": return data.json();
                    case "text": return data.text();
            }})
            .then(data => onLoad(data))
            .catch(error => onError(error))
        }
    }


    const Wrapper = ({ url, children, loader = null, error =  null }) => {
        load(url)

        switch(request.current.state){
            case "PENDING":
                if(options.while_updating=="static" && last_content)
                    return last_content;
                else 
                    return loader;
                break;
            case "ERROR":
                return null;
                break;
            default: 
                last_content.current = children; 
                return children;
                break;
        }
    }

  return  [fetched_data.current, Wrapper];
}



  const initFetchData =  {
    blob: new Blob(), 
    json: {},
    text:  ""
  };
