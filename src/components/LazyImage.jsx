import { useState, useEffect, useRef } from 'react';
import './LazyImage.css';

/**
 * LazyImage Component
 * Görsel lazy loading için kullanılır
 * Görsel ekrana yaklaştığında yüklenir
 */
export function LazyImage({ 
  src, 
  alt, 
  className = '', 
  threshold = 0.1,
  rootMargin = '50px'
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const currentRef = imgRef.current;
    // Intersection Observer ile görselin görünürlüğünü takip et
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect(); // Bir kez yüklendikten sonra takibi bırak
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, rootMargin]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div 
      ref={imgRef}
      className={`lazy-image-container ${className} ${isLoaded ? 'loaded' : ''}`}
    >
      {/* Placeholder - Yüklenene kadar göster */}
      {!isLoaded && (
        <div className="lazy-image-placeholder">
          <div className="lazy-image-skeleton" />
        </div>
      )}
      
      {/* Gerçek görsel - Görünür olduğunda yüklenir */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`lazy-image ${isLoaded ? 'visible' : ''}`}
          onLoad={handleLoad}
          loading="lazy" // Native lazy loading desteği
        />
      )}
    </div>
  );
}

/**
 * LazyImageGrid Component
 * Grid yapısındaki görseller için lazy loading
 */
export function LazyImageGrid({ images, className = '' }) {
  return (
    <div className={`lazy-image-grid ${className}`}>
      {images.map((image, index) => (
        <LazyImage
          key={index}
          src={image.src}
          alt={image.alt}
          className={image.className}
        />
      ))}
    </div>
  );
}