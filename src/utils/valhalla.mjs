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
      provider_id: userId,
    },
    body: JSON.stringify(body),
  })

  const { events } = await res.json()
  return events
}
