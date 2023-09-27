import { useState, useEffect } from 'react'

const useIntersectionObserver = (element, margin) => {
    const [isVisible, setState] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting) {
                setState(entry.isIntersecting);
                observer.disconnect();
              }
            }, { rootMargin: margin }
        );
        element.current && observer.observe(element.current);
        return () => observer.disconnect() 
    }, []);

    return isVisible;
};
export default useIntersectionObserver;