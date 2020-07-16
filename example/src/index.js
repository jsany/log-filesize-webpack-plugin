import React from 'react';
import ReactDOM from 'react-dom';
import Run from './components/Run';
import Walk from './components/Walk';
import './base.css';
import Styles from './index.less';
import ImgBelle from './assets/belle.jpg';

const Index = () => {
  return (
    <div className={Styles.wrap}>
      <img src={ImgBelle} alt="belle" />
      <Run />
      <Walk />
    </div>
  );
};

ReactDOM.render(<Index />, document.getElementById('root'));
