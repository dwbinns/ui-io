# Data driven web user interface library

`ui-io` is a library for connecting data to HTML or SVG user interfaces.

```js
// html creates HTML elements:
import { HTML } from "ui-io";

// attach to a document and get element factories:
const { h1 } = HTML(document);

document.body.append(
    // create an h1 element, and add content to it:
    h1("Hello world!")
);
```
