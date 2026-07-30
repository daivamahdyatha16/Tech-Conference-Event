import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
}

const Button = ({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) => {
  const baseStyle =
    "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50";

  const variants = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-300/40",

    secondary:
      "bg-slate-900 text-white hover:bg-slate-800",

    outline:
      "border border-slate-300 bg-white text-slate-700 hover:border-blue-600 hover:text-blue-600",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;