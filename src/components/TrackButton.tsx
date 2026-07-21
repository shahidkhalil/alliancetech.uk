"use client";

import type { MouseEvent, ReactNode } from "react";
import {
  trackConversion,
  trackEvent,
  type AnalyticsEventName,
  type AnalyticsParams,
} from "@/lib/analytics";

type TrackButtonProps = {
  children: ReactNode;
  eventName: AnalyticsEventName;
  eventParams?: AnalyticsParams;
  conversion?: boolean;
  href?: string;
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: (event: MouseEvent<HTMLElement>) => void;
};

export default function TrackButton({
  children,
  eventName,
  eventParams = {},
  conversion = false,
  href,
  className = "",
  type = "button",
  onClick,
}: TrackButtonProps) {
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if (conversion) trackConversion(eventName, eventParams);
    else trackEvent(eventName, eventParams);
    onClick?.(event);
  };

  if (href) {
    return (
      <a
        href={href}
        className={className}
        data-analytics-tracked="true"
        onClick={handleClick}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={className}
      data-analytics-tracked="true"
      onClick={handleClick}
    >
      {children}
    </button>
  );
}
