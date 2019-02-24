import * as helpers from './helpers'

describe('Frontmatter transformer in helpers module', () => {
  const value = `

---
name: jeff
gender: male
---
# h1

## h2
---
frontmatterInise: true
---
`
  const transformed = helpers.frontmatterTransformer(value)

  test('front matter with leading spaces is trimed off', () => {
    expect(
      transformed.startsWith(`
   
---
name: jeff
gender: male
---`)
    ).toBeFalsy()

    expect(
      transformed.includes(`
---
name: jeff
gender: male
---`)
    ).toBeFalsy()
  })

  test('text with frontmatter pattern after frontmatter remains in result', () => {
    expect(
      transformed.includes(`---
frontmatterInise: true
---`)
    ).toBeTruthy()
  })

  test('front matters in markdown not starts with frontmatter remains in result', () => {
    const value = `
abde
---
name: jeff
gender: male
---
# h1

## h2
---
frontmatterInise: true
---
`
    const transformed = helpers.frontmatterTransformer(value)

    expect(
      transformed.includes(`
---
name: jeff
gender: male
---`)
    ).toBeTruthy()
  })
})
