import { useId } from 'react';

interface BrandIconProps {
  className?: string;
}

export function BrandIcon({ className = 'w-8 h-8' }: BrandIconProps) {
  const uid = useId();
  const strokeGradId = `${uid}-stroke`;
  const fillGradId = `${uid}-fill`;

  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={strokeGradId} x1="4" y1="3" x2="32" y2="33" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="55%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
        <linearGradient id={fillGradId} x1="18" y1="3" x2="18" y2="33" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#0B1220" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <path
        d="M18 3L5.5 8.2V17.4C5.5 25.1 10.8 31.4 18 33.5C25.2 31.4 30.5 25.1 30.5 17.4V8.2L18 3Z"
        fill={`url(#${fillGradId})`}
        stroke={`url(#${strokeGradId})`}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M18 9.2L10.8 12.2V17.4C10.8 22.1 13.8 26.1 18 27.6C22.2 26.1 25.2 22.1 25.2 17.4V12.2L18 9.2Z"
        stroke="#22D3EE"
        strokeOpacity="0.38"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path
        d="M14.2 18.2L16.9 20.9L22.3 15.1"
        stroke="#F8FAFC"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
