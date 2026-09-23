"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { WEEKDAYS, toIso, sameDay, buildGrid } from "@/lib/calendarUtils";

export default function DatePicker({
  value,
  onChange,
  label,
  placeholder = "Datum wählen",
}: {
  value: string;
  onChange: (iso: string) => void;
  label?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = value ? new Date(value + "T00:00:00") : null;
  const [viewMonth, setViewMonth] = useState(selected || new Date());
  const wrapRef = useRef<HTMLDivElement>(null);
  const today = new Date();

  useEffect(() => {
    if (open) setViewMonth(selected || new Date());
  }, [open]);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const cells = buildGrid(viewMonth);

  return (
    <div ref={wrapRef} className="relative">
      {label && (
        <label className="text-sm font-medium text-muted-foreground">
          {label}
        </label>
      )}

      <div
        onClick={() => setOpen((v) => !v)}
        className={`${
          label ? "mt-1.5" : ""
        } w-full h-11 rounded-2xl border border-border bg-card px-4 flex items-center justify-between cursor-pointer shadow-apple-sm`}
      >
        <span className={selected ? "" : "text-muted-foreground"}>
          {selected
            ? selected.toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })
            : placeholder}
        </span>
        <Calendar size={17} className="text-muted-foreground" />
      </div>

      {open && (
        <div className="absolute mt-2 w-[300px] glass-strong border border-border rounded-2xl shadow-apple-lg z-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() =>
                setViewMonth(
                  new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1)
                )
              }
              className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-accent transition-colors duration-150 ease-apple"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="font-semibold capitalize">
              {viewMonth.toLocaleDateString("de-DE", {
                month: "long",
                year: "numeric",
              })}
            </span>

            <button
              type="button"
              onClick={() =>
                setViewMonth(
                  new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1)
                )
              }
              className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-accent transition-colors duration-150 ease-apple"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map((w) => (
              <div
                key={w}
                className="text-center text-xs font-medium text-muted-foreground py-1"
              >
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell, i) => {
              const isSelected = selected && sameDay(cell.date, selected);
              const isToday = sameDay(cell.date, today);

              return (
                <button
                  type="button"
                  key={i}
                  onClick={() => {
                    onChange(toIso(cell.date));
                    setOpen(false);
                  }}
                  className={`h-9 w-9 rounded-full text-sm flex items-center justify-center transition-colors duration-150 ease-apple ${
                    !cell.inMonth
                      ? "text-muted-foreground/40 hover:bg-accent"
                      : isSelected
                      ? "bg-primary text-primary-foreground font-semibold"
                      : isToday
                      ? "text-primary font-semibold ring-1 ring-primary/40 hover:bg-accent"
                      : "hover:bg-accent"
                  }`}
                >
                  {cell.date.getDate()}
                </button>
              );
            })}
          </div>

          {value && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="mt-3 w-full text-center text-sm font-medium text-muted-foreground hover:text-destructive transition-colors duration-150 ease-apple"
            >
              Datum entfernen
            </button>
          )}
        </div>
      )}
    </div>
  );
}
