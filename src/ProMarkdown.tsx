import * as React from 'react'

import EditorCore from './EditorCore'

import MenuItem from './MenuItem'

import transformer from './frontmatterTransformer'

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

export interface ITransMarked {
  markdown: string
  [extra: string] : any
}

interface IProMarkdownProps {
  className?: string
  initialValue?: string
  mode?: 'yaml-frontmatter' | 'toml-frontmatter' | 'json-frontmatter'
  menu?: IProMarkdownMenuItem[]
  width?: number | string
  height?: number | string
  transformer?: ( from: string ) => string
}

const EditorStates = {
  editing: 'editing',
  preview: 'preview',
  splitpane: 'splitpane'
}

const ProMarkdown = React.memo( (props: IProMarkdownProps) => {
  //debugger

  const [scroll, setScroll] = React.useState({ left: 0, top: 0 })

  const [cursor, setCursor] = React.useState({ line: 0, ch: 0 })

  const [value, setValue] = React.useState< string >(props.initialValue || '')

  const [codemirror, setCodemirror] = React.useState< CodeMirror.Editor | null >( null )

  // false - normal editing, true - fullscreen
  const [fullScreen, setFullScreen] = React.useState(false)

  // 'editing' / 'preview' / 'splitpane' only when fullscreen
  const [editorState, setEditorState ] = React.useState< string >('editing')

  let forLivePreview: string = ''

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
      if( editorState === EditorStates.preview )
        setEditorState(EditorStates.editing)
      else {
        savePosition()
        setEditorState(EditorStates.preview)
      }
    },

    fullscreen: () => {
      if( editorState === EditorStates.splitpane ) {
        savePosition()
        setEditorState(EditorStates.editing)
      }
      setFullScreen( !fullScreen )
    },

    splitpane: () => {
      if( fullScreen ) {
        savePosition()
        const newState = editorState === EditorStates.splitpane ? EditorStates.editing : EditorStates.splitpane
        setEditorState(newState)
      }
    }

  }

  const defaultMenu: IProMarkdownMenuItem [] = [
    {
      name: 'preview',
      tip: 'Preview',
      onClick: iHandlers.preview
    },
    {
      name: 'splitpane',
      tip: 'Edit & live preview',
      onClick: iHandlers.splitpane
    },
    {
      name: 'fullscreen',
      tip: 'Fullscreen',
      onClick : iHandlers.fullscreen
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

    setCodemirror( cm )
    //    console.log('cursor at mount', cursor)
    cm.scrollTo(scroll.left, scroll.top)
    cm.getDoc().setCursor(cursor.line, cursor.ch)
    cm.focus()

    forLivePreview = value

  }

  const atUnmounted = (cm: CodeMirror.Editor) => {
    setValue(cm.getDoc().getValue())
  }

  const atChange = (cm: CodeMirror.Editor, change: CodeMirror.EditorChange, value: string) => {

    setValue( value )

  }

  const menu = (
    <div className='pro-markdown-menu'>
      {' '}
      {menuItem.map((item: IProMarkdownMenuItem, index: number) => {
        return (
          <span key={index} className='pro-markdown-icon-wrap'>
            <MenuItem {...item} />{' '}
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
    width: fullScreen ? '100%' : props.width || null,
    height: fullScreen ? '98vh' : props.height || '60vh'
  }


  const wrapperClassName = 'pro-markdown ' + ( fullScreen ? 'pro-markdown-fullscreen' : 'pro-markdown-normal' )

  let editor : React.ComponentElement<any, any>

  let style = {}

  console.log('editorState', editorState)

  switch (editorState) {
    case EditorStates.preview: {

      const source = value || ''

      const trans = props.transformer ? props.transformer : transformer

      const transed = trans( source )

      editor = <MarkdownPreview source={ transed } />
      style = {
      minHeight: '60vh'
      }
      return <div style={style} className={wrapperClassName}>
      {menu}
      {editor}
      </div>
    }

    case EditorStates.splitpane: {

      const source = value || ''

      const trans = props.transformer ? props.transformer : transformer

      const transed = trans( source )

      console.log( transed )
      const preview = <MarkdownPreview source={ transed } />

      editor = <EditorCore {...editorProps} />

      return <div style={style} className={wrapperClassName}>
        {menu}
        <div className="pro-markdown-splitwrap">
          <div className="pro-markdown-splitpane-editor">
            {editor}
          </div>
          <div className="pro-markdown-splitpane-preview">
            {preview}
          </div>
          </div>
        </div>
    }

    default: {
      editor = <EditorCore {...editorProps} />
      return <div style={style} className={wrapperClassName}>
      {menu}
      {editor}
      </div>
    }
  }


} )

export default ProMarkdown
