import React from 'react';
import '../assets/css/ScreenLoader.css';
import Tools from '../config/Tools';

const ScreenLoader = () => {
  return (
    <div className="screen-loader-overlay">
      <div className="loader-spinner"></div>
      <p>{Tools.translate('LOADING')}</p>
    </div>
  );
};

export default ScreenLoader;
