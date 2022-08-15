/**
 * @jest-environment jsdom
 */
import { escapeSpecialCahrs, element } from "../src/html-util.js";

test.each([
    ['&', '&amp;'],
    ['<', '&lt;'],
    ['>', '&gt;'],
    ['"', '&quot;'],
    ["'", '&#039;'],
    ['<div class="test">content</div>', '&lt;div class=&quot;test&quot;&gt;content&lt;/div&gt;']
])('%#. escapeSpecialCahrs %s', (str, expected) => {
    expect(escapeSpecialCahrs(str)).toBe(expected);
});


test('element', () => {
    const actual = element`<h1 class="title">タイトル</h1>`;

    const h1 = document.createElement('h1');
    h1.textContent = 'タイトル';
    h1.classList.add('title');

    expect(h1).toStrictEqual(actual);
});

