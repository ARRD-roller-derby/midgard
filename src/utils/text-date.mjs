import dayjs from 'dayjs'

export function textDate(event) {
  const isToday = dayjs(event.start).isSame(dayjs(), 'day')
  const isTomorrow = dayjs(event.start).isSame(dayjs().add(1, 'day'), 'day')
  const isAfterTomorrow = dayjs(event.start).isSame(
    dayjs().add(2, 'day'),
    'day'
  )

  if (isToday) return "aujourd'hui"
  if (isTomorrow) return 'demain'
  if (isAfterTomorrow) return 'après-demain'
  return `le ${dayjs(event.start).format('LLL')}`
}
