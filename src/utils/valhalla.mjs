/**
 *
 * @param {string} endpoint  The endpoint to call
 * @param {string} userId    The user idx
 * @param {object} body      The body to send
 * @returns {Promise<object>} The response from the API
 */
export async function valhalla(endpoint, userId, body) {
  const res = await fetch(process.env.VALHALLA_URL + '/api/' + endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + process.env.VALHALLA_TOKEN,
      "x-provider-id": userId,
    },
    body: JSON.stringify(body),
  })

  const resJson = await res.json()

  console.log(resJson, userId)
  const { events } = resJson
  // legacy compatibility
  if (!events) return resJson

  return events
}
