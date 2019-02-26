import * as React from 'react'
import * as ReactDOM from 'react-dom'
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/fold/foldgutter.css'
import 'codemirror/addon/scroll/simplescrollbars.css'
import 'codemirror/addon/dialog/dialog.css'
import 'codemirror/addon/search/matchesonscrollbar.css'

import '../src/matchhighlighter.css'
import '../src/remarkdown.css'
import '../src/gitmarkdown.css'
import '../src/keymapmenu.css'

import ReMarkdown, { EditorCore, IReMarkdownProps } from '../src/index'

const initialValue = `
---
receipt:     Oz-Ware Purchase Invoice
date:        2007-08-06
customer:
    given:   Dorothy
    family:  Gale

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

const codemirrorOptions = {
  onBeforeChange: () => console.log('on before change'),
  onKeyHandled: () => console.log('key handled')
}

const locale = 'zh-CN'
const intlPhrases = {
  'Search:': '搜索:>>>>'
}

const atMounted = (editor: CodeMirror.Editor) => console.log('mounted ', editor)
const atUnmounted = (editor: CodeMirror.Editor) =>
  console.log('unmounted ', editor)
const onChange = (editor: CodeMirror.Editor, change: CodeMirror.EditorChange) =>
  console.log('onChange ', editor, change)

const atChange = (
  editor: CodeMirror.Editor,
  change: CodeMirror.EditorChange,
  value: string
) => console.log('at change >>>>>>>>', editor, change, value)

const mode = {
  name: 'yaml-frontmatter',
  base: 'markdown'
}

const menuitemTips = {
  table: '>>>>>'
}

const menu = [
  {
    name: 'bold',
    tip: 'Make it bold'
  },
  {
    name: 'mycommand',
    tip: 'myCommand',
    className: 'icon-my-comman',
    render: () => <div className="custom-rendered"> My Format </div>,
    onClick: (editor: CodeMirror.Editor, name: string, state: string) =>
      console.log('mycomman', editor, name, state)
  }
]


const renderPreview =  (props: { value: string, frontmatter: string }) => {
  console.log( props.value, props.frontmatter)
  return <div> Preview </div>
}

const testProps1 = {
  initialValue,
}

const testProps2 = {
  hideMenu: false,
  codemirrorOptions,
  //  menu,
  locale,
  intlPhrases,
  atMounted,
  atUnmounted,
  onChange,
  atChange,
  mode,
  menuitemTips,
  initialValue,
  lineNumbers: false,
  helpLink: 'https://bing.com',
  renderPreview,
} as IReMarkdownProps

// ReactDOM.render(<EditorCore {...testProps2} />, document.getElementById('root'))

ReactDOM.render(<ReMarkdown {...testProps1} />, document.getElementById('root'))
//ReactDOM.render(<ReMarkdown menuitemTips={menuitemTips} atChange={atChange} initialValue={initialValue} />, document.getElementById('root'))

