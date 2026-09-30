import { scopedLogger } from '@reely/logger';

declare const console: { info: (...parameters: unknown[]) => void };

const lines: unknown[][] = [];
console.info = (...parameters: unknown[]): void => {
  lines.push(parameters);
};

const cart = scopedLogger('cart');
cart.info('hidden while the scope is off');
const total = cart.setEnabled(true).logWith('info', 'total')(42);

if (total !== 42 || JSON.stringify(lines) !== JSON.stringify([['[[cart]]\t', 'total', 42]])) {
  throw new Error(`unexpected logger: ${JSON.stringify(lines)}`);
}
