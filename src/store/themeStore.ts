import type { Theme } from '@/lib/types';
import { proxy, subscribe } from 'valtio';

const storedState = localStorage.getItem('skin-state');
export const themeState = proxy<{ theme: Theme }>(
  storedState ? JSON.parse(storedState) : { theme: 'dark' }
);

subscribe(themeState, () => {
  localStorage.setItem('theme', JSON.stringify(themeState));
});
