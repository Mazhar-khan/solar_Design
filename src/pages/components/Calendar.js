import React, { useState } from 'react';
import Dropdown from './Dropdown'; // Assuming you have a React version of Dropdown
// Import Material Icons if needed

const Calendar = ({ month, day, numCols = 7, onChange = () => {} }) => {
  const [opened, setOpened] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(month);
  const [currentDay, setCurrentDay] = useState(day);

  const monthDays = {
    January: 31,
    February: 28,
    March: 31,
    April: 30,
    May: 31,
    June: 30,
    July: 31,
    August: 31,
    September: 30,
    October: 31,
    November: 30,
    December: 31,
  };

  const months = Object.keys(monthDays);

  const dayFrom = (row, col) => row * numCols + col + 1;

  const handleDayClick = (newDay) => {
    setCurrentDay(newDay);
    setOpened(false);
    onChange(currentMonth, newDay);
  };

  const handleMonthChange = (value) => {
    const newMonth = Number(value);
    setCurrentMonth(newMonth);
    onChange(newMonth, currentDay);
  };

  return (
    <div className="relative">
      <button
        className="w-full flex items-center"
        onClick={() => setOpened(!opened)}
      >
        <span className="material-symbols-outlined">event</span>
        <span>&nbsp; {months[currentMonth]} {currentDay}</span>
      </button>

      {opened && (
        <>
          <div
            className="fixed top-0 left-0 w-full h-full z-10"
            onClick={() => setOpened(false)}
          />

          <div className="surface-variant on-surface-variant-text absolute right-4 w-auto p-4 rounded-lg shadow-lg z-20">
            <div className="px-4 pb-4">
              <Dropdown
                value={currentMonth.toString()}
                options={Object.fromEntries(months.map((m, i) => [i.toString(), m]))}
                onChange={(value) => handleMonthChange(value)}
              />
            </div>

            <table>
              <tbody>
                {Array.from(
                  { length: Math.ceil(monthDays[months[currentMonth]] / numCols) },
                  (_, row) => (
                    <tr key={row}>
                      {Array.from({ length: numCols }, (_, col) => {
                        const dayValue = dayFrom(row, col);
                        if (dayValue > monthDays[months[currentMonth]]) {
                          return <td key={col}></td>;
                        }
                        return (
                          <td key={col}>
                            <button
                              className={`relative w-8 h-8 rounded-full ${
                                currentDay === dayValue
                                  ? 'primary on-primary-text'
                                  : ''
                              }`}
                              onClick={() => handleDayClick(dayValue)}
                            >
                              {dayValue}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Calendar;
