import { mount } from '@reely/dommy';

import { SiteHeader } from './site.header';
import { MutationMeter } from '../demo/mutation.meter';
import { chooseLocale } from '../i18n/locale';
import { textsLoaded } from '../i18n/localized';
import { LikeButton } from '../pages/docs/demos/like.button';
import { clickButton, flushMutations } from '../testing/dom.testing';

const navLabels = (root: Element): string[] =>
  Array.from(root.querySelectorAll('nav a'), (link) => link.textContent ?? '');

describe('SiteHeader', () => {
  afterEach(() => {
    chooseLocale('en');
  });

  it('switches the site to Russian and back in place, and keeps the choice', async () => {
    const host = document.createElement('div');
    const unmount = mount(host, () => <SiteHeader current='packages' />);
    const russian = host.querySelector('button[lang="ru"]');

    expect(navLabels(host)).toEqual(['Packages', 'Games', 'Labs', 'GitHub']);
    expect(russian?.getAttribute('aria-pressed')).toBe('false');

    clickButton(host, 'RU');
    await textsLoaded();

    expect(navLabels(host)).toEqual(['Пакеты', 'Игры', 'Лаборатория', 'GitHub']);
    expect(russian?.getAttribute('aria-pressed')).toBe('true');
    expect(host.querySelector('[role="group"]')?.getAttribute('aria-label')).toBe('Язык');
    expect(localStorage.getItem('reely.locale')).toBe(JSON.stringify('ru'));

    clickButton(host, 'EN');
    expect(navLabels(host)[0]).toBe('Packages');
    unmount();
  });

  it('keeps a demo as it is while the language changes, and relabels its counter', async () => {
    const host = document.createElement('div');
    const unmount = mount(host, () => (
      <MutationMeter>
        <LikeButton />
      </MutationMeter>
    ));
    const output = host.querySelector('output');
    clickButton(host, 'Like');
    await flushMutations();

    chooseLocale('ru');
    await textsLoaded();
    await flushMutations();

    expect(host.querySelector('output')).toBe(output);
    expect(output?.textContent).toBe('42');
    expect(host.querySelector('dt')?.textContent).toBe('Создано при первой отрисовке');
    expect(host.textContent).toContain('Правки текста');
    unmount();
  });
});
