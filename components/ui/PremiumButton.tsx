import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    isLoading?: boolean;
}

const PremiumButton = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {

        const variants = {
            primary: "bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/40 border border-emerald-400/20",
            secondary: "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700",
            ghost: "bg-transparent hover:bg-slate-800/50 text-slate-300 hover:text-white",
            outline: "bg-transparent border border-slate-700 text-slate-300 hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-950/20"
        };

        const sizes = {
            sm: "h-8 px-3 text-xs",
            md: "h-11 px-5 text-sm",
            lg: "h-14 px-8 text-base",
            xl: "h-16 px-10 text-lg font-bold"
        };

        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
                    variants[variant],
                    sizes[size],
                    className
                )}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);
PremiumButton.displayName = "PremiumButton";

export { PremiumButton };
