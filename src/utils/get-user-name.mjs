export function getUserName(user) {
  return user?.nickname || user?.username || user?.globalName || 'Anonyme'
}
