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

`slugify` keeps ASCII letters, digits and hyphens: other characters, accented letters included, are dropped, not transliterated. Both throw a `TypeError` for anything but a string.
