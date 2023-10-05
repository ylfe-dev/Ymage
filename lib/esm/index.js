import React, { useState, useEffect, useRef } from 'react';

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

var css_248z = "@charset \"UTF-8\";\n.Ymage {\n  background-color: #d0d0d0;\n  display: flex;\n  align-content: center;\n  justify-content: center;\n  overflow: hidden;\n  position: relative;\n}\n.Ymage svg {\n  align-self: center;\n  width: min(6rem, 50%);\n}\n.Ymage svg.ymage-spinner {\n  animation: spinning 1.5s normal infinite;\n}\n.Ymage img {\n  object-fit: cover;\n  width: 100%;\n  height: 100%;\n}\n.Ymage img.fade-in {\n  animation: 1s fadeIn;\n}\n.Ymage img.copyright {\n  pointer-events: none;\n  user-select: none;\n}\n.Ymage div {\n  width: 100%;\n  height: 100%;\n  background-size: cover;\n  background-position: center;\n}\n.Ymage div.fade-in {\n  animation: 1s fadeIn;\n}\n.Ymage.copyright::after {\n  content: \"©\";\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  background: rgba(0, 0, 0, 0.6392156863);\n  font-size: 4rem;\n  color: white;\n  font-family: Arial;\n  text-align: center;\n  display: flex;\n  opacity: 0;\n  justify-content: center;\n  align-items: center;\n  animation: 1s fadeOut;\n}\n\n@keyframes spinning {\n  from {\n    transform: rotate(0deg);\n  }\n  to {\n    transform: rotate(360deg);\n  }\n}\n@keyframes fadeIn {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n@keyframes fadeOut {\n  from {\n    opacity: 1;\n  }\n  to {\n    opacity: 0;\n  }\n}";
styleInject(css_248z);

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
  }), isVisible ? /*#__PURE__*/React.createElement(FetchImageNative, {
    url: url,
    options: options,
    onLoad: onLoad
  }) : null);
}
const FetchImageNative = ({
  url,
  options,
  onLoad
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const img_tmp = new Image();
  img_tmp.src = url;
  img_tmp.onload = () => {
    setTimeout(() => {
      if (onLoad) onLoad({
        x: img_tmp.width,
        y: img_tmp.height
      });
      img_tmp.src = null;
      setImageLoaded(true);
    }, Math.random() * 3000);
  };
  return imageLoaded ? /*#__PURE__*/React.createElement(PrintImage, {
    url: url,
    options: {
      ...options,
      entry: "fade-in"
    }
  }) : /*#__PURE__*/React.createElement(Loader, null);
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
