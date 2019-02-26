import * as React from 'react'

import * as marked from 'marked'

import * as HtmlToReact from 'html-to-react'

const HtmlToReactParser = HtmlToReact.Parser
const htmlToReactParser = new HtmlToReactParser()

const defaultRenderer = new marked.Renderer()

defaultRenderer.listitem = (text: any) => {
  const className = text.includes('checkbox')
    ? `className="task-list-item"`
    : ``
  return `
          <li ${className}>
            ${text}
          </li>`
}

interface IMarkdownPreviewProps {
  source: string
  className?: string
  markedToHtml?: (source: string) => string
}

const MarkdownPreview = ({
  source,
  className,
  markedToHtml
}: IMarkdownPreviewProps) => {
  const html = markedToHtml
    ? markedToHtml(source)
    : marked(source, { renderer: defaultRenderer })

  const parsed = htmlToReactParser.parse(html)

  const composedClassName =
    (className ? className + ' ' : '') + 'promarkdown-preview'

  return <div className={composedClassName}> {parsed} </div>
}

export default MarkdownPreview
