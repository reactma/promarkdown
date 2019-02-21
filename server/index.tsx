import * as React from 'react'
import * as ReactDOM from 'react-dom'
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/fold/foldgutter.css'
import 'codemirror/addon/scroll/simplescrollbars.css'
import 'codemirror/addon/dialog/dialog.css'
import 'codemirror/addon/search/matchesonscrollbar.css'
import 'codemirror/addon/search/matchesonscrollbar.css'

import '../src/matchhighlighter.css'
import '../src/menu.css'

import ProMarkdown, { EditorCore } from '../src/index'

const value = `
---
receipt:     Oz-Ware Purchase Invoice
date:        2007-08-06
customer:
    given:   Dorothy
    family:  Gale

items:
    - part_no:   A4786
      descrip:   Water Bucket (Filled)
      price:     1.47
      quantity:  4

    - part_no:   E1628
      descrip:   High Heeled "Ruby" Slippers
      size:       8
      price:     100.27
      quantity:  1

bill-to:  &id001
    street: |
            123 Tornado Alley
            Suite 16
    city:   East Centerville
    state:  KS

ship-to:  *id001

specialDelivery:  >
    Follow the Yellow Brick
    Road to the Emerald City.
    Pay no attention to the
    man behind the curtain.
---

GitHub Flavored Markdown
========================

Everything from markdown plus GFM features:

## URL autolinking

Underscores_are_allowed_between_words.

## Strikethrough text

GFM adds syntax to strikethrough text, which is missing from standard Markdown.

~~Mistaken text.~~
~~**works with other formatting**~~

~~spans across
lines~~

## Fenced code blocks (and syntax highlighting)

\`\`\`javascript
for (var i = 0; i < items.length; i++) {
  console.log(items[i], i); // log them
}
\`\`\`

## Task Lists

- [ ] Incomplete task list item
- [x] **Completed** task list item

## A bit of GitHub spice

* SHA: be6a8cc1c1ecfe9489fb51e4869af15a13fc2cd2
* User@SHA ref: mojombo@be6a8cc1c1ecfe9489fb51e4869af15a13fc2cd2
* User/Project@SHA: mojombo/god@be6a8cc1c1ecfe9489fb51e4869af15a13fc2cd2
* \#Num: #1
* User/#Num: mojombo#1
* User/Project#Num: mojombo/god#1

See http://github.github.com/github-flavored-markdown/.
`
let cm: CodeMirror.Editor

const options = { value, mode: 'toml-frontmatter' }
const locale = 'zh-CN'
const intlPhrases = {
  'Search:' : '搜索:>>>>',
}

const atMounted = (editor: CodeMirror.Editor) => console.log( 'mounted ', editor)
const atUnmounted = (editor: CodeMirror.Editor) => console.log( 'unmounted ', editor)
const onChange = (editor: CodeMirror.Editor,
                  change: CodeMirror.EditorChange) => console.log('onChange ', editor, change)

const atChange = (editor: CodeMirror.Editor, change: CodeMirror.EditorChange, value: string) =>
  console.log('at change', editor, change, value)

const props = { options, locale, intlPhrases, atMounted, atUnmounted, onChange, atChange }

const proMarkdownProps = {
  initialValue: value,
}
// ReactDOM.render(<EditorCore {...props} />, document.getElementById('root'))

ReactDOM.render(<ProMarkdown {...proMarkdownProps} />, document.getElementById('root'))
