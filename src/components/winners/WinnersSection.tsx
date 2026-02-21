import { useState, useMemo, useEffect } from "react";
import { WinnerCard } from "./WinnerCard";
import type { Winner } from "../../types/winner";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa";
import { cn } from "../../utils/cn";
import {
  getMonthName,
  getLastFriday,
  getFridaysInMonth,
  canNavigateToPreviousMonth,
  canNavigateToNextMonth,
} from "../../utils/dateUtils";
import { isSameDay, isSameMonth, parseISO } from "date-fns";

interface WinnersSectionProps {
  allWinners: Winner[];
}

const MIN_DATE = new Date(2026, 0, 1);

export const WinnersSection = ({ allWinners }: WinnersSectionProps) => {
  const maxDate = getLastFriday();

  const [currentDate, setCurrentDate] = useState<Date>(() => new Date(maxDate));
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const fridays = useMemo(
    () => getFridaysInMonth(year, month, maxDate),
    [year, month, maxDate],
  );

  useEffect(() => {
    if (fridays.length > 0 && selectedDay === null) {
      const lastFridayInMonth = fridays[fridays.length - 1];
      setSelectedDay(lastFridayInMonth.getDate());
    }
  }, [fridays, selectedDay]);

  const canGoPrevious = useMemo(
    () => canNavigateToPreviousMonth(year, month, MIN_DATE),
    [year, month],
  );

  const canGoNext = useMemo(
    () => canNavigateToNextMonth(year, month, maxDate),
    [year, month, maxDate],
  );

  const changeMonth = (increment: number): void => {
    if (increment < 0 && !canGoPrevious) return;
    if (increment > 0 && !canGoNext) return;

    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentDate(newDate);
    setSelectedDay(null);
  };

  const filteredWinners = useMemo(() => {
    const targetDate = new Date(year, month, selectedDay ?? 1);

    return allWinners.filter((winner: Winner) => {
      const winnerDate = parseISO(winner.date);
      if (selectedDay !== null) {
        return isSameDay(winnerDate, targetDate);
      }
      return isSameMonth(winnerDate, targetDate);
    });
  }, [allWinners, month, year, selectedDay]);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h2 className="text-intense-pink font-bold text-4xl mb-6 font-family-display">
          Selecciona el mes y el día para ver a los ganadores
        </h2>

        <div className="flex justify-center items-center gap-4 mb-8">
          <div className="bg-pale-pink rounded-2xl border-2 border-intense-pink max-w-lg w-full px-2 flex items-center justify-center shadow-[0_0_15px_rgba(255,0,128,0.5)]">
            <button
              onClick={() => changeMonth(-1)}
              disabled={!canGoPrevious}
              className={cn(
                "text-intense-pink rounded-full p-1 transition",
                canGoPrevious
                  ? "hover:bg-white/50 cursor-pointer"
                  : "opacity-30 cursor-not-allowed",
              )}
              aria-label="Mes anterior"
            >
              <FaCaretLeft size={40} />
            </button>
            <span className="text-intense-pink font-black text-3xl px-6 min-w-[200px] text-center uppercase font-family-display">
              {getMonthName(month)} {year}
            </span>
            <button
              onClick={() => changeMonth(1)}
              disabled={!canGoNext}
              className={cn(
                "text-intense-pink rounded-full p-1 transition",
                canGoNext
                  ? "hover:bg-white/50 cursor-pointer"
                  : "opacity-30 cursor-not-allowed",
              )}
              aria-label="Mes siguiente"
            >
              <FaCaretRight size={40} />
            </button>
          </div>
        </div>

        <div className="flex justify-center flex-wrap gap-4 mb-12">
          {fridays.map((date) => {
            const dayNum = date.getDate();
            const isSelected = selectedDay === dayNum;

            return (
              <button
                key={dayNum}
                onClick={() => setSelectedDay(isSelected ? null : dayNum)}
                className={cn(
                  "border-2 rounded-lg w-20 h-30 flex flex-col items-center justify-center transition-all duration-300 font-family-display",
                  isSelected
                    ? "bg-pale-pink border-intense-pink text-intense-pink shadow-[0_0_20px_rgba(255,0,128,0.8)] scale-110"
                    : "bg-black border-white text-white hover:border-intense-pink hover:text-intense-pink",
                )}
                aria-label={`Viernes ${dayNum}`}
              >
                <span className="text-lg font-semibold uppercase mb-1">
                  Vie.
                </span>
                <span className="text-5xl font-bold leading-none">
                  {dayNum}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {filteredWinners.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-28 mt-40">
          {filteredWinners.map((winner, index) => (
            <WinnerCard key={winner.id} winner={winner} priority={index < 3} />
          ))}
        </div>
      ) : (
        <div className="mt-20 flex flex-col items-center justify-center py-16 px-6 border-4 border-dashed border-intense-pink/40 rounded-3xl bg-black/30 backdrop-blur-sm shadow-[0_0_20px_rgba(255,0,128,0.2)]">
          <div className="text-intense-pink mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-20 w-20 opacity-60"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-white text-2xl font-bold mb-2 font-family-display uppercase tracking-wide">
            Sin ganadores
          </p>
          <p className="text-gray-400 text-base text-center max-w-md">
            No hay ganadores registrados para esta fecha. Selecciona otro día
            para ver los resultados.
          </p>
        </div>
      )}
    </section>
  );
};
