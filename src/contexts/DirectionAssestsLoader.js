import { useEffect } from 'react';
import { useDirection } from './DirectionContext';

const DirectionAssetsLoader = () => {
  const { direction } = useDirection();

  useEffect(() => {
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.id = 'direction-style';

    const pluginScript = document.createElement('script');
    pluginScript.src = '/assets/plugins/global/plugins.bundle.js';
    pluginScript.async = false;
    pluginScript.defer = true;
    pluginScript.id = 'direction-script';

    // Remove existing
    const existingCss = document.getElementById('direction-style');
    const existingScript = document.getElementById('direction-script');
    if (existingCss) existingCss.remove();
    if (existingScript) existingScript.remove();

    // Append new CSS
    document.head.appendChild(cssLink);

    // Append JS after CSS loads
    cssLink.onload = () => {
      document.body.appendChild(pluginScript);

      pluginScript.onload = () => {
        if (window.jQuery && window.$.fn.dataTable) {
          console.log('[Info] Plugins reloaded and ready.');
        }
      };
    };

    return () => {
      cssLink && cssLink.remove();
      pluginScript && pluginScript.remove();
    };
  }, [direction]);

  return null;
};

export default DirectionAssetsLoader;
