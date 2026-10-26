import React, { useState } from 'react';

interface CachedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  skeletonClassName?: string;
}

/** Image wrapper with a visible skeleton while loading and a neutral fallback on failure. */
export const CachedImage: React.FC<CachedImageProps> = ({ className = '', skeletonClassName = '', alt = '', onLoad, onError, ...props }) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <span className={`kitnova-image-frame ${skeletonClassName}`}>
      {!loaded && !failed && <span className="kitnova-image-skeleton" aria-hidden="true" />}
      {failed ? (
        <span className="kitnova-image-fallback" role="img" aria-label={alt || 'Image unavailable'}>KITNOVA</span>
      ) : (
        <img
          {...props}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={`${className} ${loaded ? 'kitnova-image-loaded' : 'kitnova-image-pending'}`}
          onLoad={event => { setLoaded(true); onLoad?.(event); }}
          onError={event => { setFailed(true); onError?.(event); }}
        />
      )}
    </span>
  );
};
