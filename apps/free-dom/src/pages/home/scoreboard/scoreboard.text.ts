import { localized } from '../../../i18n/localized';

const en = {
  title: 'Simulated race',
  label: 'Standings of a simulated race',
  columns: { place: 'Place', car: 'Car', time: 'Time' },
  pause: 'Pause',
  resume: 'Resume',
};

export type ScoreboardText = typeof en;

export const scoreboardText = localized(en, () => import('./scoreboard.text.ru').then((module) => module.ru));
