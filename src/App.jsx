import { Ymage } from './module'
import "./App.scss"


export function App() {
    const url = ["assets/p-1.jpg", "assets/p-2.jpg", "assets/p-3.jpg", "assets/p-4.jpg", "assets/p-5.jpg", "assets/p-6.jpg", "assets/p-7.jpg"];
  return <>
        <Ymage url={url[0]} w={300} r={10} ratio={3/2} />
        <Ymage url={url[2]} type="div" lazy={false} copyright style={{width:300, height:200, borderRadius:10}} />
        <Ymage url={url[4]} style={{width:300, height:200, borderRadius:10}} />
        <Ymage url={url[6]} style={{width:300, height:200, borderRadius:10}} />
        </>
}


