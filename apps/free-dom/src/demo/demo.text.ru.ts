import { pluralOf } from '../i18n/plural';

import type { DemoText } from './demo.text';

const plural = pluralOf('ru');

export const ru: DemoText = {
  meter: {
    built: 'Создано при первой отрисовке',
    labels: {
      text: 'Правки текста',
      attribute: 'Правки атрибутов',
      move: 'Перемещено узлов',
      node: 'Добавлено или удалено узлов',
    },
    count: {
      text: (count) =>
        `${count} ${plural(count, { one: 'правка', few: 'правки', many: 'правок', other: 'правки' })} текста`,
      attribute: (count) =>
        `${count} ${plural(count, {
          one: 'правка атрибута',
          few: 'правки атрибутов',
          many: 'правок атрибутов',
          other: 'правки атрибутов',
        })}`,
      move: (count) =>
        `${plural(count, { one: 'перемещён', other: 'перемещено' })} ${count} ${plural(count, {
          one: 'узел',
          few: 'узла',
          many: 'узлов',
          other: 'узла',
        })}`,
      node: (count) =>
        `${plural(count, { one: 'добавлен или удалён', other: 'добавлено или удалено' })} ${count} ${plural(count, {
          one: 'узел',
          few: 'узла',
          many: 'узлов',
          other: 'узла',
        })}`,
    },
    change: (writes, total) =>
      `Последнее изменение: ${writes.join(', ')}. С первой отрисовки ${total} ${plural(total, {
        one: 'запись',
        few: 'записи',
        many: 'записей',
        other: 'записи',
      })} в DOM.`,
  },
  source: { title: 'Исходный код' },
  panelsLabel: 'Демо и исходный код',
};
