import { SourceView } from '../../demo/source.view';
import { Live } from '../docs/docs.live';
import diamondSpecSource from '../../../../../labs-ignore/signals-graph/diamond.spec.ts?highlight';
import { DiamondLog } from './demos/diamond.log';
import diamondLogSource from './demos/diamond.log.tsx?highlight';
import { MarkupList } from './demos/markup.list';
import markupListSource from './demos/markup.list.tsx?highlight';
import { SharedParent } from './demos/shared.parent';
import sharedParentSource from './demos/shared.parent.tsx?highlight';
import { labSource } from './labs.source';

import type { LabsText } from './labs.text';

export const ru: LabsText = {
  documentTitle: 'Лаборатория | reely',
  title: 'Лаборатория',
  lead: 'Эксперименты вокруг reely, которые не входят в пакеты. Каждый эксперимент задаёт один вопрос, отвечает на него тестами и заканчивается вердиктом: то, что себя оправдало, переезжает в пакет, остальное остаётся как запись.',
  labs: {
    dml: {
      title: 'Операторы внутри разметки',
      Body: () => (
        <>
          <p>
            Может ли разметка принимать <code>for</code>, <code>if</code> и <code>switch</code> так, как это делает
            van_dml с <code>begin</code>/<code>end</code>, без изменений в ядре dommy? Эксперимент опробовал три формы:
          </p>
          <ul>
            <li>
              Генератор, <code>markup(function* () {'{ … }'})</code>: каждый <code>yield</code> добавляет ребёнка, а
              блок закрывается своей фигурной скобкой.
            </li>
            <li>
              <code>using within(parent)</code>: текущий родитель, которого блок закрывает, даже если внутри бросается
              исключение.
            </li>
            <li>
              <code>begin</code>/<code>end</code> вручную, как в van_dml: баланс никто не проверяет.
            </li>
          </ul>
          <p>
            Генератору нужна одна строка вспомогательного кода; он не хранит состояния и выполняется один раз, как
            компонент:
          </p>
          <Live Demo={MarkupList} caption='markup.list.tsx' source={markupListSource} />
          <p>
            Две другие формы делят один текущий родитель на весь модуль. Две сборки, которые ждут посередине, кладут
            свои вторые элементы в того родителя, который окажется текущим к этому моменту:
          </p>
          <Live Demo={SharedParent} caption='shared.parent.tsx' source={sharedParentSource} />
          <h3>Вердикт</h3>
          <p>
            Оставить стоит генератор: операторы в разметке, баланс держит синтаксис, общего состояния нет, ядро не
            меняется. Его цена — <code>yield</code> на каждого ребёнка, а забытый <code>yield</code> молча теряет
            ребёнка. <a href={labSource('dml')}>Эксперимент и его тесты</a>.
          </p>
        </>
      ),
    },
    'signals-graph': {
      title: 'Граф сигналов по образцу Angular',
      Body: () => (
        <>
          <p>
            <code>signal</code> проталкивает своим потребителям метку «грязный», <code>computed</code> пересчитывается
            при чтении, <code>effect</code> выполняется, как только получает уведомление. Эксперимент появился раньше
            сигналов dommy и остаётся для сравнения. Показательный случай — ромб: эффект, который читает{' '}
            <code>count</code> и <code>double = count * 2</code>.
          </p>
          <p>
            В эксперименте запись 2 запускает эффект раньше, чем <code>double</code> помечен грязным: эффект выводит 2 /
            2 — пару, которой никогда не было, — а затем перезапускает сам себя, пока его что-нибудь не остановит. Тест
            фиксирует и то и другое:
          </p>
          <SourceView source={diamondSpecSource} caption='labs-ignore/signals-graph/diamond.spec.ts' />
          <p>Тот же ромб в dommy выводит одну актуальную пару на каждое изменение:</p>
          <Live Demo={DiamondLog} caption='diamond.log.tsx' source={diamondLogSource} />
          <h3>Вердикт</h3>
          <p>
            Остаётся как запись. Граф с проталкиванием должен пометить все грязные узлы, прежде чем запустить хоть один
            эффект; именно запуск эффектов во время проталкивания и порождает сбой, и цикл.{' '}
            <a href={labSource('signals-graph')}>Эксперимент и его тесты</a>.
          </p>
        </>
      ),
    },
  },
};
