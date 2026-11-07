import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";
interface Props extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; size?: Size; loading?: boolean }

const variants: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-600/50",
  secondary: "border border-line bg-white text-ink hover:bg-stone-50",
  ghost: "text-ink hover:bg-stone-100",
  danger: "bg-bad text-white hover:bg-red-800 disabled:bg-bad/50",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", size = "md", loading, disabled, className, children, type = "button", ...rest }, ref,
) {
  return (
    <button
      ref={ref} type={type} disabled={disabled || loading} aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed",
        size === "sm" ? "h-8 px-3 text-xs" : "h-9 px-4 text-sm", variants[variant], className,
      )}
      {...rest}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
});

export function IconButton({ label, className, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button type="button" aria-label={label} title={label}
      className={cn("inline-flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-stone-100 hover:text-ink", className)} {...rest}>
      {children}
    </button>
  );
}
