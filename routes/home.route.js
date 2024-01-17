module.exports = {
  method: 'GET',
  path: '/{any*}',
  handler: async (_req, h) => {
    return h.response({message: "alive"}).type('application/json')
  }
}
