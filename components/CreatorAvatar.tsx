type CreatorAvatarProps = {
  src: string | null | undefined;
  name: string;
  className?: string;
};

/** User-uploaded avatars — plain img avoids Next.js remote image config crashes. */
export function CreatorAvatar({ src, name, className = "" }: CreatorAvatarProps) {
  const initial = (name.trim().charAt(0) || "?").toUpperCase();

  if (!src) {
    return (
      <span
        className={`flex h-full w-full items-center justify-center bg-bp-chip font-bold text-gray-500 ${className}`}
      >
        {initial}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className={`h-full w-full object-cover ${className}`} loading="lazy" />
  );
}
