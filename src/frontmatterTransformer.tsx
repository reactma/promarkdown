const frontmatterTransformer = ( original: string ) => {
  const trimed = original.trim()

  if( trimed.startsWith('---') ) {
    const reg = /---([\s\S]*)---/
    return trimed.replace(reg, '')
  } else
    return original
}

export default frontmatterTransformer
