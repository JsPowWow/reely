import { createElement, signal } from '../index';

describe('createElement: properties and attributes', () => {
  it('sets string props as attributes', () => {
    const element = createElement('div', { id: 'board', title: 'Race' });

    expect(element.getAttribute('id')).toBe('board');
    expect(element.getAttribute('title')).toBe('Race');
  });

  it('maps DOM property names to attribute names', () => {
    const label = createElement('label', { className: 'row', htmlFor: 'name-input' });
    const input = createElement('input', { tabIndex: 2 });

    expect(label.outerHTML).toBe('<label class="row" for="name-input"></label>');
    expect(input.getAttribute('tabindex')).toBe('2');
  });

  it('takes DOM property names, lowercase where the DOM has them so', () => {
    const input = createElement('input', { autocomplete: 'username', autofocus: true });

    expect(input.getAttribute('autocomplete')).toBe('username');
    expect(input.hasAttribute('autofocus')).toBe(true);
  });

  it('sets `list` and `form`, element references in the DOM, as the id attributes they are', () => {
    const input = createElement('input', { list: 'cars', form: 'entry' });
    const button = createElement('button', { form: 'entry' });

    expect(input.getAttribute('list')).toBe('cars');
    expect(input.getAttribute('form')).toBe('entry');
    expect(button.getAttribute('form')).toBe('entry');
  });

  it('sets a boolean attribute when true and omits it when false', () => {
    const enabled = createElement('button', { disabled: false });
    const disabled = createElement('button', { disabled: true });

    expect(enabled.hasAttribute('disabled')).toBe(false);
    expect(disabled.getAttribute('disabled')).toBe('');
    expect(disabled.disabled).toBe(true);
  });

  it('sets any boolean prop through its property, or as an attribute without one: `false` leaves none', () => {
    const validated = signal(true);
    const video = createElement('video', { autoplay: false, loop: true });
    const form = createElement('form', { noValidate: validated });
    const panel = createElement('div', { inert: false, title: 'race' });

    validated.value = false;

    expect([video.hasAttribute('autoplay'), video.hasAttribute('loop'), video.loop]).toEqual([false, true, true]);
    expect(form.hasAttribute('novalidate')).toBe(false);
    expect(panel.outerHTML).toBe('<div title="race"></div>');
  });

  it('selects the option a `select` value names, set once its options are in place', () => {
    const select = createElement(
      'select',
      { value: 'b' },
      createElement('option', { value: 'a' }, 'A'),
      createElement('option', { value: 'b' }, 'B')
    );

    expect(select.value).toBe('b');
  });

  it('sets token-list props, `DOMTokenList`s in the DOM, from a string', () => {
    const frame = createElement('iframe', { sandbox: 'allow-scripts allow-forms' });
    const icon = createElement('link', { rel: 'icon', sizes: '32x32' });

    expect(frame.getAttribute('sandbox')).toBe('allow-scripts allow-forms');
    expect(icon.getAttribute('sizes')).toBe('32x32');
  });

  it('keeps every selected option of a `select multiple`, which takes `multiple` before its options', () => {
    const select = createElement(
      'select',
      { multiple: true },
      createElement('option', { value: 'a', selected: true }, 'A'),
      createElement('option', { value: 'b', selected: true }, 'B')
    );

    expect(Array.from(select.selectedOptions, (option) => option.value)).toEqual(['a', 'b']);
  });

  describe('live state', () => {
    it('sets `value` as a property', () => {
      const textarea = createElement('textarea', { value: 'draft' });

      expect(textarea.value).toBe('draft');
    });

    it('clears it for `null` and `undefined`: an empty `value`, unchecked', () => {
      const draft = signal<string | undefined>('lap 3');
      const done = signal<boolean | null>(true);
      const empty = createElement('input', { value: undefined });
      const field = createElement('input', { value: draft });
      const box = createElement('input', { type: 'checkbox', checked: done });

      draft.value = undefined;
      done.value = null;

      expect([empty.value, field.value, box.checked]).toEqual(['', '', false]);
    });

    it('sets `indeterminate`, which has no attribute', () => {
      const input = createElement('input', { type: 'checkbox', indeterminate: true });

      expect(input.indeterminate).toBe(true);
      expect(input.hasAttribute('indeterminate')).toBe(false);
    });
  });

  it('sets `data-*` attributes', () => {
    const element = createElement('li', { 'data-racer': 'bolt' });

    expect(element.dataset['racer']).toBe('bolt');
  });

  it('assigns `styles` to the inline style', () => {
    const element = createElement('div', { styles: { color: 'red', marginTop: '4px' } });

    expect(element.style.color).toBe('red');
    expect(element.style.marginTop).toBe('4px');
    expect(element.hasAttribute('styles')).toBe(false);
  });

  it('renders `aria` props as `role` and `aria-*` attributes', () => {
    const element = createElement('a', { aria: { role: 'status', ariaCurrent: 'step', ariaLabel: 'Step 1' } });

    expect(element.getAttribute('role')).toBe('status');
    expect(element.getAttribute('aria-current')).toBe('step');
    expect(element.getAttribute('aria-label')).toBe('Step 1');
    expect(element.hasAttribute('aria')).toBe(false);
  });

  it('names multi-word `aria` attributes the ARIA way, in one lowercase word', () => {
    const link = createElement('a', {
      aria: { ariaKeyShortcuts: 'ArrowRight', ariaValueNow: '3', ariaRoleDescription: 'lap' },
    });

    expect(link.getAttribute('aria-keyshortcuts')).toBe('ArrowRight');
    expect(link.getAttribute('aria-valuenow')).toBe('3');
    expect(link.getAttribute('aria-roledescription')).toBe('lap');
  });

  it('renders ID-reference `aria` props, which `ARIAMixin` has only as element arrays', () => {
    const listing = createElement('pre', { aria: { ariaLabelledby: 'title caption', ariaDescribedby: 'hint' } });

    expect(listing.getAttribute('aria-labelledby')).toBe('title caption');
    expect(listing.getAttribute('aria-describedby')).toBe('hint');
  });

  it('does not render `children` or `eventsAbortSignal` as attributes', () => {
    const element = createElement('div', {
      children: 'text',
      eventsAbortSignal: new AbortController().signal,
    });

    expect(element.attributes).toHaveLength(0);
  });
});
