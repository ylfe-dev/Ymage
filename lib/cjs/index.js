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

var css_248z = "@charset \"UTF-8\";\n.Ymage {\n  background-color: #d0d0d0;\n  display: flex;\n  align-content: center;\n  justify-content: center;\n  overflow: hidden;\n  position: relative;\n}\n.Ymage svg {\n  position: absolute;\n  z-index: 0;\n  align-self: center;\n  width: min(6rem, 50%);\n}\n.Ymage svg.ymage-spinner {\n  animation: spinning 1.5s normal infinite;\n}\n.Ymage img {\n  object-fit: cover;\n}\n.Ymage div {\n  background-size: cover;\n  background-position: center;\n}\n.Ymage img, .Ymage div {\n  position: relative;\n  z-index: 1;\n  width: 100%;\n  height: 100%;\n}\n.Ymage img.fade-in, .Ymage div.fade-in {\n  animation: 1s fadeIn;\n}\n.Ymage img.copyright, .Ymage div.copyright {\n  pointer-events: none;\n  user-select: none;\n}\n.Ymage.copyright::after {\n  content: \"©\";\n  position: absolute;\n  z-index: 2;\n  width: 100%;\n  height: 100%;\n  background: rgba(0, 0, 0, 0.6392156863);\n  font-size: 4rem;\n  color: white;\n  font-family: Arial;\n  text-align: center;\n  display: flex;\n  opacity: 0;\n  justify-content: center;\n  align-items: center;\n  animation: 1s fadeOut;\n}\n\n@keyframes spinning {\n  from {\n    transform: rotate(0deg);\n  }\n  to {\n    transform: rotate(360deg);\n  }\n}\n@keyframes fadeIn {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n@keyframes fadeOut {\n  from {\n    opacity: 1;\n  }\n  to {\n    opacity: 0;\n  }\n}";
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

function useImageFetcher(src, onSize, onLoad) {
  const [dataURL, setDataURL] = React.useState(getImageFromCache());
  function clearImageCache() {
    localStorage.clear();
  }
  function getImageFromCache() {
    return localStorage.getItem(src);
  }
  function setImageCache(durl) {
    localStorage.setItem(src, durl);
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
                  onLoad();
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
          if (!size_published) {
            size_published = true;
            const tmp_image = new Image();
            tmp_image.onload = () => onSize({
              x: tmp_image.naturalWidth,
              y: tmp_image.naturalHeight
            });
            tmp_image.src = durl;
          }
        }
      }).catch(err => console.error(err));
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
  style,
  className = "",
  ...props
}) {
  const container = React.useRef();
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
  }), isVisible ? /*#__PURE__*/React.createElement(FetchImage, {
    url: url,
    options: options,
    onSize: onSize,
    onLoad: onLoad
  }) : null);
}
const FetchImage = ({
  url,
  options,
  onLoad,
  onSize
}) => {
  const imageData = useImageFetcher(url, onSize, onLoad);
  const [showLoader, setShowLoader] = React.useState(true);
  const fade = React.useRef(false);
  React.useEffect(() => {
    if (showLoader && imageData) setTimeout(() => setShowLoader(false), 1000);
  }, [imageData]);
  React.useEffect(() => {
    if (imageData === null) fade.current = true;
  }, []);
  return /*#__PURE__*/React.createElement(React.Fragment, null, showLoader ? /*#__PURE__*/React.createElement(Loader, null) : null, imageData ? /*#__PURE__*/React.createElement(PrintImage, {
    url: imageData,
    options: {
      ...options,
      fade: fade.current
    }
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
const Loader = () => {
  return /*#__PURE__*/React.createElement("svg", {
    "data-testid": "placeholder-spinner",
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

exports.Ymage = Ymage;
//# sourceMappingURL=index.js.map
