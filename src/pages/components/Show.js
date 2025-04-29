import React, { useState } from 'react';

const CollapsibleItem = ({ keyProp, value, maxLength = 40, label = '', collapsed = false }) => {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    setExpanded(!expanded);
  };

  // Generate a summary of the value (up to maxLength)
  let summary = JSON.stringify(value);
  if (summary?.length >= maxLength) {
    summary = summary.substring(0, maxLength) + '...';
  }

  // Generate the items if value is an array or object
  let items = [];
  if (Array.isArray(value)) {
    items = value.map((v, i) => ({ k: i, v: v }));
  } else if (typeof value === 'object' && value !== null) {
    items = Object.keys(value).map((k) => ({ k: k, v: value[k] }));
  }

  return (
    <div className="flex flex-col font-mono whitespace-nowrap">
      <div className="flex flex-row w-full">
        {collapsed && items !== undefined && (
          <button onClick={toggle}>
            <span>{expanded ? '▼' : '▶'}</span>
          </button>
        )}
        {!collapsed && <div><span>&nbsp;</span></div>}

        {keyProp !== undefined && <span className="font-bold">{keyProp}:&nbsp;</span>}

        {label && <span>{label}</span>}
        {['number', 'string', 'boolean', 'undefined'].includes(typeof value) && <span>{value}</span>}
        {value === null && <span>{value}</span>}
        {Array.isArray(value) && <span className="font-sans italic">({value.length}) {summary}</span>}
        {!['number', 'string', 'boolean', 'undefined', 'object'].includes(typeof value) && <span className="font-sans italic">{summary}</span>}
      </div>

      {(expanded || !collapsed) && (
        <div className="flex flex-col ml-8 pb-6 max-h-72 overflow-auto">
          {Array.isArray(value) && <span className="italic">length: {value.length}</span>}
          <div style={{ borderLeft: collapsed ? 'solid 1px var(--md-sys-color-outline-variant)' : 'none' }}>
            {items.map(({ k, v }) => (
              <CollapsibleItem key={k} keyProp={k} value={v} collapsed={true} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CollapsibleItem;
