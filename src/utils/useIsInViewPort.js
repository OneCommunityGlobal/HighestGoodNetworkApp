const { useMemo, useEffect, useState } = require("react");

/**
 * Check if the dom is in view port
 * @returns {boolean} setIsIntersecting
*/
const useIsInViewPort = (ref) => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  const observer = useMemo(() =>
    new IntersectionObserver(([entry]) => setIsIntersecting(entry.isIntersecting))
  , []);

  useEffect(() => {
    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, observer]);

  return isIntersecting;
}

export default useIsInViewPort