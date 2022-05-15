import React from 'react';
import ConfigForm from '../../components/ConfigForm';
import '@arco-design/web-react/dist/css/arco.css';
import './Options.css';

interface Props {
  title: string;
}

const Options: React.FC<Props> = ({ title }: Props) => {
  return (
    <div className="OptionsContainer">
      <div style={{ width: 950, marginLeft: -56 }}>
        <ConfigForm type="options" />
      </div>
    </div>
  );
};

export default Options;
