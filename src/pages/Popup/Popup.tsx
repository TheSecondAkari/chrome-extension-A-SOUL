import React from 'react';
import ConfigForm from '../../components/ConfigForm';
import '@arco-design/web-react/dist/css/arco.css';
import './Popup.css';

const Popup = () => {
  return (
    <div className="App">
      <ConfigForm type="popup" />
    </div>
  );
};

export default Popup;
