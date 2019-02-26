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

const keyboards = ['Default', 'Vim', 'Emacs', 'Sublime']

const keymap = (props: { onClick: (name: string) => any,
                         keyboard: string,
                         tip: string,
                         locale: string }) => {

                           const [showDropdown, setShowDropdown] = React.useState(false)

                           const { onClick, tip, keyboard, locale } = props

                           const dropdownStyle: React.CSSProperties = {
                             position: 'absolute',
                             zIndex: 99,
                             display: showDropdown ? 'block' : 'none'
                          }

                           const displayDropdown = () => setShowDropdown(true)
                           const hideDropdown = () => setShowDropdown(false)
                           return (
                             <span
                               aria-haspopup='true'
                               onMouseOver={displayDropdown}
                               onMouseOut={hideDropdown}
                             >
                               <dfn title={tip}> <FontAwesomeIcon className='keyboard-icon' icon={faKeyboard} /></dfn>
                               <div className='keyboard-dropdown-wrapper' style={dropdownStyle}>
                                 <ul className='keyboard-dropdown' aria-label='submenu'>
                                   {
                                     keyboards.map((keyboardArg: string, i: number) => {

                                       let className: string

                                       if (i === 0)
                                         className = 'first-keyboard'
                                       else if (i === keyboards.length - 1)
                                         className = 'last-keyboard'
                                       else
                                         className = ''

                                       if (keyboard === keyboardArg)
                                         className += ' current-keyboard'

                                       const keyboardName = keyboardArg === 'Default' && locale === 'zh-CN' ? '默认' : keyboardArg

                                       const setKeyboard = () => onClick(keyboardArg)

                                       return <li key={i}  className={className}><a  onClick={setKeyboard}>{keyboardName}</a></li>
                                     })
                                   }
                                 </ul>
                               </div>
                             </span>
                           )
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

export interface IMenuItemRenderProps  {
  editor: CodeMirror.Editor
  name: string
  state: string
  tip: string
}

export interface IMenuItemProps {
  name: string
  editor: CodeMirror.Editor
  state?: IMenuItemState
  tip: string
  onClick?: (editor: CodeMirror.Editor, name: string, state: string) => void
  keyboard?: string
  locale?: string
  className?: string
  link?: string
  render?: (props: IMenuItemRenderProps) => React.ComponentElement<any, any>
}

const MenuItem = (props: IMenuItemProps) => {

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

    const composedClassName = 'menu-icon-keyboard menu-icon-enabled'

    const setKeymap = (nameArg: string) => onClick && onClick(editor, nameArg, state)

    return (
      <div className={composedClassName}>
      <dfn title={tip}>
        {keymap({onClick: setKeymap, keyboard: keyboard!, locale: locale!, tip })}
      </dfn>
      </div>
    )

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
