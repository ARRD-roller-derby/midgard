export function getResume(txt, length) {
  if (txt.length > length) {
    const words = txt.split(' ')
    let resume = ''
    let i = 0
    while (resume.length < length) {
      resume += words[i] + ' '
      i++
    }
    resume + '...'
    return resume
  }
  return txt
}
