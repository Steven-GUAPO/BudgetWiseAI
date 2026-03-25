import { formatDate } from "utils/formatDate";
import { Calendar } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setDateSelectOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRangeChange = (value: unknown) => {
    const range = value as [Date | null, Date | null];
    setDateRange(range);
    onRangeChange(range);
    setDateSelectOpen(false);
  };
  return (
    <>
      <div className="date-range-container relative" ref={containerRef}>
        <div
          className="toggle-calendar flex gap-1 items-center text-sm border p-2 rounded-md cursor-pointer transition-all whitespace-nowrap"
          onClick={() => setDateSelectOpen(!dateSelectOpen)}
        >
          <Calendar className="w-3 h-3 shrink-0" />
          <p className="truncate">
            {dateRange[0] && dateRange[1]
              ? `${formatDate(dateRange[0], { month: "numeric", day: "numeric", year: "2-digit" })} - ${formatDate(dateRange[1], { month: "numeric", day: "numeric", year: "2-digit" })}`
              : "Select Date"}
          </p>
        </div>

        <div
          className={`absolute right-0 ${dateSelectOpen ? "visible" : "hidden"} w-auto shadow-lg p-2 rounded-md`}
        >
          <ReactCalendar
            className="w-full text-black p-1 border border-gray-300 rounded-md text-sm"
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
