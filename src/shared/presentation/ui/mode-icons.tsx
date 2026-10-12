type IconProps = {
  className?: string;
};

const base = "size-7 shrink-0";

/** Gestapelde kaarten — Classic / solo focus */
export function IconModeClassic({ className = base }: IconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
    >
      <rect
        x="6"
        y="8"
        width="16"
        height="20"
        rx="2.5"
        className="stroke-current"
        strokeWidth="1.75"
        opacity="0.35"
      />
      <rect
        x="9"
        y="5"
        width="16"
        height="20"
        rx="2.5"
        className="fill-current/10 stroke-current"
        strokeWidth="1.75"
      />
      <path
        d="M14 12h6M14 16h6M14 20h4"
        className="stroke-current"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Stopwatch — Time Attack */
export function IconModeTime({ className = base }: IconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
    >
      <circle
        cx="16"
        cy="17"
        r="9"
        className="stroke-current"
        strokeWidth="1.75"
      />
      <path
        d="M16 11v6l4 2"
        className="stroke-current"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 4h6"
        className="stroke-current"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M16 4v2"
        className="stroke-current"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Groep — Online lobby */
export function IconModeMultiplayer({ className = base }: IconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
    >
      <circle
        cx="11"
        cy="12"
        r="3.25"
        className="stroke-current"
        strokeWidth="1.75"
      />
      <circle
        cx="21"
        cy="12"
        r="3.25"
        className="stroke-current"
        strokeWidth="1.75"
      />
      <path
        d="M5 24c0-3.5 2.7-6 6-6s6 2.5 6 6M15 24c0-2.8 2-5 6-5 2.2 0 4 1.2 5 3"
        className="stroke-current"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
