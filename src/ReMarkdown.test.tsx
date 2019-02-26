import * as React from 'react'
import * as Enzyme from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'
import { render, shallow} from 'enzyme'

import * as Sinon from 'sinon'

import ReMarkdown from './ReMarkdown'

Enzyme.configure({ adapter: new Adapter() })

describe("ReMarkdown default", () => {

  const wrapper = render( <ReMarkdown className="my-remarkdown" /> )

  test("ReMarkdown root is mounted correctly", () => {

    expect(wrapper.is('.remarkdown')).toBeTruthy()

  })

  test("ReMarkdown rendered correctly", () => {

    expect(wrapper).toMatchSnapshot()

  })



  test("EditorCore is mounted correctly", () => {

    expect(wrapper.find('.remarkdown-codemirror').length).toBe(1)

  })

  test("Menu is mounted correctly", () => {

    expect(wrapper.find('.remarkdown-menu').length).toBe(1)

  })

  test("Default menu icons are rendered correctly", () => {

    expect(wrapper.find('.remarkdown-icon-wrap').length).toBe(21)

  })

})

describe("ReMarkdown custom menu", () => {

  const fakeClick = Sinon.fake()

  const fakeClickLink = Sinon.fake()

  const menu = [
    {
      name: 'bold',
      tip: 'Make it bold'
    },
    {
      name: 'italic',
      tip: 'italic',
      render: () => <div> Italic </div>,
      onClick: (editor: CodeMirror.Editor, name: string, state: string) =>
        console.log('italic clicked', editor, name, state)
    },
    {
      name: 'link',
      tip: 'Link',
      className: 'icon-link',
      render: () => <div> Link </div>,
      onClick: fakeClickLink
    },
    {
      name: 'mycommand',
      tip: 'myCommand',
      className: 'icon-my-command',
      render: () => <div> My comman </div>,
      onClick: (editor: CodeMirror.Editor, name: string, state: string) =>
        console.log('mycomman', editor, name, state)
    },
    {
      name: 'bold-spy',
      tip: 'Bold spy',
      className: 'icon-bold-spy',
      render: () => <div className="custom-rendered"> Italic </div>,
      onClick: fakeClick
    },

  ]

  const props = { menu }
  const wrapper = shallow( <ReMarkdown {...props} className="my-remarkdown" /> )

  test("Custom menu icons are rendered correctly", () => {

    expect(wrapper.find('.remarkdown-icon-wrap').length).toBe(5)

  })

  test("Custom menu icon with classname is rendered correctly", () => {

    expect(wrapper.find('.icon-my-command').length).toBe(1)

  })

  it("calls set formating on click on standard menu item with custom handler", () => {
    // create a spy function
    // pass spy function as our toggleForecast prop
    // find the first div and simulate a click event on it
    wrapper.find(".icon-link")
           .simulate("click")

    // ensure that our spy (toggleForecast) was called when click was simulated
    expect(fakeClickLink.calledOnce).toBe(true)
  })

  it("calls set formating on click on custom menu item", () => {
    // create a spy function
    // pass spy function as our toggleForecast prop
    // find the first div and simulate a click event on it
    wrapper.find(".icon-bold-spy")
           .simulate("click")

    // ensure that our spy (toggleForecast) was called when click was simulated
    expect(fakeClick.calledOnce).toBe(true)
  })

})
