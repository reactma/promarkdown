import * as React from 'react'

import EditorCore from './EditorCore'

import MenuItem from './MenuItem'

import { IconDefinition } from '@fortawesome/fontawesome-svg-core'

import {
  faEye,
  faExpand,
  faQuestion,
  faColumns
} from '@fortawesome/free-solid-svg-icons'
import { debug } from 'util'

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
  width?: number | string
  height?: number | string
}

type EditorState =
  | 'editing'
  | 'preview'
  | 'fullscreenEditing'
  | 'fullscreenPreview'
  | 'splitpane'

const ProMarkdown = (props: IProMarkdownProps) => {
  let codemirror: CodeMirror.Editor

  console.log('pro markdown pros', props)

  //debugger

  const [editorState, setEditorState] = React.useState('editing')

  const [scroll, setScroll] = React.useState({ left: 0, top: 0 })

  const [cursor, setCursor] = React.useState({ line: 0, ch: 0 })

  const [value, setValue] = React.useState(props.initialValue || '')

  const savePosition = () => {
    if (codemirror) {
      const pos = codemirror.getScrollInfo()
      const cursor = codemirror.getDoc().getCursor()
      setScroll({ left: pos.left, top: pos.top })
      setCursor({ line: cursor.line, ch: cursor.ch })
      console.log('saving pos and cursor', pos, cursor)
    }
  }

  const transState = (oldState: EditorState, command: string) => {
    switch (command) {
      case 'preview': {
        switch (oldState) {
          case 'editing': // editing -> preview
            savePosition()
            return 'preview'

          case 'fullscreenEditing': // fullscreenEditing -> fulscreePreview
            savePosition()
            return 'fullscreenPreview'

          case 'preview': // preview -> editing
            return 'editing'

          case 'fullscreenPreview': // preview -> fullscreenPreview
            return 'fullscreenEditing'

          case 'splitpane': // preview -> splitpane
            return 'splitpane'
        }
      }
      case 'fullscreen': {
        switch (oldState) {
          case 'editing': // editing -> fullscrrenEditing
            savePosition()
            return 'fullscreenEditing'

          case 'preview': // preview -> fullscreenPreview
            return 'fullscreenPreview'

          case 'fullscreenEditing': // fullscreenEditing -> editing
            savePosition()
            return 'editing'

          case 'fullscreenPreview': // fullscreenPreview -> preview
            return 'preview'

          case 'splitpane': // splitpane -> fullscreen
            return 'splitpane'
        }
      }
      default:
        return oldState
    }
  }

  const defaultMenu: IProMarkdownMenuItem[] = [
    {
      name: 'preview',
      tip: 'Preview',
      onClick: () => {
        savePosition()
        setEditorState(transState(editorState as EditorState, 'preview'))
      }
    },
    {
      name: 'splitpane',
      tip: 'Edit & live preview'
    },
    {
      name: 'fullscreen',
      tip: 'Fullscreen',
      onClick: () => {
        console.log('fullscreen clicked')
        setEditorState(transState(editorState as EditorState, 'fullscreen'))
      }
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
    codemirror = cm
    //    console.log('cursor at mount', cursor)
    codemirror.scrollTo(scroll.left, scroll.top)
    codemirror.getDoc().setCursor(cursor.line, cursor.ch)
    cm.focus()
  }

  const atUnmounted = (cm: CodeMirror.Editor) => {
    setValue(cm.getDoc().getValue())
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

  const isFullScreen = editorState.startsWith('fullscreen')

  const defaultClassName = `pro-markdown ${
    isFullScreen ? 'pro-markdown-fullscreen' : 'pro-markdown-eidting'
    }`

  const className = props.className
    ? props.className + ' ' + defaultClassName
    : defaultClassName

  const editorProps = {
    options: {
      value,
      mode
    },
    atMounted,
    atUnmounted,
    width: isFullScreen ? '100%' : props.width || null,
    height: isFullScreen ? '98vh' : props.height || '60vh'
  }

  let editor: React.ComponentElement<any, any>

  let style = {}

  console.log('editorState', editorState)

  switch (editorState) {
    case 'preview':
      editor = <div> Preview </div>
      style = {
        minHeight: '60vh'
      }
      break

    default:
      editor = <EditorCore {...editorProps} />
      break
  }

  return (
    <div style={style} className={className}>
      {menu}
      {editor}
    </div>
  )
}

export default ProMarkdown
