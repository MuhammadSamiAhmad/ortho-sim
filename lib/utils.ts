import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/*
 * Utility function for managing Tailwind CSS classes in a Next.js project.
 * Combines `clsx` for conditional class name joining and `tailwind-merge` for
 * resolving Tailwind CSS style conflicts, ensuring clean and predictable styling.
 *
 * Purpose:
 * The `cn` function merges class names dynamically, allowing conditional application
 * of Tailwind CSS classes. It’s useful for reusable components where styling varies
 * based on props or state, e.g., `<button className={cn('bg-blue-500', props.className)}>`.
 */

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
