import React from 'react';
// import Table from './Table';  // Assuming you have the Table component as a separate React component

const InfoCard = ({ title = '', icon = '', rows = [] }) => {
  return (
    <div className="grid justify-items-start surface on-surface-text p-4 rounded-lg shadow-lg">
      <div className="flex items-center primary-text">
        <i className={`md-icon w-8 ${icon}`} />
        <p className="body-large"><b>{title}</b></p>
      </div>
      <div className="py-3 w-full">
        <hr className="md-divider" />
      </div>
      <div className="w-full secondary-text">
        <table rows={rows} />
      </div>
      <div className="px-3">
        {/* This is where content can be dynamically inserted */}
      </div>
    </div>
  );
};

export default InfoCard;
