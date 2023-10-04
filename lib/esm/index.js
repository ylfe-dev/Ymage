import React, { useRef, useState, useEffect } from 'react';

function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}

const cache = new Map();
const fetch_queue = {
  max_concurent: 30,
  pending: 0,
  queue: [...Array(3)].map(() => []),
  add: (fetch_task, priority) => {
    fetch_queue.queue[priority - 1].push(fetch_task);
    fetch_queue.rescan();
  },
  rescan: () => {
    let slots = fetch_queue.max_concurent - fetch_queue.pending;
    for (; slots > 0; --slots) {
      for (const priority_group of fetch_queue.queue) {
        if (priority_group.length) {
          fetch_queue.start(priority_group.shift());
          break;
        }
      }
    }
  },
  start: fetch_task => {
    fetch_queue.pending++;
    fetch(fetch_task.url).then(response => {
      cache.set(fetch_task.url, response.clone());
      fetch_task.resolve(response);
      fetch_queue.pending--;
      fetch_queue.rescan();
    }, error => {
      fetch_task.reject(error);
      fetch_queue.pending--;
      fetch_queue.rescan();
    });
  }
};
const fetcher = (url, priority = 3) => {
  if (cache.has(url)) {
    const promise = new Promise((resolve, reject) => {
      resolve(cache.get(url).clone());
    });
    return promise;
  } else {
    const promise = new Promise((resolve, reject) => {
      const fetch_task = {
        url: url,
        resolve: response => {
          resolve(response);
        },
        reject: error => {
          reject(error);
        }
      };
      fetch_queue.add(fetch_task, priority);
    });
    return promise;
  }
};

const defaults = {
  while_updating: "loader" // loader, static
};

function useFetch(options) {
  const type_select = {
    blob: () => {
      return FetchOptions({
        ...options,
        type: "blob"
      });
    },
    json: () => {
      return FetchOptions({
        ...options,
        type: "json"
      });
    },
    text: () => {
      return FetchOptions({
        ...options,
        type: "text"
      });
    }
  };
  return type_select;
}
const FetchOptions = options => useFetcher({
  ...defaults,
  ...options
});
const useFetcher = options => {
  const request = useRef({
    state: "PENDING",
    url: null
  });
  const [retrieved, setRetrieved] = useState();
  const last_content = useRef(null);
  const fetched_data = useRef(initFetchData[options.type]);
  const onLoad = data => {
    fetched_data.current = data;
    request.current.state = "OK";
    setRetrieved(data);
  };
  const onError = err => {
    fetched_data.current = err;
    request.current.state = "ERROR";
  };
  const load = url => {
    if (request.current.url !== url) {
      request.current.url = url;
      request.current.state = "PENDING";
      fetcher(request.current.url, 3).then(data => {
        switch (options.type) {
          case "blob":
            return data.blob();
          case "json":
            return data.json();
          case "text":
            return data.text();
        }
      }).then(data => onLoad(data)).catch(error => onError(error));
    }
  };
  const Wrapper = ({
    url,
    children,
    loader = null,
    error = null
  }) => {
    load(url);
    switch (request.current.state) {
      case "PENDING":
        if (options.while_updating == "static" && last_content) return last_content;else return loader;
      case "ERROR":
        return null;
      default:
        last_content.current = children;
        return children;
    }
  };
  return [fetched_data.current, Wrapper];
};
const initFetchData = {
  blob: new Blob(),
  json: {},
  text: ""
};

const useIntersectionObserver = (element, margin = 0) => {
  const [isVisible, setState] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setState(entry.isIntersecting);
        observer.disconnect();
      }
    }, {
      rootMargin: margin
    });
    element.current && observer.observe(element.current);
    return () => observer.disconnect();
  }, []);
  return isVisible;
};

const cached_images = new Map();
function Ymage({
  url,
  copyright,
  lazy = "200px",
  type = "img",
  onLoad,
  style,
  className = "",
  ...props
}) {
  const container = useRef();
  const isVisible = lazy === false ? true : useIntersectionObserver(container, lazy);
  const options = {
    as: type,
    copyright: copyright
  };
  function stylesFromProps(props) {
    const styles = {};
    if (props.w) styles.width = props.w;
    if (props.h) styles.height = props.h;
    if (props.r) styles.borderRadius = props.r;
    if (props.wh) styles.aspectRatio = props.wh;
    return styles;
  }
  function contextMenuHandler() {
    if (options.copyright) {
      container.current.classList.add("copyright");
      setTimeout(() => container.current.classList.remove("copyright"), 1000);
    }
  }
  return /*#__PURE__*/React.createElement("figure", _extends({}, props, {
    style: {
      ...stylesFromProps(props),
      ...style
    },
    ref: container,
    className: "Ymage " + className,
    onContextMenu: contextMenuHandler
  }), isVisible ? cached_images.has(url) ? /*#__PURE__*/React.createElement(PrintImage, {
    url: cached_images.get(url).blob_url,
    options: options
  }) : /*#__PURE__*/React.createElement(FetchImage, {
    url: url,
    options: options,
    onLoad: onLoad
  }) : null);
}
const FetchImage = ({
  url,
  options,
  onLoad
}) => {
  const [data, Fetch] = useFetch().blob();
  return /*#__PURE__*/React.createElement(Fetch, {
    url: url,
    loader: /*#__PURE__*/React.createElement(Loader, null)
  }, /*#__PURE__*/React.createElement(CacheImage, {
    url: url,
    blob: data,
    options: options,
    onLoad: onLoad
  }));
};
const CacheImage = ({
  url,
  blob,
  options,
  onLoad
}) => {
  const blob_url = URL.createObjectURL(blob);
  const img_tmp = new Image();
  img_tmp.src = blob_url;
  img_tmp.onload = () => {
    const img_size = {
      x: img_tmp.width,
      y: img_tmp.height
    };
    cached_images.set(url, {
      blob_url: blob_url,
      size: img_size
    });
    if (onLoad) onLoad({
      blob_url: blob_url,
      size: img_size
    });
    img_tmp.src = null;
  };
  return /*#__PURE__*/React.createElement(PrintImage, {
    url: blob_url,
    options: {
      ...options,
      entry: "fade-in"
    }
  });
};
const PrintImage = ({
  url,
  options
}) => {
  if (options.as === "img") return /*#__PURE__*/React.createElement("img", {
    src: url,
    className: (options.entry ? options.entry : "") + (options.copyright ? " copyright" : "")
  });else return /*#__PURE__*/React.createElement("div", {
    className: options.entry ? options.entry : "" + (options.copyright ? " copyright" : ""),
    style: {
      backgroundImage: "url('" + url + "')"
    }
  });
};
const Loader = () => {
  return /*#__PURE__*/React.createElement("svg", {
    className: "ymage-spinner",
    xmlns: "http://www.w3.org/2000/svg",
    xmlnsXlink: "http://www.w3.org/1999/xlink",
    viewBox: "0 0 100 100",
    enableBackground: "new 0 0 0 0"
  }, /*#__PURE__*/React.createElement("path", {
    fill: "#fff",
    d: "M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50"
  }));
};

export { Ymage };
//# sourceMappingURL=index.js.map
