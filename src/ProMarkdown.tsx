import * as React from 'react'

import EditorCore from './EditorCore'

import MenuItem, { IMenuItemState, IMenuItemProps, IMenuItemRenderProps } from './MenuItem'

import { debug } from 'util'

import * as Helper from './helpers'

import MarkdownPreview from './MarkdownPreview'

export type ProMarkdownMenuNames =
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

type Keymap = 'default' | 'vim' | 'sublime' | 'emacs'

export interface IMenuItemTips {
  [name: string]: string,
}

export interface IProMarkdownMenuItem {
  name: ProMarkdownMenuNames | string
  tip: string
  className?: string
  render?: (props?: IMenuItemRenderProps) => any
  onClick?: (editor: CodeMirror.Editor, name: string, state: string) => void
  link?: string // For help only
}

export interface IProMarkdownProps {
  className?: string
  initialValue?: string
  hideMenu?: boolean
  mode?: {
    name: 'yaml-frontmatter' | 'toml-frontmatter' | 'json-frontmatter'
    base: 'markdown' | 'gfm'
  }
  menu?: IProMarkdownMenuItem[]
  markdownTransformer?: (from: string) => string
  renderPreview?: (props: { value: string, frontmatter: string }) => React.ComponentElement<any, any>
  menuitemTips?: {
    [name: string]: string
  }
  locale?: string
  lineNumbers?: boolean
  helpLink?: string
  atMounted?: (editor: CodeMirror.Editor) => any
  atUnmounted?: (editor: CodeMirror.Editor, value: string) => any
  atChange?: (editor: CodeMirror.Editor, change: CodeMirror.EditorChange, value: string) => any
  codemirrorOptions?: any
}

const EditorStates = {
  editing: 'editing',
  preview: 'preview',
  splitpane: 'splitpane'
}

const ProMarkdown = (props: IProMarkdownProps) => {
  // debugger

  if (
    props.mode &&
    props.mode.name !== 'yaml-frontmatter' &&
    props.mode.name !== 'toml-frontmatter' &&
    props.mode.name !== 'json-frontmatter' &&
    props.mode.base !== 'markdown' &&
    props.mode.base !== 'gfm'
  )
    throw new Error(
      'Current only supports yaml-frontmatter mode, tom-frontmatter and json-fromtmatter modes, with gfm or markdown as base mode'
    )

  const locale = props.locale === 'zh-CN' ? 'zh-CN' : 'en-US'

  const [scroll, setScroll] = React.useState({ left: 0, top: 0 })

  const [cursor, setCursor] = React.useState({ line: 0, ch: 0 })

  const [value, setValue] = React.useState<string>(props.initialValue || '')

  const [keyboard, setKeyboard] = React.useState<string>('Default') // Vim, Emacs, Sublime

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
      const cursorZ = codemirror!.getDoc().getCursor()
      setScroll({ left: pos.left, top: pos.top })
      setCursor({ line: cursorZ.line, ch: cursorZ.ch })
    }
  }

  const editing = () => editorState === 'editing' || editorState === 'splitpane'
  // Menu iterm interactive handlers
  const iHandlers: {
    [name: string]: (
      editor: CodeMirror.Editor,
      name: string,
      state: string
    ) => any
  } = {
    bold: () =>
      editing() && codemirror && Helper.toggleBold(codemirror, textState),
    br: () =>
      editing() &&
      codemirror &&
      Helper.drawHorizontalRule(codemirror, textState),
    eraser: () => editing() && codemirror && Helper.cleanBlock(codemirror),
    heading: () => editing() && codemirror && Helper.toggleHeading(codemirror),
    keyboard: (editorArg: CodeMirror.Editor, name: string, state: string) => {
      if (codemirror)
        codemirror.setOption('keyMap', name.toLowerCase())
      setKeyboard(name)
    },
    italic: () =>
      editing() && codemirror && Helper.toggleItalic(codemirror, textState),
    link: () =>
      editing() && codemirror && Helper.drawLink(codemirror, textState),
    image: () =>
      editing() && codemirror && Helper.drawImage(codemirror, textState),
    table: () =>
      editing() && codemirror && Helper.drawTable(codemirror, textState),
    code: () => editing() && codemirror && Helper.toggleCodeBlock(codemirror),
    'ordered-list': () =>
      editing() &&
                        codemirror &&
                        Helper.toggleOrderedList(codemirror, textState),
    'unordered-list': () =>
      editing() &&
                          codemirror &&
                          Helper.toggleUnorderedList(codemirror, textState),
    quote: () =>
      editing() && codemirror && Helper.toggleQuote(codemirror, textState),
    strikethrough: () =>
      editing() &&
                       codemirror &&
                       Helper.toggleStrikethrough(codemirror, textState),
    preview: () => {
      if (editorState === EditorStates.preview)
        setEditorState(EditorStates.editing)
      else {
        savePosition()
        setEditorState(EditorStates.preview)
      }
    },

    fullscreen: () => {
      if (editorState === EditorStates.editing) savePosition()

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

  const defaultMenuCN: IProMarkdownMenuItem[] = [
    {
      name: 'bold',
      tip: (props.menuitemTips && props.menuitemTips['bold']) || '加黑'
    },
    {
      name: 'italic',
      tip: (props.menuitemTips && props.menuitemTips['italic']) || '斜体'
    },
    {
      name: 'strikethrough',
      tip: (props.menuitemTips && props.menuitemTips['strikethrough']) || '删除'
    },
    {
      name: 'heading',
      tip: (props.menuitemTips && props.menuitemTips['heading']) || '标题'
    },
    {
      name: '|',
      tip: ''
    },
    {
      name: 'quote',
      tip: (props.menuitemTips && props.menuitemTips['quote']) || '引用'
    },
    {
      name: 'code',
      tip: (props.menuitemTips && props.menuitemTips['code']) || '代码'
    },
    {
      name: 'unordered-list',
      tip:
        (props.menuitemTips && props.menuitemTips['unordered-list']) || '列表'
    },
    {
      name: 'ordered-list',
      tip:
        (props.menuitemTips && props.menuitemTips['ordered-list']) || '排序列表'
    },
    {
      name: '|',
      tip: ''
    },
    {
      name: 'link',
      tip: (props.menuitemTips && props.menuitemTips['link']) || '链接'
    },
    {
      name: 'image',
      tip: (props.menuitemTips && props.menuitemTips['image']) || '图片'
    },
    {
      name: 'table',
      tip: (props.menuitemTips && props.menuitemTips['table']) || '表格'
    },
    {
      name: 'br',
      tip: (props.menuitemTips && props.menuitemTips['br']) || '水平分割线'
    },
    {
      name: '|',
      tip: ''
    },
    {
      name: 'preview',
      tip: (props.menuitemTips && props.menuitemTips['preview']) || '预览'
    },
    {
      name: 'splitpane',
      tip:
        (props.menuitemTips && props.menuitemTips['splitpane']) ||
        '编辑 & 实时预览'
    },
    {
      name: 'fullscreen',
      tip: (props.menuitemTips && props.menuitemTips['fullscreen']) || '全屏'
    },
    {
      name: '|',
      tip: ''
    },
    {
      name: 'keyboard',
      tip: (props.menuitemTips && props.menuitemTips['keyboard']) || '键盘',
    },
    {
      name: 'help',
      tip: (props.menuitemTips && props.menuitemTips['help']) || '帮助',
      link: 'https://guides.github.com/features/mastering-markdown/'
    }
  ]

  const defaultMenuEN: IProMarkdownMenuItem[] = [
    {
      name: 'bold',
      tip: (props.menuitemTips && props.menuitemTips['bold']) || 'Toggle bold'
    },
    {
      name: 'italic',
      tip:
        (props.menuitemTips && props.menuitemTips['italic']) || 'Toggle italic'
    },
    {
      name: 'strikethrough',
      tip:
        (props.menuitemTips && props.menuitemTips['strikethrough']) ||
        'Toggle strikethrough'
    },
    {
      name: 'heading',
      tip:
        (props.menuitemTips && props.menuitemTips['heading']) ||
        'Toggle heading'
    },
    {
      name: '|',
      tip: ''
    },
    {
      name: 'quote',
      tip: (props.menuitemTips && props.menuitemTips['quote']) || 'Toggle quote'
    },
    {
      name: 'code',
      tip: (props.menuitemTips && props.menuitemTips['code']) || 'Toggle code'
    },
    {
      name: 'unordered-list',
      tip:
        (props.menuitemTips && props.menuitemTips['unordered-list']) ||
        'Toggle unordered list'
    },
    {
      name: 'ordered-list',
      tip:
        (props.menuitemTips && props.menuitemTips['ordered-list']) ||
        'Toggle ordered list'
    },
    {
      name: '|',
      tip: ''
    },
    {
      name: 'link',
      tip: (props.menuitemTips && props.menuitemTips['link']) || 'Link'
    },
    {
      name: 'image',
      tip: (props.menuitemTips && props.menuitemTips['image']) || 'Image'
    },
    {
      name: 'table',
      tip: (props.menuitemTips && props.menuitemTips['table']) || 'Table'
    },
    {
      name: 'br',
      tip: (props.menuitemTips && props.menuitemTips['br']) || 'Horizontal rule'
    },
    {
      name: '|',
      tip: ''
    },
    {
      name: 'preview',
      tip: (props.menuitemTips && props.menuitemTips['preview']) || 'Preview'
    },
    {
      name: 'splitpane',
      tip:
        (props.menuitemTips && props.menuitemTips['splitpane']) ||
        'Edit & live preview'
    },
    {
      name: 'fullscreen',
      tip:
        (props.menuitemTips && props.menuitemTips['fullscreen']) || 'Fullscreen'
    },
    {
      name: '|',
      tip: ''
    },
    {
      name: 'keyboard',
      tip: (props.menuitemTips && props.menuitemTips['keyboard']) || 'keyboard',
    },
    {
      name: 'help',
      tip: (props.menuitemTips && props.menuitemTips['help']) || 'Help',
      link: 'https://guides.github.com/features/mastering-markdown/'
    }
  ]

  const defaultMenu = locale === 'zh-CN' ? defaultMenuCN : defaultMenuEN

  const mode = props.mode || {
    name: 'yaml-frontmatter',
    base: 'gfm'
  }

  const menuItem =
    props.menu && props.menu.length > 0 ? props.menu : defaultMenu

  const atMounted = (cm: CodeMirror.Editor) => {
    setCodemirror(cm)
    cm.scrollTo(scroll.left, scroll.top)
    cm.getDoc().setCursor(cursor.line, cursor.ch)
    cm.focus()
    if (props.atMounted)
      props.atMounted(cm)
  }

  const atUnmounted = (cm: CodeMirror.Editor) => {
    const valueZ = cm.getDoc().getValue()
    setValue(valueZ)
    if (props.atUnmounted)
      props.atUnmounted(cm, valueZ)
  }

  const atChange = (
    cm: CodeMirror.Editor,
    change: CodeMirror.EditorChange,
    valueArg: string
  ) => {
    setValue(valueArg)
    if (props.atChange)
      props.atChange(cm, change, valueArg)
  }

  const onCursorActivity = (cm: CodeMirror.Editor) => {
    const textStateZ = Helper.getTextState(cm)

    setTextState(textStateZ)
  }

  const menu = props.hideMenu ? null : (
    <div className='promarkdown-menu'>
      {menuItem.map((item: IProMarkdownMenuItem, index: number) => {
        const { name, onClick } = item

        let state: IMenuItemState = 'enabled'

        switch (name) {
          case 'bold':
          case 'br':
          case 'code':
          case 'eraser':
          case 'heading':
          case 'image':
          case 'italic':
          case 'link':
          case 'ordered-list':
          case 'quote':
          case 'table':
          case 'strikethrough':
          case 'unordered-list':
            state = textState[name] ? 'selected' : 'enabled'
            break

          case 'fullscreen':
            state = fullScreen ? 'selected' : 'enabled'
            break

          default:
            state = editorState === name ? 'selected' : 'enabled'

        }

        let composedItem: IMenuItemProps = (
          props.helpLink ?
          {...item, link: props.helpLink, editor: codemirror!, state } :
          {...item, editor: codemirror!, state})

        if (name === 'keyboard')
          composedItem = {...composedItem, keyboard, locale: props.locale }

        return (
          <span key={index} className='promarkdown-icon-wrap'>
            {name === '|' ? (
              <MenuItem {...composedItem} />
            ) : (
              <MenuItem
                {...composedItem}
                onClick={onClick || iHandlers[name]}
              />
            )}
          </span>
        )
      })}
    </div>
  )

  const keyMap = keyboard.toLocaleLowerCase()

  const options = props.codemirrorOptions ? { ...props.codemirrorOptions, ...{
    value,
    mode,
    keyMap,
    lineNumbers:
        (typeof props.lineNumbers) === 'undefined' ? true : props.lineNumbers
  } } : {
    value,
    mode,
    keyMap,
    lineNumbers:
        (typeof props.lineNumbers) === 'undefined' ? true : props.lineNumbers
  }

  const editorProps = {
    options,
    locale,
    atMounted,
    atUnmounted,
    atChange,
    onCursorActivity
  }

  //  debugger

  const wrapperClassName =
    'promarkdown ' +
    (fullScreen ? 'promarkdown-fullscreen' : 'promarkdown-normal')

  let editor: React.ComponentElement<any, any>

  switch (editorState) {
    case EditorStates.preview: {
      if (props.renderPreview) editor = props.renderPreview({ value, frontmatter: mode.name })
      else {
        const source = value || ''

        const trans = props.markdownTransformer
          ? props.markdownTransformer
          : Helper.frontmatterTransformer

        const transed = trans(source)

        editor = <MarkdownPreview source={transed} />
      }
      return (
        <div className={wrapperClassName}>
          {menu}
          {editor}
        </div>
      )
    }

    case EditorStates.splitpane: {
      let preview: any

      if (props.renderPreview) preview = props.renderPreview({ value,  frontmatter: mode.name })
      else {
        const source = value || ''

        const trans = props.markdownTransformer
          ? props.markdownTransformer
          : Helper.frontmatterTransformer

        const transed = trans(source)

        preview = <MarkdownPreview className='markdown-body' source={transed} />
      }
      editor = <EditorCore {...editorProps} />
      return (
        <div className={wrapperClassName}>
          {menu}
          <div className='promarkdown-splitwrap'>
            <div className='promarkdown-splitpane-editor'>{editor}</div>
            <div className='promarkdown-splitpane-preview'>{preview}</div>
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
