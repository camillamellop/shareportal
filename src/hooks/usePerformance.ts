import { useCallback, useMemo, useRef, useEffect } from 'react';
import { logger } from '@/utils/logger';

// Hook para debounce
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;
};

// Hook para throttle
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastCall = useRef(0);
  const lastCallTimer = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastCall.current >= delay) {
        callback(...args);
        lastCall.current = now;
      } else {
        if (lastCallTimer.current) {
          clearTimeout(lastCallTimer.current);
        }

        lastCallTimer.current = setTimeout(() => {
          callback(...args);
          lastCall.current = Date.now();
        }, delay - (now - lastCall.current));
      }
    },
    [callback, delay]
  ) as T;
};

// Hook para memoização de arrays
export const useMemoizedArray = <T>(
  array: T[],
  dependencies: any[] = []
): T[] => {
  return useMemo(() => array, dependencies);
};

// Hook para memoização de objetos
export const useMemoizedObject = <T extends object>(
  object: T,
  dependencies: any[] = []
): T => {
  return useMemo(() => object, dependencies);
};

// Hook para detectar mudanças em arrays
export const useArrayChange = <T>(
  array: T[],
  callback: (newArray: T[], oldArray: T[]) => void
) => {
  const prevArrayRef = useRef<T[]>([]);

  useEffect(() => {
    if (JSON.stringify(array) !== JSON.stringify(prevArrayRef.current)) {
      callback(array, prevArrayRef.current);
      prevArrayRef.current = [...array];
    }
  }, [array, callback]);
};

// Hook para performance monitoring
export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;
    const currentTime = performance.now();
    const timeSinceLastRender = currentTime - lastRenderTime.current;
    
    logger.debug(`Componente ${componentName} renderizado`, {
      renderCount: renderCount.current,
      timeSinceLastRender: `${timeSinceLastRender.toFixed(2)}ms`
    });

    lastRenderTime.current = currentTime;
  });

  return {
    renderCount: renderCount.current,
    timeSinceLastRender: performance.now() - lastRenderTime.current
  };
};

// Hook para lazy loading de imagens
export const useLazyImage = (src: string, placeholder?: string) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const img = new Image();
    
    img.onload = () => {
      setIsLoaded(true);
      setError(false);
    };

    img.onerror = () => {
      setError(true);
      setIsLoaded(false);
    };

    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return {
    isLoaded,
    error,
    src: isLoaded ? src : placeholder || src
  };
};

// Hook para intersection observer (lazy loading)
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      const isIntersecting = entry.isIntersecting;
      setIsIntersecting(isIntersecting);
      
      if (isIntersecting && !hasIntersected) {
        setHasIntersected(true);
      }
    }, options);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options, hasIntersected]);

  return {
    elementRef,
    isIntersecting,
    hasIntersected
  };
};

// Hook para virtualização simples
export const useVirtualization = (
  itemCount: number,
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleStartIndex = Math.floor(scrollTop / itemHeight);
  const visibleEndIndex = Math.min(
    visibleStartIndex + Math.ceil(containerHeight / itemHeight) + 1,
    itemCount
  );

  const visibleItems = Array.from(
    { length: visibleEndIndex - visibleStartIndex },
    (_, index) => visibleStartIndex + index
  );

  const totalHeight = itemCount * itemHeight;
  const offsetY = visibleStartIndex * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop
  };
};
