import React from 'react';
import { Link } from 'react-router-dom';

import logoImg from '../../assets/images/logo.svg';
import backIcon from '../../assets/images/icons/back.svg';

import './styles.css';

interface PageHeaderProps {
  pageName: string,
  title: string,
  description?: string,
  emoji?: string,
  emojiAlt?: string,
  message?: string
}

const PageHeader: React.FC<PageHeaderProps> = (props) => {
  return (
    <header className="page-header">
      <div className="top-bar-container">
        <Link to="/">
          <img src={backIcon} alt="voltar"/>
        </Link>
        <span>{props.pageName}</span>
        <img src={logoImg} alt="Proffy"/>
      </div>
      
      <div className="header-content">
        <strong>{props.title}</strong>
        {props.description && <p>{props.description}</p>}
        <div className="header-tip">
          {props.emoji && <img src={props.emoji} alt={props.emojiAlt}/>}
          {props.message && <span>{props.message}</span>}
        </div>

        {props.children}
      </div>
      
    </header>
  );
}

export default PageHeader;