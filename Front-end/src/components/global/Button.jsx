import React from "react";
import { Plus } from "lucide-react";

export default function Button({
  onClick,
  selected,
  setSelected,
  Icon,
  title,
}) {
  console.log("selected stated:", selected);
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl py-3 px-4  ${selected === title ? "primary-btn border border-transparent" : "bg-card-2 border border-text-secondary/10 hover:cursor-pointer hover:scale-103 hover:bg-text-secondary/10 transition-all duration-300 text-white"}`}
    >
      {/* icon */}
      {Icon}
      <span className="font-semibold text-lg">{title}</span>
    </div>
  );
}
