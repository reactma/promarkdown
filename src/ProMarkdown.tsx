import * as React from 'react'

import EditorCore from './EditorCore'

import MenuItem from './MenuItem'

import {
  IconDefinition
} from '@fortawesome/fontawesome-svg-core'

import { faEye,faExpand,faQuestion,faColumns   } from '@fortawesome/free-solid-svg-icons'
import { debug } from 'util';

type ProMarkdownMenuNames = 'preview' | 'fullscreen' | 'help' | 'splitpane' | '|'

interface IProMarkdownMenuItem {
  name: ProMarkdownMenuNames
  tip: string
  className?: string
  render?: ( props?: any ) => any
  onClick?: ( name: string, state: string ) => void
}

interface IProMarkdownProps {
  className?: string
  initialValue?: string
  mode?: 'yaml-frontmatter' | 'toml-frontmatter' | 'json-frontmatter'
  menu?: IProMarkdownMenuItem []
  width?: number | string
  height?: number | string
}

type EditorState = 'editing' | 'preview' | 'fullscreenEditing' | 'fullscreenPreview' | 'splitpane'

const transState = ( oldState : EditorState, command: string ) => {
  switch ( command ) {
    case 'preview': {

      switch ( oldState ) {
        case 'editing' :
          return 'preview'

        case 'fullscreenEditing' :
          return 'fullscreenPreview'

        case 'preview' :
          return 'editing'

        case 'fullscreenPreview' :
          return 'fullscreenEditing'

        case 'splitpane' :
          return oldState
      }
    }
    case 'fullscreen': {

      switch ( oldState ) {
        case 'editing' :
          return 'fullscreenEditing'

        case 'preview' :
          return 'fullscreenPreview'

        case 'fullscreenEditing' :
          return 'fullscreen'

        case 'fullscreenPreview' :
          return 'fullscreenEditing'

        case 'splitpane' :
          return oldState
      }
    }

    default:
      return oldState
  }
}

const ProMarkdown = ( props: IProMarkdownProps ) => {

  let codemirror: CodeMirror.Editor

  console.log('pro markdown pros', props)

  //debugger

  const [editorState, setEditorState ] = React.useState('editing')

  const [scroll, setScroll] = React.useState({ left: 0, top: 0 })

  const [cursor, setCursor] = React.useState({ line: 0, ch: 0 })

  const [value, setValue] = React.useState( props.initialValue || '' )

  const defaultMenu: IProMarkdownMenuItem [] = [
    {
      name: 'preview',
      tip: 'Preview',
      onClick : () => {
        setEditorState( transState( editorState as EditorState, 'preview' ) )
      }
    },
    {
      name: 'splitpane',
      tip: 'Edit & live preview'
    },
    {
      name: 'fullscreen',
      tip: 'Fullscreen',
      onClick : () => {
        console.log('fullscreen clicked')
        setEditorState( transState( editorState as EditorState, 'fullscreen' ) )
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


    const menuItem = props.menu && props.menu.length > 0 ?
                                                       props.menu :
                                                       defaultMenu


  const atMounted = ( cm : CodeMirror.Editor ) => {

    codemirror = cm
    //    console.log('cursor at mount', cursor)
    codemirror.scrollTo( scroll.left, scroll.top )
    codemirror.getDoc().setCursor( cursor.line, cursor.ch )
    cm.focus()
  }

  const atUnmounted = ( cm : CodeMirror.Editor ) => {
//    const pos = cm.getScrollInfo()
//    const cursor = cm.getDoc().getCursor()

    //    console.log('cursor at unmount', cursor)


//    setScroll( { left: pos.left, top: pos.top } )
//    setCursor( { line: cursor.line, ch: cursor.ch } )
    setValue( cm.getDoc().getValue() )

  }

  const atChange = ( editor: CodeMirror.Editor,
                     change: CodeMirror.EditorChange,
                     editorValue: string ) => {
//                       console.log( ' after change ', value )
                     }


  const menu = <div className="pro-markdown-menu"> {
    menuItem.map( ( item: IProMarkdownMenuItem, index: number ) => {

      return <span key={index} className="pro-markdown-icon-wrap"><MenuItem {...item} /> </span>

    } )
  }
  </div>

  const isFullScreen = editorState.startsWith('fullscreen')

  const defaultClassName = `pro-markdown ${isFullScreen ? 'pro-markdown-fullscreen' : 'pro-markdown-eidting'}`

  const className = props.className ? props.className + ' ' + defaultClassName : defaultClassName


  const editorProps = {

  options: {
    value,
    mode
  },
    atChange,
    atMounted,
    atUnmounted,
    width: isFullScreen ? "100%" : props.width || null,
    height: isFullScreen ? '98vh' : props.height || '60vh'
  }

  let editor : React.ComponentElement<any, any>

    let style = {}

    console.log( 'editorState', editorState )

    switch ( editorState ) {

      case 'preview':
      editor = <div> Preview </div>
      style = {
        minHeight: '60vh'
      }
      break

      default:

      editor = <EditorCore {...editorProps}/>
      break

    }


    return <div style={style} className={className}>
    {menu}
    {editor}
    </div>
}

export default ProMarkdown
