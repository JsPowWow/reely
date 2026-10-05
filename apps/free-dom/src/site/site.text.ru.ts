import type { SiteText } from './site.text';

export const ru: SiteText = {
  nav: { label: 'Сайт', packages: 'Пакеты', games: 'Игры', labs: 'Лаборатория' },
  dommyNav: { overview: 'Обзор', docs: 'Документация', evolution: 'Эволюция' },
  language: { label: 'Язык' },
  pager: { previous: 'Назад', next: 'Дальше' },
  openDocs: 'Открыть документацию',
  seePackages: 'Посмотреть пакеты',
  notFound: {
    documentTitle: 'Страница не найдена | reely',
    title: (pathname) => `Страницы ${pathname} нет`,
    lead: 'reely — это набор небольших пакетов, у каждого своя страница; список — на главной.',
  },
  failed: 'Страница не загрузилась.',
};
