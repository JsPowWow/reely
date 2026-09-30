import type { SiteText } from './site.text';

export const ru: SiteText = {
  nav: { label: 'Сайт', docs: 'Документация', evolution: 'Эволюция', labs: 'Лаборатория' },
  language: { label: 'Язык' },
  pager: { previous: 'Назад', next: 'Дальше' },
  notFound: {
    documentTitle: 'Страница не найдена | reely',
    title: (pathname) => `Страницы ${pathname} нет`,
    lead: 'Документация отвечает на один вопрос на странице, а эволюция reely собирает всё шаг за шагом.',
    openDocs: 'Открыть документацию',
  },
  failed: { text: 'Страница не загрузилась.', openDocs: 'Открыть документацию' },
};
