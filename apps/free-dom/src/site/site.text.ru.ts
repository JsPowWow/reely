import type { SiteText } from './site.text';

export const ru: SiteText = {
  nav: { label: 'Сайт', docs: 'Документация', evolution: 'Эволюция', labs: 'Лаборатория' },
  language: { label: 'Язык' },
  pager: { previous: 'Назад', next: 'Дальше' },
  openDocs: 'Открыть документацию',
  notFound: {
    documentTitle: 'Страница не найдена | reely',
    title: (pathname) => `Страницы ${pathname} нет`,
    lead: 'Каждая страница документации отвечает на один вопрос, а эволюция reely собирает всё шаг за шагом.',
  },
  failed: 'Страница не загрузилась.',
};
