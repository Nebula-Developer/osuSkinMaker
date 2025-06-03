import { proxy } from 'valtio';
import { EmptySkin, getDefaultProperties } from '@/lib/elements';
import type { Skin, Component } from '@/lib/types';

export const skinState = proxy<{
  skin: Skin;
}>({
  skin: EmptySkin,
});
