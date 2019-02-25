import * as React from 'react'
import * as Enzyme from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'
import { render } from 'enzyme'

import EditorCore from './EditorCore'

Enzyme.configure({ adapter: new Adapter() })

describe("Editor core", () => {

  const wrapper = render( <EditorCore className="my-promarkdown" /> )

  test("Editor core is mounted correctly", () => {

    expect(wrapper.find('.pro-markdown-codemirror')).toBeDefined()
    expect(wrapper.find('.my-promarkdown')).toBeDefined()

  })

  test("Custom class name is effective", () => {

    expect(wrapper.find('.my-promarkdown')).toBeDefined()

  })

  test("CodeMirror is mounted correctly", () => {

    expect(wrapper.find('.CodeMirror')).toBeDefined()

  })

})
