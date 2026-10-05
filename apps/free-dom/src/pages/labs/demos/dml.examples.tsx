import { OrdersDml } from './orders.dml';
import ordersDmlSource from './orders.dml.tsx?highlight';
import { PanelsDml } from './panels.dml';
import panelsDmlSource from './panels.dml.tsx?highlight';
import { PanelsInto } from './panels.into';
import panelsIntoSource from './panels.into.tsx?highlight';
import { Live } from '../../docs/docs.live';

/** The DML lab's demos: begin/end, its `await` bug, and `into`. */
export interface DmlExamples {
  ordersDml: Node;
  panelsDml: Node;
  panelsInto: Node;
}

export const dmlExamples = (): DmlExamples => ({
  ordersDml: <Live Demo={OrdersDml} caption='orders.dml.tsx' source={ordersDmlSource} />,
  panelsDml: <Live Demo={PanelsDml} caption='panels.dml.tsx' source={panelsDmlSource} />,
  panelsInto: <Live Demo={PanelsInto} caption='panels.into.tsx' source={panelsIntoSource} />,
});
