import { capitalize, slugify } from '@reely/strings';

const name = capitalize('ada lovelace');
const slug = slugify('10 Tips for Remote Work in 2026!');
let rejected: unknown;
try {
  capitalize(42 as unknown as string);
} catch (error) {
  rejected = error;
}

if (name !== 'Ada Lovelace' || slug !== '10-tips-for-remote-work-in-2026' || !(rejected instanceof TypeError)) {
  throw new Error(`unexpected strings: ${JSON.stringify({ name, slug })}`);
}
