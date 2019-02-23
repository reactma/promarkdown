import * as CodeMirror from 'codemirror'

// Get text state at given position

interface ITextState {
  [tag: string]: boolean
}

interface IBlockStyles {
  bold: '**' | '__'
  code: '```' | '~~~'
  strikethrough: '~~'
  italic: '*' | '_'
}

const DefaultBlockStyles = {
  bold: '**',
  code: '```',
  italic: '*',
  strikethrough: '~~'
}

const insertTexts = {
  link: ['[', '](#url#)'],
  image: ['![](', '#url#)'],
  table: [
    '',
    '\n\n| Column 1 | Column 2 | Column 3 |\n|:--------|:--------:|--------:|\n| Text     | Text     | Text     |\n\n'
  ],
  horizontalRule: ['', '\n\n-----\n\n']
}

const getTextState = (
  editor: CodeMirror.Editor,
  posArg?: CodeMirror.Position
) => {
  const cm = editor.getDoc()
  const pos = posArg || cm.getCursor('start')

  const stat = editor.getTokenAt(pos)

  if (!stat.type) return {}

  const types = stat.type.split(' ')

  let ret: ITextState = {}
  let data: string
  let text: string

  for (let i = 0; i < types.length; i++) {
    data = types[i]
    if (data === 'strong') {
      ret.bold = true
    } else if (data === 'variable-2') {
      text = cm.getLine(pos.line)
      if (/^\s*\d+\.\s/.test(text)) {
        ret['ordered-list'] = true
      } else {
        ret['unordered-list'] = true
      }
    } else if (data === 'atom') {
      ret.quote = true
    } else if (data === 'em') {
      ret.italic = true
    } else if (data === 'quote') {
      ret.quote = true
    } else if (data === 'strikethrough') {
      ret.strikethrough = true
    } else if (data === 'comment') {
      ret.code = true
    } else if (data === 'link') {
      ret.link = true
    } else if (data === 'tag') {
      ret.image = true
    } else if (data.match(/^header(\-[1-6])?$/)) {
      ret[data.replace('header', 'heading')] = true
    }
  }
  return ret
}

const toggleBlock = (
  editor: CodeMirror.Editor,
  type: string,
  state: ITextState,
  startCharsArg: string,
  endCharsArg?: string
) => {
  const endChars =
    typeof endCharsArg === 'undefined' ? startCharsArg : endCharsArg

  const cm = editor.getDoc()

  let text: string
  let start = startCharsArg
  let end = endChars

  const startPoint = cm.getCursor('start')
  const endPoint = cm.getCursor('end')

  if (state[type]) {
    text = cm.getLine(startPoint.line)
    start = text.slice(0, startPoint.ch)
    end = text.slice(startPoint.ch)
    if (type == 'bold') {
      start = start.replace(/(\*\*|__)(?![\s\S]*(\*\*|__))/, '')
      end = end.replace(/(\*\*|__)/, '')
    } else if (type == 'italic') {
      start = start.replace(/(\*|_)(?![\s\S]*(\*|_))/, '')
      end = end.replace(/(\*|_)/, '')
    } else if (type == 'strikethrough') {
      start = start.replace(/(\*\*|~~)(?![\s\S]*(\*\*|~~))/, '')
      end = end.replace(/(\*\*|~~)/, '')
    }
    cm.replaceRange(
      start + end,
      {
        line: startPoint.line,
        ch: 0
      },
      {
        line: startPoint.line,
        ch: 99999999999999
      }
    )

    if (type == 'bold' || type == 'strikethrough') {
      startPoint.ch -= 2
      if (startPoint !== endPoint) {
        endPoint.ch -= 2
      }
    } else if (type == 'italic') {
      startPoint.ch -= 1
      if (startPoint !== endPoint) {
        endPoint.ch -= 1
      }
    }
  } else {
    text = cm.getSelection()
    if (type == 'bold') {
      text = text.split('**').join('')
      text = text.split('__').join('')
    } else if (type == 'italic') {
      text = text.split('*').join('')
      text = text.split('_').join('')
    } else if (type == 'strikethrough') {
      text = text.split('~~').join('')
    }
    cm.replaceSelection(start + text + end)

    startPoint.ch += startCharsArg.length
    endPoint.ch = startPoint.ch + text.length
  }

  cm.setSelection(startPoint, endPoint)
  editor.focus()
}

const toggleBold = (
  editor: CodeMirror.Editor,
  state: ITextState,
  blockStyles?: IBlockStyles
) => {
  const block = blockStyles ? blockStyles.bold : DefaultBlockStyles.bold

  toggleBlock(editor, 'bold', state, block)
}

const toggleItalic = (
  editor: CodeMirror.Editor,
  state: ITextState,
  blockStyles?: IBlockStyles
) => {
  const block = blockStyles ? blockStyles.italic : DefaultBlockStyles.italic

  toggleBlock(editor, 'italic', state, block)
}

const toggleStrikethrough = (
  editor: CodeMirror.Editor,
  state: ITextState,
  blockStyles?: IBlockStyles
) => {
  const block = blockStyles
    ? blockStyles.strikethrough
    : DefaultBlockStyles.strikethrough

  toggleBlock(editor, 'strikethrough', state, block)
}

const toggleHeadingBase = (
  editor: CodeMirror.Editor,
  direction: string,
  size?: number
) => {
  const cm = editor.getDoc()
  const startPoint = cm.getCursor('start')
  const endPoint = cm.getCursor('end')
  for (let i = startPoint.line; i <= endPoint.line; i++) {
    ; (function(i) {
      let text = cm.getLine(i)
      const currHeadingLevel = text.search(/[^#]/)

      if (direction !== undefined) {
        if (currHeadingLevel <= 0) {
          if (direction == 'bigger') {
            text = '###### ' + text
          } else {
            text = '# ' + text
          }
        } else if (currHeadingLevel == 6 && direction == 'smaller') {
          text = text.substr(7)
        } else if (currHeadingLevel == 1 && direction == 'bigger') {
          text = text.substr(2)
        } else {
          if (direction == 'bigger') {
            text = text.substr(1)
          } else {
            text = '#' + text
          }
        }
      } else {
        if (size == 1) {
          if (currHeadingLevel <= 0) {
            text = '# ' + text
          } else if (currHeadingLevel == size) {
            text = text.substr(currHeadingLevel + 1)
          } else {
            text = '# ' + text.substr(currHeadingLevel + 1)
          }
        } else if (size == 2) {
          if (currHeadingLevel <= 0) {
            text = '## ' + text
          } else if (currHeadingLevel == size) {
            text = text.substr(currHeadingLevel + 1)
          } else {
            text = '## ' + text.substr(currHeadingLevel + 1)
          }
        } else {
          if (currHeadingLevel <= 0) {
            text = '### ' + text
          } else if (currHeadingLevel == size) {
            text = text.substr(currHeadingLevel + 1)
          } else {
            text = '### ' + text.substr(currHeadingLevel + 1)
          }
        }
      }

      cm.replaceRange(
        text,
        {
          line: i,
          ch: 0
        },
        {
          line: i,
          ch: 99999999999999
        }
      )
    })(i)
  }
  editor.focus()
}

const toggleHeading = (editor: CodeMirror.Editor) =>
  toggleHeadingBase(editor, 'smaller')

const toggleLine = (
  editor: CodeMirror.Editor,
  stat: ITextState,
  name: string
) => {
  const cm = editor.getDoc()

  const startPoint = cm.getCursor('start')
  const endPoint = cm.getCursor('end')
  const repl = {
    quote: /^(\s*)\>\s+/,
    'unordered-list': /^(\s*)(\*|\-|\+)\s+/,
    'ordered-list': /^(\s*)\d+\.\s+/
  }
  const map = {
    quote: '> ',
    'unordered-list': '* ',
    'ordered-list': '1. '
  }
  for (let i = startPoint.line; i <= endPoint.line; i++) {
    ; (function(i) {
      let text = cm.getLine(i)
      if (stat[name]) {
        text = text.replace((repl as any)[name], '$1')
      } else {
        text = (map as any)[name] + text
      }
      cm.replaceRange(
        text,
        {
          line: i,
          ch: 0
        },
        {
          line: i,
          ch: 99999999999999
        }
      )
    })(i)
  }
  editor.focus()
}

const toggleQuote = (editor: CodeMirror.Editor, state: ITextState) => {
  toggleLine(editor, state, 'quote')
}

const toggleUnorderedList = (editor: CodeMirror.Editor, state: ITextState) => {
  toggleLine(editor, state, 'unordered-list')
}

const toggleOrderedList = (editor: CodeMirror.Editor, state: ITextState) => {
  toggleLine(editor, state, 'ordered-list')
}

const replaceSelection = (
  editor: CodeMirror.Editor,
  active: boolean,
  startEnd: string[],
  url?: string
) => {
  let text
  let start = startEnd[0]
  let end = startEnd[1]
  const cm = editor.getDoc()
  const startPoint = cm.getCursor('start')
  const endPoint = cm.getCursor('end')
  if (url) {
    end = end.replace('#url#', url)
  }
  if (active) {
    text = cm.getLine(startPoint.line)
    start = text.slice(0, startPoint.ch)
    end = text.slice(startPoint.ch)
    cm.replaceRange(start + end, {
      line: startPoint.line,
      ch: 0
    })
  } else {
    text = cm.getSelection()
    cm.replaceSelection(start + text + end)

    startPoint.ch += start.length
    if (startPoint !== endPoint) {
      endPoint.ch += start.length
    }
  }
  cm.setSelection(startPoint, endPoint)
  editor.focus()
}

const drawLink = (editor: CodeMirror.Editor, stat: ITextState) => {
  const url = 'http://'

  replaceSelection(editor, stat.link, insertTexts.link, url)
}

const drawImage = (editor: CodeMirror.Editor, stat: ITextState) => {
  const url = 'http://'
  replaceSelection(editor, stat.image, insertTexts.image, url)
}

const drawTable = (editor: CodeMirror.Editor, stat: ITextState) => {
  replaceSelection(editor, stat.table, insertTexts.table)
}

/**
 * Action for toggling code block.
 */
const toggleCodeBlock = (editor: CodeMirror.Editor) => {
  const fenceCharsToInsert = DefaultBlockStyles.code

  const insertFencingAtSelection = (
    editor: CodeMirror.Editor,
    cur_start: any,
    cur_end: any,
    fenceCharsToInsert: any
  ) => {
    const cm = editor.getDoc()

    let start_line_sel = cur_start.line + 1,
      end_line_sel = cur_end.line + 1,
      sel_multi = cur_start.line !== cur_end.line,
      repl_start = fenceCharsToInsert + '\n',
      repl_end = '\n' + fenceCharsToInsert
    if (sel_multi) {
      end_line_sel++
    }
    // handle last char including \n or not
    if (sel_multi && cur_end.ch === 0) {
      repl_end = fenceCharsToInsert + '\n'
      end_line_sel--
    }
    replaceSelection(editor, false, [repl_start, repl_end])
    cm.setSelection(
      {
        line: start_line_sel,
        ch: 0
      },
      {
        line: end_line_sel,
        ch: 0
      }
    )
  }

  const cm = editor.getDoc(),
    cur_start = cm.getCursor('start'),
    cur_end = cm.getCursor('end')

  // insert code formatting
  const no_sel_and_starting_of_line =
    cur_start.line === cur_end.line &&
    cur_start.ch === cur_end.ch &&
    cur_start.ch === 0
  const sel_multi = cur_start.line !== cur_end.line
  if (no_sel_and_starting_of_line || sel_multi) {
    insertFencingAtSelection(editor, cur_start, cur_end, fenceCharsToInsert)
  } else {
    replaceSelection(editor, false, ['`', '`'])
  }
}

export {
  drawImage,
  drawLink,
  drawTable,
  getTextState,
  toggleBold,
  toggleCodeBlock,
  toggleHeading,
  toggleItalic,
  toggleOrderedList,
  toggleQuote,
  toggleStrikethrough,
  toggleUnorderedList,
  IBlockStyles,
  ITextState
}
