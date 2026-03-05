import React from "react";

export interface LoadingButtonProps {
  children: React.ReactNode;
  onClick?: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  type?: "button" | "submit";
  className?: string;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  children,
  onClick,
  loading = false,
  disabled = false,
  variant = "primary",
  type = "button",
  className = "",
}) => {
  const isDisabled = disabled || loading;

  const base =
    "w-full py-3.5 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 min-h-[48px] disabled:opacity-60 disabled:cursor-not-allowed";
  const variants = {
    primary:
      "bg-[#1a73e8] text-white hover:bg-[#1557b0] active:bg-[#134a9e] shadow-sm",
    secondary:
      "bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Đang xử lý...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default LoadingButton;
