import { BrandButton } from './brand.button';
import { mounted, typeInto } from '../../../testing/dom.testing';

describe('BrandButton (colors)', () => {
  it('picks the text colour that reads best on the brand colour', () => {
    const view = mounted(() => <BrandButton />);

    typeInto(view.host, '#facc15');

    expect(view.host.querySelector('[data-text]')?.getAttribute('data-text')).toBe('black');
    expect(view.text()).toContain('Black text, 13.71:1, passes WCAG AA');
    view.dispose();
  });
});
