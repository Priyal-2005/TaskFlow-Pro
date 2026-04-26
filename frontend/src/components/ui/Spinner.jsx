import { Loader2 } from "lucide-react";

export function Spinner({ size = 24, className }) {
  return (
    <Loader2 
      size={size} 
      className={`animate-spin text-blue-600 ${className || ""}`} 
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex h-[50vh] w-full items-center justify-center">
      <Spinner size={32} />
    </div>
  );
}
