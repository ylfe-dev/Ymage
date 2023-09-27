import { Ymage } from './index.js'
import "./App.scss"


export function App() {
    const url = ["/p-1.jpg", "/p-2.jpg", "/p-3.jpg", "/p-4.jpg", "/p-5.jpg", "/p-6.jpg", "/p-7.jpg"];
  return <>
        <Ymage url={url[0]} w={300} r={10} ratio={3/2} />
        <Ymage url={url[2]} protect style={{width:300, height:200, borderRadius:10}} />
        <Ymage url={url[4]} protect style={{width:300, height:200, borderRadius:10}} />
        <Ymage url={url[6]} protect style={{width:300, height:200, borderRadius:10}} />
        </>
}


