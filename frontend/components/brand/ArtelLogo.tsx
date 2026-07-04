import Image from "next/image";

/** The ARTEL emblem (community circle + wordmark). */
export function ArtelLogo({
  size = 40,
  className = "",
  priority = false,
}: {
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/artel-logo.png"
      alt="ARTEL"
      width={size}
      height={size}
      priority={priority}
      className={className}
    />
  );
}
