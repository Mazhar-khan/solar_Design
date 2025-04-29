import React, { useState } from 'react';

const MdSwitchComponent = ({ label, value = false, onChange = () => {} }) => {
  const [selected, setSelected] = useState(value);

  const onClick = () => {
    setSelected(!selected);
    onChange(!selected);
  };

  return (
    <label htmlFor={label} className="p-2 relative inline-flex items-center cursor-pointer">
      <div
        id={label}
        role="switch"
        aria-checked={selected}
        onClick={onClick}
        style={{
          width: '42px',
          height: '26px',
          backgroundColor: selected ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-surface-variant)',
          borderRadius: '9999px',
          display: 'flex',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '9999px',
            backgroundColor: 'white',
            transition: 'transform 0.2s',
            transform: selected ? 'translateX(16px)' : 'translateX(0)',
          }}
        />
      </div>
      <span className="ml-3 body-large">{label}</span>
    </label>
  );
};

export default MdSwitchComponent;
