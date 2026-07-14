import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Input } from "@/components/ui/input";

export function SearchableInput({ 
  value, 
  onChange, 
  options, 
  placeholder 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  options: { label: string; value: string }[]; 
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  
  // Find initial label if value exists
  const initialLabel = options.find(o => o.value === value)?.label || value;
  const [search, setSearch] = useState(initialLabel);
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{top: number, left: number, width: number} | null>(null);

  // Sync search input with value when it changes externally
  useEffect(() => {
    if (!open) {
      const selected = options.find(o => o.value === value);
      setSearch(selected ? selected.label : value);
    }
  }, [value, open, options]);

  // Update coordinates when opened or search changes
  useEffect(() => {
    if (open && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width
      });
    }
  }, [open, search]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        wrapperRef.current && !wrapperRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = options.filter(o => 
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={wrapperRef}>
      <Input
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full"
      />
      
      {open && coords && typeof document !== 'undefined' && createPortal(
        <div 
          ref={dropdownRef}
          className="fixed z-[9999] bg-popover text-popover-foreground border shadow-md rounded-md max-h-[200px] overflow-y-auto"
          style={{
            top: coords.top,
            left: coords.left,
            width: coords.width
          }}
        >
          {filtered.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground text-center">
              No results found
            </div>
          ) : (
            filtered.map((opt) => (
              <div
                key={opt.value}
                className="cursor-pointer p-2 text-sm hover:bg-accent hover:text-accent-foreground"
                onClick={() => {
                  setSearch(opt.label);
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
              </div>
            ))
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
