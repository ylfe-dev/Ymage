'use strict';

var React = require('react');

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

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z = "@charset \"UTF-8\";\n.Ymage {\n  display: flex;\n  align-content: center;\n  justify-content: center;\n  overflow: hidden;\n  position: relative;\n}\n.Ymage svg {\n  position: absolute;\n  z-index: 0;\n  align-self: center;\n  width: min(6rem, 50%);\n}\n.Ymage svg.ymage-spinner {\n  animation: spinning 1.5s normal infinite;\n}\n.Ymage img {\n  object-fit: cover;\n}\n.Ymage div {\n  background-size: cover;\n  background-position: center;\n}\n.Ymage img, .Ymage div {\n  position: relative;\n  z-index: 1;\n  width: 100%;\n  height: 100%;\n}\n.Ymage img.fade-in, .Ymage div.fade-in {\n  animation: 1s fadeIn;\n}\n.Ymage img.copyright, .Ymage div.copyright {\n  pointer-events: none;\n  user-select: none;\n}\n.Ymage.copyright::after {\n  content: \"©\";\n  position: absolute;\n  z-index: 2;\n  width: 100%;\n  height: 100%;\n  background: rgba(0, 0, 0, 0.6392156863);\n  font-size: 4rem;\n  color: white;\n  font-family: Arial;\n  text-align: center;\n  display: flex;\n  opacity: 0;\n  justify-content: center;\n  align-items: center;\n  animation: 1s fadeOut;\n}\n\n@keyframes spinning {\n  from {\n    transform: rotate(0deg);\n  }\n  to {\n    transform: rotate(360deg);\n  }\n}\n@keyframes fadeIn {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n@keyframes fadeOut {\n  from {\n    opacity: 1;\n  }\n  to {\n    opacity: 0;\n  }\n}";
styleInject(css_248z);

const useIntersectionObserver = (element, margin = 0) => {
  const [isVisible, setState] = React.useState(false);
  React.useEffect(() => {
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

function useImageFetcher(src, onSize, onLoad, onError) {
  const [dataURL, setDataURL] = React.useState(getImageFromCache());
  function clearImageCache() {
    localStorage.clear();
  }
  function getImageFromCache() {
    const cache = localStorage.getItem(src);
    if (cache && typeof onSize === "function") {
      const tmp_image = new Image();
      tmp_image.onload = () => onSize({
        x: tmp_image.naturalWidth,
        y: tmp_image.naturalHeight
      });
      tmp_image.onerror = handleError;
      tmp_image.src = cache;
    } else if (cache && typeof onLoad === "function") onLoad();
    return cache;
  }
  function setImageCache(durl) {
    localStorage.setItem(src, durl);
  }
  function handleError() {
    onError();
  }
  React.useEffect(() => {
    window.addEventListener('beforeunload', clearImageCache);
    if (dataURL === null) {
      let imageSize = 0;
      let imageType = null;
      fetch(src).then(response => {
        imageType = response.headers.get('Content-Type');
        imageSize = response.headers.get('Content-Length');
        return response.body;
      }).then(body => {
        const reader = body.getReader();
        let size_published = false;
        let sos_markers = 0;
        let sop_marker = false;
        let analizing = imageType === "image/jpeg";
        let last_update_size = 0;
        let chunks = new Array();
        let durl;
        return new ReadableStream({
          start(controller) {
            return pump();
            function pump() {
              return reader.read().then(({
                done,
                value
              }) => {
                if (done) {
                  if (!durl) publishDataURL();
                  setImageCache(durl);
                  onSizeHandler();
                  if (typeof onLoad === "function") onLoad();
                  controller.close();
                  return;
                } else {
                  chunks.push(value);
                  if (analizing) readJPGMarkers(value, sos => {
                    if (!sop_marker && ++sos_markers > 1) jpegIsBaseline();else if (sop_marker && ++sos_markers > 2) jpegFirstScan();
                  }, sop => jpegIsProgrssive());else if (sop_marker) jpegUpdate();
                }
                controller.enqueue(value);
                return pump();
              });
            }
          }
        });
        function jpegIsProgrssive() {
          sop_marker = true;
          return false;
        }
        function jpegIsBaseline() {
          analizing = false;
          return true;
        }
        function jpegFirstScan() {
          if (analizing) {
            jpegUpdate(true);
            analizing = false;
          }
        }
        function jpegUpdate(first_scan = false) {
          const current_size = chunksSize(chunks);
          if (first_scan || current_size - last_update_size >= imageSize / 3 || current_size == imageSize) {
            last_update_size = current_size;
            publishDataURL();
            if (first_scan && onSize) onSizeHandler();
          }
        }
        function publishDataURL() {
          const blob = new Blob(chunks, {
            type: imageType
          });
          if (durl) URL.revokeObjectURL(durl);
          durl = URL.createObjectURL(blob);
          setDataURL(durl);
        }
        function onSizeHandler() {
          if (!size_published && typeof onSize === "function") {
            size_published = true;
            const tmp_image = new Image();
            tmp_image.onload = () => onSize({
              x: tmp_image.naturalWidth,
              y: tmp_image.naturalHeight
            });
            tmp_image.onerror = handleError;
            tmp_image.src = durl;
          }
        }
      }).catch(err => handleError());
    }
    return () => {
      window.removeEventListener('beforeunload', clearImageCache);
    };
  }, []);
  return dataURL;
}
const readJPGMarkers = (chunk, onSOS, onSOP) => {
  for (let i = 0; i < chunk.length; ++i) {
    if (chunk[i] === 0xFF) {
      switch (chunk[++i]) {
        case 0xDA:
          onSOS(i);
          break;
        case 0xC2:
          onSOP(i);
          break;
      }
    }
  }
};
function chunksSize(chunks) {
  let size = 0;
  for (const chunk of chunks) size += chunk.length;
  return size;
}

function Ymage({
  url,
  copyright,
  lazy = "200px",
  type = "img",
  onLoad,
  onSize,
  onError,
  style,
  className = "",
  color = "#b7b7b7",
  bg = "#d0d0d0",
  w,
  h,
  wh,
  r,
  ...props
}) {
  const container = React.useRef();
  const isVisible = lazy === false ? true : useIntersectionObserver(container, lazy);
  const options = {
    as: type,
    copyright: copyright,
    color: color
  };
  function stylesFromProps(props) {
    const styles = {};
    if (w) styles.width = w;
    if (h) styles.height = h;
    if (r) styles.borderRadius = r;
    if (wh) styles.aspectRatio = wh;
    if (bg) styles.backgroundColor = bg;
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
      ...stylesFromProps(),
      ...style
    },
    ref: container,
    className: "Ymage " + className,
    onContextMenu: contextMenuHandler
  }), isVisible ? /*#__PURE__*/React.createElement(FetchImage, {
    url: url,
    options: options,
    onSize: onSize,
    onLoad: onLoad,
    onError: onError
  }) : null);
}
const FetchImage = ({
  url,
  options,
  onLoad,
  onSize,
  onError
}) => {
  const imageData = useImageFetcher(url, onSize, onLoad, handleError);
  const [showLoader, setShowLoader] = React.useState(true);
  const [showError, setShowError] = React.useState(false);
  const fade = React.useRef(false);
  function handleError(e) {
    setShowError(true);
    setShowLoader(false);
    if (typeof onError === "function") onError();
  }
  React.useEffect(() => {
    if (showLoader && imageData) setTimeout(() => setShowLoader(false), 1000);
  }, [imageData]);
  React.useEffect(() => {
    if (imageData === null) fade.current = true;
  }, []);
  return /*#__PURE__*/React.createElement(React.Fragment, null, showLoader ? /*#__PURE__*/React.createElement(Loader, {
    color: options.color
  }) : null, imageData && !showError ? /*#__PURE__*/React.createElement(PrintImage, {
    url: imageData,
    options: {
      ...options,
      fade: fade.current
    }
  }) : null, showError ? /*#__PURE__*/React.createElement(ImageError, {
    color: options.color
  }) : null);
};
const PrintImage = ({
  url,
  options
}) => {
  const imageRef = React.useRef(null);
  React.useEffect(() => {
    if (options.as === "img") {
      imageRef.current.src = null;
      imageRef.current.src = url;
    } else imageRef.current.style.backgroundImage = "url('" + url + "')";
  }, [url]);
  if (options.as === "img") return /*#__PURE__*/React.createElement("img", {
    ref: imageRef,
    className: (options.fade ? "fade-in" : "") + (options.copyright ? " copyright" : "")
  });else return /*#__PURE__*/React.createElement("div", {
    ref: imageRef,
    className: (options.fade ? "fade-in" : "") + (options.copyright ? " copyright" : "")
  });
};
const Loader = ({
  color
}) => {
  return /*#__PURE__*/React.createElement("svg", {
    "data-testid": "placeholder-spinner",
    className: "ymage-spinner",
    xmlns: "http://www.w3.org/2000/svg",
    xmlnsXlink: "http://www.w3.org/1999/xlink",
    viewBox: "0 0 100 100",
    enableBackground: "new 0 0 0 0"
  }, /*#__PURE__*/React.createElement("path", {
    fill: color,
    d: "M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50"
  }));
};
const ImageError = ({
  color
}) => {
  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 32 32"
  }, /*#__PURE__*/React.createElement("path", {
    fill: color,
    d: "M 16 7 C 13.36052 7 11.067005 8.2378107 9.421875 10.052734 C 9.2797018 10.03501 9.1552693 10 9 10 C 6.8026661 10 5 11.802666 5 14 C 5 14.0074 5.0018931 14.008395 5.0019531 14.015625 C 3.2697139 15.069795 2 16.832921 2 19 C 2 22.301625 4.6983746 25 8 25 L 24 25 C 27.301625 25 30 22.301625 30 19 C 30 15.842259 27.509898 13.303165 24.40625 13.082031 C 23.18074 9.5665933 19.923127 7 16 7 z M 16 9 C 19.27847 9 22.005734 11.243586 22.775391 14.271484 L 22.978516 15.072266 L 23.800781 15.023438 C 24.012411 15.011276 24.071091 15 24 15 C 26.220375 15 28 16.779625 28 19 C 28 21.220375 26.220375 23 24 23 L 8 23 C 5.7796254 23 4 21.220375 4 19 C 4 17.338324 5.0052754 15.930166 6.4335938 15.320312 L 7.1289062 15.023438 L 7.03125 14.271484 C 7.0103607 14.109285 7 14.025078 7 14 C 7 12.883334 7.8833339 12 9 12 C 9.14 12 9.2894098 12.02145 9.4628906 12.0625 L 10.087891 12.208984 L 10.482422 11.703125 C 11.765559 10.05801 13.75001 9 16 9 z M 15.984375 10.986328 A 1.0001 1.0001 0 0 0 15 12 L 15 16 A 1.0001 1.0001 0 1 0 17 16 L 17 12 A 1.0001 1.0001 0 0 0 15.984375 10.986328 z M 16 19 A 1 1 0 0 0 15 20 A 1 1 0 0 0 16 21 A 1 1 0 0 0 17 20 A 1 1 0 0 0 16 19 z",
    fontWeight: "400",
    fontFamily: "sans-serif",
    "white-space": "normal",
    overflow: "visible"
  }));
};

module.exports = Ymage;
//# sourceMappingURL=index.js.map
