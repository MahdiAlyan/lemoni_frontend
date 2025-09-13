import React, { createContext, useState, useContext, useEffect } from 'react';

const DirectionContext = createContext();

export const DirectionProvider = ({ children }) => {
  const [direction, setDirection] = useState(localStorage.getItem('appDirection') || 'ltr');

  useEffect(() => {
    document.body.setAttribute('dir', direction);
    localStorage.setItem('appDirection', direction);
  }, [direction]);

    const toggleDirection = () => {
        const current = localStorage.getItem('appDirection') || 'ltr';
        const newDirection = current === 'ltr' ? 'rtl' : 'ltr';

        localStorage.setItem('appDirection', newDirection);

        // Refresh immediately before React re-renders
        window.location.reload();
    };

  return (
    <DirectionContext.Provider value={{ direction, toggleDirection }}>
      {children}
    </DirectionContext.Provider>
  );
};

export const useDirection = () => useContext(DirectionContext);
