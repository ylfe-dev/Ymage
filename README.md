# Ymage - Images simplified

Ymage is react-native, 0-dependencies component that takes care of loading optimization, neat presentation, copyright protection, caching and some extras with just one line of code.


## Installation

Install module:
```shell
$ npm install ymage
```

Import module to 'yourcode.js':
```JavaScript
import {Ymage} from 'ymage'
```

## Usage


```JavaScript
<Ymage url="fruit.jpg" w={200} h={300} r={10}/>
```

Or 'style' equivalent:

```JavaScript
<Ymage url="fruit.jpg" style={{width:200, height:300, borderRadius: 10}}/>
```

![alt text for screen readers](./public/out3.gif "Text to show on mouseover")