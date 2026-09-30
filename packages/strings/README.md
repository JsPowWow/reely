# @reely/strings

Capitalize words and make URL slugs.

```sh
npm i @reely/strings
```

```ts
import { capitalize, slugify } from '@reely/strings';

capitalize('ada lovelace'); // 'Ada Lovelace': every word by default
capitalize('LONDON', false); // 'London': the first letter, the rest lowercased

const url = `/blog/${slugify('10 Tips for Remote Work in 2026!')}`; // '/blog/10-tips-for-remote-work-in-2026'
```

`slugify` keeps letters of every script, digits and hyphens: a Latin letter loses its accent (`Café` → `cafe`, `Łódź` → `lodz`, `Straße` → `strasse`), Cyrillic and other scripts stay as they are, with their vowel signs (`Моя машина` → `моя-машина`), and anything else, `²` and `½` included, is dropped. `capitalize` capitalizes words in any script. Both throw a `TypeError` for anything but a string.
