import React, { useState } from 'react';

const Dropdown = ({ options, value, expandTop = false, onChange = () => {} }) => {
  const [opened, setOpened] = useState(false);

  const handleDropdownToggle = () => {
    setOpened(!opened);
  };

  const handleOptionClick = (option) => {
    onChange(option);
    setOpened(false);
  };

  return (
    <div className="relative">
      <button
        className="w-full md-outlined-button flex items-center"
        onClick={handleDropdownToggle}
      >
        <div className="flex items-center">
          {value !== undefined ? options[value] : 'Choose an option'}
          <span className="material-symbols-outlined">
            {opened ? 'expand_less' : 'expand_more'}
          </span>
        </div>
      </button>

      {opened && (
        <>
          <div
            className="fixed top-0 left-0 w-full h-full z-10"
            onClick={() => setOpened(false)}
          />
          <div
            className={`surface-variant on-surface-variant-text absolute ${
              expandTop ? 'bottom-full' : ''
            } w-full p-2 rounded-lg shadow-xl z-20`}
          >
            {Object.keys(options).map((option) => (
              <button
                key={option}
                className="dropdown-item block px-4 py-2 w-full text-left rounded"
                onClick={() => handleOptionClick(option)}
              >
                {options[option]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Dropdown;
