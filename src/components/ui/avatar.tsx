import { cn } from "@/lib/utils";

type AvatarProps = {
  email?: string;
  name?: string;
  className?: string;
};

function getInitials(email?: string, name?: string): string {
  // Try to get initials from name first
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      // First name + Last name initials
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    // Single name - use first 2 characters
    return parts[0].substring(0, 2).toUpperCase();
  }

  // Fallback to email username
  if (email) {
    const username = email.split("@")[0];
    return username.substring(0, 2).toUpperCase();
  }

  return "??";
}

export function Avatar({ email, name, className }: AvatarProps) {
  const initials = getInitials(email, name);

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-accent-9 text-neutral-1 dark:text-neutral-12 font-medium",
        "h-8 w-8 text-sm",
        className
      )}
    >
      {initials}
    </div>
  );
}
