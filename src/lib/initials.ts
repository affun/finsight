/** Avatar initials from a display name, e.g. "Alex Johnson" → "AJ". */
export function getInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]!.toUpperCase())
      .join("") || "U"
  );
}
