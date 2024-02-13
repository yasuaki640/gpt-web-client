import { describe, expect, it } from "vitest";
import { parseMarkdown } from "./markdown";

describe("parseMarkdown", () => {
  it("should convert parseMarkdown to html", async () => {
    const actual = await parseMarkdown(markdown);
    expect(actual).toBe(expected);
  });
});

const markdown = `# Sample Markdown

This is some basic, sample markdown.

## Second Heading

 * Unordered lists, and:
  1. One
  1. Two
  1. Three
 * More

> Blockquote

And **bold**, *italics*, and even *italics and later **bold***. Even ~~strikethrough~~. [A link](https://markdowntohtml.com) to somewhere.

And code highlighting:

\`\`\`js
var foo = 'bar';

function baz(s) {
   return foo + ':' + s;
}
\`\`\`

Or inline code like \`var foo = 'bar';\`.

Or an image of bears

![bears](http://placebear.com/200/200)

The end ...
`;

const expected = `<h1>Sample Markdown</h1>
<p>This is some basic, sample markdown.</p>
<h2>Second Heading</h2>
<ul>
<li>Unordered lists, and:</li>
</ul>
<ol>
<li>One</li>
<li>Two</li>
<li>Three</li>
</ol>
<ul>
<li>More</li>
</ul>
<blockquote>
<p>Blockquote</p>
</blockquote>
<p>And <strong>bold</strong>, <em>italics</em>, and even <em>italics and later <strong>bold</strong></em>. Even ~~strikethrough~~. <a href="https://markdowntohtml.com">A link</a> to somewhere.</p>
<p>And code highlighting:</p>
<pre><code class="language-js">var foo = 'bar';

function baz(s) {
   return foo + ':' + s;
}
</code></pre>
<p>Or inline code like <code>var foo = 'bar';</code>.</p>
<p>Or an image of bears</p>
<p><img src="http://placebear.com/200/200" alt="bears"></p>
<p>The end ...</p>`;
