import * as React from 'react'
import * as CodeMirror from 'codemirror'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import {
  faBold,
  faCode,
  faColumns,
  faEraser,
  faExpandArrowsAlt,
  faEye,
  faHeading,
  faImage,
  faItalic,
  faKeyboard,
  faLink,
  faListUl,
  faListOl,
  faMinus,
  faQuestion,
  faQuoteRight,
  faStrikethrough,
  faTable
} from '@fortawesome/free-solid-svg-icons'


const keymap = ( props : { onClick: ( name: string ) => any,
                           keymap: string,
                           locale: string } ) => {

                             const { onClick, keymap, locale } = props
                             const defaultKeymap = locale === 'zh-CN' ? '默认' : 'Default'
                             const setDefault = () => onClick(defaultKeymap)

  const setVim = () => onClick('vim')
  const setEmacs = () => onClick('emacs')
  const setSublime = () => onClick('sublime')


                             return     <>
                               <ul>
                                 <li>
                               <a href="#" aria-haspopup="true"><FontAwesomeIcon className="keyboard-icon" icon={faKeyboard} />{keymap}</a>
    <ul className="dropdown" aria-label="submenu">
      <li><a onClick={setDefault}>{defaultKeymap}</a></li>
      <li><a onClick={setVim}>vim</a></li>
      <li><a onClick={setEmacs}>emacs</a></li>
      <li><a onClick={setSublime}>sublime</a></li>
    </ul>
                                 </li>
                               </ul>
  </>

}

export type IMenuItemState = 'enabled' | 'disabled' | 'selected'

const menuNameToIconDefinition: any = {
  bold: faBold,
  quote: faQuoteRight,
  heading: faHeading,
  br: faMinus,
  eraser: faEraser,
  link: faLink,
  image: faImage,
  'unordered-list': faListUl,
  'ordered-list': faListOl,
  strikethrough: faStrikethrough,
  italic: faItalic,
  preview: faEye,
  fullscreen: faExpandArrowsAlt,
  help: faQuestion,
  splitpane: faColumns,
  table: faTable,
  code: faCode
}

export interface IMenuItemProps {
  name: string
  editor: CodeMirror.Editor
  state?: IMenuItemState
  tip: string
  onClick?: (editor: CodeMirror.Editor, name: string, state: string) => void
  keyboard?: string
  className?: string
  link?: string
  render?: (props: {
    editor: CodeMirror.Editor
    name: string
    state: string
    tip: string
  }) => React.ComponentElement<any, any>
}

const MenuItem = (props: IMenuItemProps & { keyboard: string, locale: string } ) => {

  const { name, editor, state = 'enabled', tip, onClick, render, className , link, keyboard, locale } = props

  const onClickHandler = () =>
    onClick && onClick(editor, name, state || 'enabled')

  if (render) {
    const composedClassName = 'menu-icon ' + className
    return (
      <span className={composedClassName} onClick={onClickHandler}>
        {render({
          editor,
          name,
          state,
          tip
        })}
      </span>
    )
  } else if (name === '|')
    return <i className='separator'> | </i>
  else if (name === 'keyboard') {

    const composedClassName = 'menu-icon-keyboard'

    const setKeymap = (name: string) => onClick( editor, keyboard, state )

    return <div className={composedClassName} >
      <dfn title={tip}>
        { keymap( { onClick: setKeymap, keyboard, locale } ) }
      </dfn>
    </div>

  } else {
    const faIcon = menuNameToIconDefinition[name]

    const stateClassName =
      state === 'selected'
      ? 'menu-icon-selected'
      : state === 'disabled'
      ? 'menu-icon-disabled'
      : 'menu-icon-enabled'

    const composedClassName = 'menu-icon ' + stateClassName

    if (name === 'help')
      return faIcon ? (
        <a href={link} target='_blank'>
          <span className={composedClassName} >
            <dfn title={tip}>
              <FontAwesomeIcon icon={faIcon} />{' '}
            </dfn>
          </span>
        </a>
      ) : null

    else
      return faIcon ? (
        <span className={composedClassName} onClick={onClickHandler}>
          <dfn title={tip}>
            <FontAwesomeIcon icon={faIcon} />{' '}
          </dfn>
        </span>
      ) : null
  }
}

export default MenuItem
