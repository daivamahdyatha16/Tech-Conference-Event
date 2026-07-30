import type { InputHTMLAttributes } from "react";

const Input = ({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      className={`w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 ${className}`}
      {...props}
    />
  );
};

export default Input;