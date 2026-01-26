import { dommy } from '@reely/dommy';
export const ConditionalBinding = (): HTMLDivElement => {
  const formula = dommy.state('a + b');
  const a = dommy.state(1),
    b = dommy.state(2),
    c = dommy.state(3),
    d = dommy.state(4);
  const triggeredTimes = new Text(String(0));

  return dommy.tags.div(
    dommy.tags.div(
      'formula: ',
      dommy.tags.div('_AA_', a),
      dommy.tags.select(
        { oninput: (e) => (formula.val = e.target.value) },
        dommy.tags.option({ selected: () => formula.val === 'a + b' }, 'a + b'),
        dommy.tags.option({ selected: () => formula.val === 'c + d' }, 'c + d')
      ),
      ' a: ',
      dommy.tags.input({ type: 'number', min: 0, max: 9, value: a, oninput: (e) => (a.val = Number(e.target.value)) }),
      ' b: ',
      dommy.tags.input({ type: 'number', min: 0, max: 9, value: b, oninput: (e) => (b.val = Number(e.target.value)) }),
      ' c: ',
      dommy.tags.input({ type: 'number', min: 0, max: 9, value: c, oninput: (e) => (c.val = Number(e.target.value)) }),
      ' d: ',
      dommy.tags.input({ type: 'number', min: 0, max: 9, value: d, oninput: (e) => (d.val = Number(e.target.value)) })
    ),
    dommy.tags.div('sum: ', () => {
      triggeredTimes.textContent = String(Number(triggeredTimes.textContent) + 1);
      return formula.val === 'a + b' ? a.val + b.val : c.val + d.val;
    }),
    dommy.tags.div('Binding function triggered: ', triggeredTimes, ' time(s)')
  );
};
