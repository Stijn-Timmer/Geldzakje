import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combineert class names met clsx en merged conflicting Tailwind classes
 * Dit is de standaard utility voor het samenvoegen van CSS classes in shadcn/ui
 * 
 * @param inputs - Array van class values (strings, objects, arrays)
 * @returns Gemerged class string
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Type utilities voor component props zonder child/children
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };
