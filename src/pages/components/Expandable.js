import React, { useState } from 'react';

const Expandable = ({ title, subtitle = '', subtitle2 = '', icon = '', section = '', secondary = false, children }) => {
  const [expandedSection, setExpandedSection] = useState('');

  const titleText = secondary ? 'secondary-text' : 'primary-text';

  const toggle = () => {
    setExpandedSection(expandedSection === title ? '' : title);
  };

  return (
    <div>
      <button
        className="flex flex-row w-full p-4"
        onClick={toggle}
      >
        <span className={`${titleText} w-12`}>{icon}</span>
        <div className="w-full grid justify-items-start text-left">
          <p className={`${titleText} body-large`}><b>{title}</b></p>
          <p className="label-medium outline-text">{subtitle}</p>
          <p className="label-medium outline-text">{subtitle2}</p>
        </div>
        <button>
          <span>{expandedSection === title ? 'expand_less' : 'expand_more'}</span>
        </button>
      </button>

      {expandedSection === title && (
        <div className="px-4 pb-6">
          {children}
        </div>
      )}
    </div>
  );
};

export default Expandable;
