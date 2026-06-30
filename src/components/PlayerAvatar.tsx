import React from "react";
import { User } from "lucide-react";

interface PlayerAvatarProps {
  src?: string | null;
  className?: string;
  fallbackIconClassName?: string;
}

export default function PlayerAvatar({
  src,
  className = "w-12 h-12 rounded-xl",
  fallbackIconClassName = "w-6 h-6"
}: PlayerAvatarProps) {
  // If src is a valid image url and is not empty and is not the old hardcoded Unsplash image
  const isValidSrc = src && typeof src === "string" && src.trim() !== "" && !src.includes("images.unsplash.com");

  if (isValidSrc) {
    return (
      <img
        src={src}
        alt="Player Avatar"
        className={`${className} object-cover`}
        referrerPolicy="no-referrer"
      />
    );
  }

  // Default Monarch Avatar: beautifully styled with gradients and glowing user icon
  return (
    <div className={`${className} bg-gradient-to-tr from-purple-950/60 via-[#0a0a14] to-cyan-950/60 flex items-center justify-center border border-purple-500/30 shadow-[0_0_15px_rgba(123,47,255,0.25)] relative overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-purple-500/10 pointer-events-none" />
      <User className={`${fallbackIconClassName} text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.65)]`} />
    </div>
  );
}
