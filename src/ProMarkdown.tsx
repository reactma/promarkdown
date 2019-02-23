import * as React from 'react'

import EditorCore from './EditorCore'

import MenuItem, { IMenuItemState } from './MenuItem'

import markdownTransformer from './frontmatterTransformer'

import { debug } from 'util'

import * as Helper from './helpers'

import MarkdownPreview from './MarkdownPreview'

type ProMarkdownMenuNames =
  | 'bold'
  | 'br'
  | 'code'
  | 'eraser'
  | 'fullscreen'
  | 'heading'
  | 'help'
  | 'image'
  | 'ordered-list'
  | 'quote'
  | 'italic'
  | 'link'
  | 'preview'
  | 'strikethrough'
  | 'splitpane'
  | 'table'
  | 'unordered-list'
  | '|'

interface IProMarkdownMenuItem {
  name: ProMarkdownMenuNames
  tip: string
  className?: string
  render?: (props?: any) => any
  onClick?: (name: string, state: string) => void
}

interface IProMarkdownProps {
  className?: string
  initialValue?: string
  mode?: 'yaml-frontmatter' | 'toml-frontmatter' | 'json-frontmatter'
  menu?: IProMarkdownMenuItem[]
  markdownTransformer?: (from: string) => string
}

const EditorStates = {
  editing: 'editing',
  preview: 'preview',
  splitpane: 'splitpane'
}

const ProMarkdown = (props: IProMarkdownProps) => {
  //debugger

  const [scroll, setScroll] = React.useState({ left: 0, top: 0 })

  const [cursor, setCursor] = React.useState({ line: 0, ch: 0 })

  const [value, setValue] = React.useState<string>(props.initialValue || '')

  const [codemirror, setCodemirror] = React.useState<CodeMirror.Editor | null>(
    null
  )

  const [textState, setTextState] = React.useState<Helper.ITextState>({})

  // false - normal editing, true - fullscreen
  const [fullScreen, setFullScreen] = React.useState(false)

  // 'editing' / 'preview' / 'splitpane' only when fullscreen
  const [editorState, setEditorState] = React.useState<string>('editing')

  const savePosition = () => {
    if (codemirror) {
      const pos = codemirror!.getScrollInfo()
      const cursor = codemirror!.getDoc().getCursor()
      setScroll({ left: pos.left, top: pos.top })
      setCursor({ line: cursor.line, ch: cursor.ch })
    }
  }

  // Menu iterm interactive handlers
  const iHandlers: {
    [name: string]: () => any
  } = {
    bold: () => codemirror && Helper.toggleBold(codemirror, textState),
    br: () => codemirror && Helper.drawHorizontalRule(codemirror, textState),
    eraser: () => codemirror && Helper.cleanBlock(codemirror),
    heading: () => codemirror && Helper.toggleHeading(codemirror),
    italic: () => codemirror && Helper.toggleItalic(codemirror, textState),
    link: () => codemirror && Helper.drawLink(codemirror, textState),
    image: () => codemirror && Helper.drawImage(codemirror, textState),
    table: () => codemirror && Helper.drawTable(codemirror, textState),
    code: () => codemirror && Helper.toggleCodeBlock(codemirror),
    'ordered-list': () =>
      codemirror && Helper.toggleOrderedList(codemirror, textState),
    'unordered-list': () =>
      codemirror && Helper.toggleUnorderedList(codemirror, textState),
    quote: () => codemirror && Helper.toggleQuote(codemirror, textState),
    strikethrough: () =>
      codemirror && Helper.toggleStrikethrough(codemirror, textState),
    preview: () => {
      if (editorState === EditorStates.preview)
        setEditorState(EditorStates.editing)
      else {
        savePosition()
        setEditorState(EditorStates.preview)
      }
    },

    fullscreen: () => {
      if (editorState === EditorStates.editing) {
        savePosition()
      }

      if (editorState === EditorStates.splitpane) {
        savePosition()
        setEditorState(EditorStates.editing)
      }

      setFullScreen(!fullScreen)
    },

    splitpane: () => {
      if (editorState === EditorStates.splitpane) {
        savePosition()
        setEditorState(EditorStates.editing)
        return
      }

      if (!fullScreen) setFullScreen(true)

      if (editorState === EditorStates.editing) savePosition()

      setEditorState(EditorStates.splitpane)
    }
  }

  const defaultMenu: IProMarkdownMenuItem[] = [
    {
      name: 'bold',
      tip: 'Toggle bold'
    },
    {
      name: 'italic',
      tip: 'Toggle italic'
    },
    {
      name: 'strikethrough',
      tip: 'Toggle strikethrough'
    },
    {
      name: 'heading',
      tip: 'Toggle heading'
    },
    {
      name: '|',
      tip: ''
    },
    {
      name: 'quote',
      tip: 'Toggle quote'
    },
    {
      name: 'code',
      tip: 'Toggle quote'
    },
    {
      name: 'unordered-list',
      tip: 'Toggle unordered list'
    },
    {
      name: 'ordered-list',
      tip: 'Toggle ordered list'
    },
    {
      name: '|',
      tip: ''
    },
    {
      name: 'link',
      tip: 'Link'
    },
    {
      name: 'image',
      tip: 'Image'
    },
    {
      name: 'table',
      tip: 'Table'
    },
    {
      name: 'br',
      tip: 'Horizontal rule'
    },
    {
      name: '|',
      tip: ''
    },
    {
      name: 'preview',
      tip: 'Preview'
    },
    {
      name: 'splitpane',
      tip: 'Edit & live preview'
    },
    {
      name: 'fullscreen',
      tip: 'Fullscreen'
    },
    {
      name: '|',
      tip: ''
    },
    {
      name: 'help',
      tip: 'Help'
    }
  ]

  const mode = props.mode || 'yaml-frontmatter'

  const menuItem =
    props.menu && props.menu.length > 0 ? props.menu : defaultMenu

  const atMounted = (cm: CodeMirror.Editor) => {
    setCodemirror(cm)
    cm.scrollTo(scroll.left, scroll.top)
    cm.getDoc().setCursor(cursor.line, cursor.ch)
    cm.focus()
  }

  const atUnmounted = (cm: CodeMirror.Editor) => {
    setValue(cm.getDoc().getValue())
  }

  const atChange = (
    cm: CodeMirror.Editor,
    change: CodeMirror.EditorChange,
    value: string
  ) => {
    setValue(value)
  }

  const onCursorActivity = (cm: CodeMirror.Editor) => {
    const textState = Helper.getTextState(cm)

    setTextState(textState)
  }

  const menu = (
    <div className='pro-markdown-menu'>
      {menuItem.map((item: IProMarkdownMenuItem, index: number) => {
        const { name } = item

        let state: IMenuItemState = 'enabled'

        switch (name) {
          case 'bold':
          case 'br':
          case 'code':
          case 'eraser':
          case 'heading':
          case 'image':
          case 'table':
          case 'italic':
          case 'link':
          case 'ordered-list':
          case 'quote':
          case 'table':
          case 'strikethrough':
          case 'unordered-list':
            state = textState[name] ? 'selected' : 'enabled'
            break

          case 'italic':
            state = textState.italic ? 'selected' : 'enabled'
            break

          case 'fullscreen':
            state = fullScreen ? 'selected' : 'enabled'
            break

          default:
            state = editorState === name ? 'selected' : 'enabled'
        }

        return (
          <span key={index} className='pro-markdown-icon-wrap'>
            {name === '|' ? (
              <MenuItem {...item} />
            ) : (
                <MenuItem {...item} onClick={iHandlers[name]} state={state} />
              )}
          </span>
        )
      })}
    </div>
  )

  const editorProps = {
    options: {
      value,
      mode
    },
    atMounted,
    atUnmounted,
    atChange,
    onCursorActivity
  }

  const wrapperClassName =
    'pro-markdown ' +
    (fullScreen ? 'pro-markdown-fullscreen' : 'pro-markdown-normal')

  let editor: React.ComponentElement<any, any>

  switch (editorState) {
    case EditorStates.preview: {
      const source = value || ''

      const trans = props.markdownTransformer
        ? props.markdownTransformer
        : markdownTransformer

      const transed = trans(source)

      editor = <MarkdownPreview source={transed} />
      return (
        <div className={wrapperClassName}>
          {menu}
          {editor}
        </div>
      )
    }

    case EditorStates.splitpane: {
      const source = value || ''

      const trans = props.markdownTransformer
        ? props.markdownTransformer
        : markdownTransformer

      const transed = trans(source)

      const preview = (
        <MarkdownPreview className='markdown-body' source={transed} />
      )

      editor = <EditorCore {...editorProps} />

      return (
        <div className={wrapperClassName}>
          {menu}
          <div className='pro-markdown-splitwrap'>
            <div className='pro-markdown-splitpane-editor'>{editor}</div>
            <div className='pro-markdown-splitpane-preview'>{preview}</div>
          </div>
        </div>
      )
    }

    default: {
      editor = <EditorCore {...editorProps} />
      return (
        <div className={wrapperClassName}>
          {menu}
          {editor}
        </div>
      )
    }
  }
}

export default ProMarkdown
