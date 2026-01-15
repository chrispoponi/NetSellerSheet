import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
    label?: string;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
}

const PremiumInput = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, prefix, suffix, ...props }, ref) => {
        return (
            <div className="w-full space-y-2">
                {label && (
                    <label className="text-sm font-medium text-slate-400 ml-1">
                        {label}
                    </label>
                )}
                <div className="relative group">
                    {prefix && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-focus-within:text-emerald-500 transition-colors">
                            {prefix}
                        </div>
                    )}
                    <input
                        className={cn(
                            "flex h-12 w-full rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm ring-offset-slate-950 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-50 text-slate-100 transition-all duration-200",
                            prefix && "pl-9",
                            suffix && "pr-9",
                            className
                        )}
                        ref={ref}
                        {...props}
                    />
                    {suffix && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                            {suffix}
                        </div>
                    )}
                </div>
            </div>
        );
    }
);
PremiumInput.displayName = "PremiumInput";

export { PremiumInput };
