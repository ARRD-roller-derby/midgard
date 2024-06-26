/**
 *
 * @param query search query, Max words: 40, Max characters: 300
 * @returns  web: Array of web results, videos: Array of video results
 */
export async function webSearch(query) {
  const response = await fetch(
    `https://api.search.brave.com/res/v1/web/search?q=${query}&freshness=yes&count=20&country=fr&locale=fr-FR`,
    {
      headers: {
        'X-Subscription-Token': process.env.BRAVE_TOKEN_SEARCH,
      },
    }
  )

  const res = await response.json()

  const { web, videos } = res
  return { web, videos }
}
