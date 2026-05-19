import { Zap } from "lucide-react";
import { Link } from "react-router-dom";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 group">
      <div className="w-10 h-10 bg-[#111] rounded-lg flex items-center justify-center shadow-sm group-hover:bg-orange-600 transition-colors duration-300">
        <Zap className="text-white w-6 h-6 fill-white" />
      </div>
      <span className="text-xl font-bold tracking-tight text-[#111]">Signalmerge</span>
    </Link>
  );
}
