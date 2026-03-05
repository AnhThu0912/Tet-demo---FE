import React from "react";

export type PaymentMethodId = "fake_gateway" | "lemonsqueezy";

export interface PaymentMethodCardProps {
  id: PaymentMethodId;
  label: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  id,
  label,
  description,
  selected,
  onSelect,
  disabled = false,
}) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={`
        w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all
        hover:border-[#1a73e8] hover:bg-[#e8f0fe]/50
        focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:ring-offset-2
        disabled:opacity-50 disabled:pointer-events-none
        ${selected ? "border-[#1a73e8] bg-[#e8f0fe]/60 shadow-sm" : "border-gray-200 bg-white"}
      `}
    >
      <span
        className={`
          flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center
          ${selected ? "border-[#1a73e8] bg-[#1a73e8]" : "border-gray-300"}
        `}
      >
        {selected && (
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
            <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
          </svg>
        )}
      </span>
      <div className="flex-grow min-w-0">
        <span className="font-semibold text-gray-900">{label}</span>
        {description && (
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
    </button>
  );
};

export default PaymentMethodCard;
