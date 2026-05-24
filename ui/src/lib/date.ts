const zhCnDateFormatter = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export function formatPublishedDate(timestamp?: number | null): string {
  if (!timestamp) {
    return ''
  }

  return zhCnDateFormatter.format(new Date(timestamp))
}
