"use client";
import { useState, useCallback } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTaskStore } from "@/store/useTaskStore";
import { useDebounce } from "@/lib/useDebounce";
import { useEffect } from "react";

const EXAMPLES = [
  "Tasks from Jessica",
  "Recruiting emails",
  "Things I snoozed",
  "Follow-ups from Monday",
];

export function SearchBar() {
  const [value, setValue] = useState("");
  const { search, clearSearch, searchQuery } = useTaskStore();
  const debounced = useDebounce(value, 500);

  useEffect(() => {
    if (debounced) search(debounced);
    else clearSearch();
  }, [debounced, search, clearSearch]);

  const handleClear = useCallback(() => {
    setValue("");
    clearSearch();
  }, [clearSearch]);

  const exampleIdx = Math.floor(Date.now() / 86400000) % EXAMPLES.length;

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
        placeholder={`Search… e.g. "${EXAMPLES[exampleIdx]}"`}
        className="pl-9 pr-9 h-10 bg-card border-border rounded-xl"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          onClick={handleClear}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
