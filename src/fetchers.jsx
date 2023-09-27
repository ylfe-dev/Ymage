
const cache = new Map();

const fetch_queue = {
  max_concurent: 30,
  pending: 0,
  queue: [...Array(3)].map( () => [] ),
  add: (fetch_task, priority) => {
    fetch_queue.queue[priority-1].push(fetch_task);
    fetch_queue.rescan();
  },
  rescan: ()=>{
    let slots = fetch_queue.max_concurent - fetch_queue.pending;
    for(; slots > 0; --slots){
      for(const priority_group of fetch_queue.queue){
        if(priority_group.length){
          fetch_queue.start(priority_group.shift());
          break;
        }
      }
    }
  },
  start: (fetch_task)=>{
    fetch_queue.pending++;
    const promise = fetch(fetch_task.url)
      .then(
        (response) => {
          cache.set(fetch_task.url, response.clone());
          fetch_task.resolve(response);
          fetch_queue.pending--;
          fetch_queue.rescan();

        }, 
        (error)=>{
          fetch_task.reject(error);
          fetch_queue.pending--;
          fetch_queue.rescan();
        }
      )
  }
}


export const fetcher = (url, priority=3) => {
  if (cache.has(url)){
      const promise = new Promise((resolve, reject) => {
          resolve(cache.get(url).clone());
      });
      return promise;
  } else {
      const promise = new Promise((resolve, reject) => {
          const fetch_task = {
            url: url,
            resolve: (response) => {resolve(response)},
            reject:  (error) => {reject(error)},
          }
          fetch_queue.add(fetch_task, priority);
      })

    return promise;
  }
}

