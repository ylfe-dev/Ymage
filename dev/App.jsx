import Ymage from '../src/Ymage'
import "./App.scss"


export function App() {
    const url = ["dev/assets/p-1.jpg", "dev/assets/p-2.jpg", "dev/assets/p-3.jpg", "dev/assets/p-4.jpg", "dev/assets/p-5.jpg", "dev/assets/p-6.jpg", "dev/assets/p-7.jpg"];
  return <>
        <Ymage url={url[0]} w={300} r={10} ratio={3/2} />
        <Ymage url={url[2]} type="div" lazy={false} copyright style={{width:300, height:200, borderRadius:10}} />
        <Ymage url={url[4]} style={{width:300, height:200, borderRadius:10}} />
        <Ymage url={url[6]} style={{width:300, height:200, borderRadius:10}} />
        </>
}


