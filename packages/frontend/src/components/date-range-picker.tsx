import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface DateRange {
  from: string;
  to: string;
}

interface DateRangePickerProps {
  dateRange: DateRange;
  onDateRangeChange: (dateRange: DateRange) => void;
  className?: string;
  placeholder?: string;
}

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  className,
  placeholder = "Pick a date range",
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectingStart, setSelectingStart] = React.useState(true);
  const [tempStart, setTempStart] = React.useState<string>("");
  const [currentMonth, setCurrentMonth] = React.useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = React.useState(
    new Date().getFullYear()
  );

  const handleDateClick = (date: string) => {
    if (selectingStart) {
      setTempStart(date);
      setSelectingStart(false);
    } else {
      // Second click - set the end date
      const startDate = new Date(tempStart);
      const endDate = new Date(date);

      // Ensure start is before end
      if (startDate <= endDate) {
        onDateRangeChange({ from: tempStart, to: date });
      } else {
        onDateRangeChange({ from: date, to: tempStart });
      }
      setIsOpen(false);
      setSelectingStart(true);
      setTempStart("");
    }
  };

  const handleReset = () => {
    setSelectingStart(true);
    setTempStart("");
    onDateRangeChange({ from: "", to: "" });
  };

  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const navigateYear = (direction: "prev" | "next") => {
    setCurrentYear(currentYear + (direction === "next" ? 1 : -1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "";
    // Parse the date string directly to avoid timezone issues
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    const formatted = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return formatted;
  };

  const displayText =
    dateRange.from && dateRange.to
      ? `${formatDisplayDate(dateRange.from)} - ${formatDisplayDate(
          dateRange.to
        )}`
      : placeholder;

  // Generate calendar days
  const generateCalendarDays = (): (string | null)[] => {
    // Get first day of current month and how many days
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (string | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;
      days.push(dateStr);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const today = new Date();
  const currentMonthName = monthNames[currentMonth];

  const isDateInRange = (date: string) => {
    if (!dateRange.from || !dateRange.to) return false;
    return date >= dateRange.from && date <= dateRange.to;
  };

  const isDateSelected = (date: string) => {
    return date === dateRange.from || date === dateRange.to;
  };

  const isDateTempStart = (date: string) => {
    return date === tempStart;
  };

  const isDateToday = (date: string) => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    return date === todayStr;
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[225px] justify-start text-left font-normal",
              !dateRange.from && !dateRange.to && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span>{displayText}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-4"
          align="start"
          onOpenAutoFocus={(e) => {
            // Reset to current month when opening
            const today = new Date();
            setCurrentMonth(today.getMonth());
            setCurrentYear(today.getFullYear());
            e.preventDefault();
          }}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateYear("prev")}
                  className="h-8 w-8 p-0"
                >
                  ‹‹
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth("prev")}
                  className="h-8 w-8 p-0"
                >
                  ‹
                </Button>
                <h3 className="font-semibold min-w-[120px] text-center">
                  {currentMonthName} {currentYear}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth("next")}
                  className="h-8 w-8 p-0"
                >
                  ›
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateYear("next")}
                  className="h-8 w-8 p-0"
                >
                  ››
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Clear
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="p-2 font-medium text-gray-500 dark:text-gray-400"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, index) => {
                if (!date) {
                  return <div key={index} className="p-2" />;
                }

                const day = parseInt((date as string).split("-")[2]);
                const isSelected = isDateSelected(date);
                const isInRange = isDateInRange(date);
                const isTempStart = isDateTempStart(date);
                const isToday = isDateToday(date);

                return (
                  <button
                    key={date}
                    onClick={() => handleDateClick(date)}
                    className={cn(
                      "p-2 text-sm rounded-md transition-colors",
                      // Base hover state
                      "hover:bg-gray-100 dark:hover:bg-gray-700",
                      // Selected dates (start/end)
                      isSelected &&
                        "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700",
                      // Range dates (between start and end)
                      isInRange &&
                        !isSelected &&
                        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
                      // Temporary start date (waiting for end date)
                      isTempStart &&
                        "bg-blue-200 text-blue-800 border-2 border-blue-500 dark:bg-blue-800/50 dark:text-blue-200 dark:border-blue-400",
                      // Today indicator
                      isToday &&
                        !isSelected &&
                        "bg-gray-200 font-semibold dark:bg-gray-700 dark:text-white",
                      // Default state
                      !isSelected &&
                        !isInRange &&
                        !isTempStart &&
                        "text-gray-900 dark:text-gray-100"
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {tempStart && (
              <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Select end date for range starting{" "}
                {formatDisplayDate(tempStart)}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
