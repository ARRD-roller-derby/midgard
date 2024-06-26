/**
 *
 * @param {Object} contentArray create by tiptap
 * @returns string, markdown for discord
 */
export function jsonToMd(contentArray) {
  let markdown = ''
  if (!contentArray) return markdown
  contentArray.forEach((content) => {
    if (content.type === 'text') {
      let txt = content.text || ''

      if (content.marks) {
        content.marks?.forEach((mark) => {
          if (mark.type === 'bold') txt = `**${txt.trim()}**`
          if (mark.type === 'italic') txt = `*${txt.trim()}*`
          if (mark.type === 'strike') txt = `~~${txt.trim()}~~`
          if (mark.type === 'underline') txt = `__${txt.trim()}__`
          if (mark.type === 'code') txt = `\`\`\`${txt.trim()}\`\`\``
          if (mark.type === 'link') {
            txt = `[${txt.trim()}](${mark.attrs?.level || ''})`
          }
        })
      }

      markdown += txt + ' '
    } else if (content.type === 'heading') {
      markdown += '\n'
      markdown += `${'#'.repeat(content.attrs?.level ?? 0)} ${
        content.content ? jsonToMd(content.content) : ''
      }\n`
    } else if (content.type === 'paragraph') {
      markdown += `${content.content ? jsonToMd(content.content) : ''}\n`
    } else if (content.type === 'bulletList') {
      content?.content?.forEach((listItem) => {
        markdown += `- ${listItem.content ? jsonToMd(listItem.content) : ''}\n`
      })
    } else if (content.type === 'quote') {
      markdown += `> ${content.content ? jsonToMd(content.content) : ''}\n`
    }

    if (content.content) {
      markdown += jsonToMd(content.content)
    }
  })

  const md = markdown.trim().split('\n')
  return md.filter((line, index) => md.indexOf(line) === index).join('\n')
}
