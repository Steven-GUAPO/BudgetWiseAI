import { Calendar } from "lucide-react";
import React, { useState } from "react";

import ReactCalendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

interface DateInputProps {
  onRangeChange: (range: [Date | null, Date | null]) => void;
}

const DateInput = ({ onRangeChange }: DateInputProps) => {
  const [dateSelectOpen, setDateSelectOpen] = useState(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);

  const handleRangeChange = (value: unknown) => {
    const range = value as [Date | null, Date | null];
    setDateRange(range);
    onRangeChange(range);
    setDateSelectOpen(false);
  };
  return (
    <>
      <div className="date-range-container relative">
        <div
          className="toggle-calendar flex gap-1 items-center text-sm border p-2 rounded-md cursor-pointer transition-all"
          onClick={() => setDateSelectOpen(!dateSelectOpen)}
        >
          <Calendar className="w-4 h-4" />
          <p>
            {dateRange[0] && dateRange[1]
              ? `${dateRange[0].toLocaleDateString()} - ${dateRange[1].toLocaleDateString()}`
              : "Select Date Range"}
          </p>
        </div>

        <div
          className={`absolute w-full min-w-[300px] ${dateSelectOpen ? "visible" : "hidden"} w-auto shadow-lg p-2 bg-white`}
        >
          <ReactCalendar
            className="bg-white w-full p-1 border border-gray-300 rounded-md text-sm"
            selectRange={true}
            maxDate={new Date()}
            value={dateRange}
            onChange={handleRangeChange}
          />
          {dateRange[0] && dateRange[1] && (
            <button
              className="mt-2 btn-primary w-full"
              onClick={() => handleRangeChange([null, null])}
            >
              Reset Range
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default DateInput;
