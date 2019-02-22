import * as React from 'react'

import EditorCore from './EditorCore'

import MenuItem from './MenuItem'

import markdownTransformer from './frontmatterTransformer'

import { debug } from 'util'

import MarkdownPreview from './MarkdownPreview'

type ProMarkdownMenuNames =
  | 'preview'
  | 'fullscreen'
  | 'help'
  | 'splitpane'
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
      console.log('saving pos and cursor', pos, cursor)
    }
  }

  // Menu iterm interactive handlers
  const iHandlers = {
    preview: () => {
      if (editorState === EditorStates.preview)
        setEditorState(EditorStates.editing)
      else {
        savePosition()
        setEditorState(EditorStates.preview)
      }
    },

    fullscreen: () => {
      console.log('before', fullScreen)
      if (editorState === EditorStates.editing) {
        savePosition()
      }

      if (editorState === EditorStates.splitpane) {
        savePosition()
        setEditorState(EditorStates.editing)
      }

      setFullScreen(!fullScreen)
      console.log('set to', !fullScreen)
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
    //    console.log('cursor at mount', cursor)
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

  const menu = (
    <div className='pro-markdown-menu'>
      {menuItem.map((item: IProMarkdownMenuItem, index: number) => {
        const { name } = item

        const state =
          name === 'fullscreen'
            ? fullScreen
              ? 'selected'
              : 'enabled'
            : editorState === name
              ? 'selected'
              : 'enabled'

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
    atChange
  }

  const wrapperClassName =
    'pro-markdown ' +
    (fullScreen ? 'pro-markdown-fullscreen' : 'pro-markdown-normal')

  let editor: React.ComponentElement<any, any>

  console.log('editorState', editorState)

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
