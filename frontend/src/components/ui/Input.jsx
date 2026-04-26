import { forwardRef } from "react";
import { cn } from "../../utils/cn";

export const Input = forwardRef(({ className, error, ...props }, ref) => {
  return (
    <div className="w-full relative">
      <input
        ref={ref}
        className={cn(
          "w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      />
      {error && (
        <span className="text-xs text-red-500 mt-1 block absolute -bottom-5 left-0">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = "Input";
