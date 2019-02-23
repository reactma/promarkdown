import * as CodeMirror from 'codemirror'

// Get text state at given position

interface ITextState {
  [tag: string]: boolean
}

const getTextState = (editor: CodeMirror.Editor, posArg?: CodeMirror.Position) => {

  const cm = editor.getDoc()
  const pos = posArg || cm.getCursor('start')

  const stat = editor.getTokenAt(pos)

  if(!stat.type) return {}

  const types = stat.type.split(' ')

  let ret: ITextState  = {}
  let data: string
  let text: string

  for(let i = 0; i < types.length; i++) {
	data = types[i]
	if(data === 'strong') {
	  ret.bold = true
	} else if(data === 'variable-2') {
	  text = cm.getLine(pos.line)
	  if(/^\s*\d+\.\s/.test(text)) {
		ret['ordered-list'] = true
	  } else {
		ret['unordered-list'] = true
	  }
	} else if(data === 'atom') {
	  ret.quote = true
	} else if(data === 'em') {
	  ret.italic = true
	} else if(data === 'quote') {
	  ret.quote = true
	} else if(data === 'strikethrough') {
	  ret.strikethrough = true
	} else if(data === 'comment') {
	  ret.code = true
	} else if(data === 'link') {
	  ret.link = true
	} else if(data === 'tag') {
	  ret.image = true
	} else if(data.match(/^header(\-[1-6])?$/)) {
	  ret[data.replace('header', 'heading')] = true
	}
  }
  return ret
}

export { getTextState }
