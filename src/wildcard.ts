export function isWildcardPattern(pattern: string): boolean {
  return pattern === '*' || pattern.endsWith(':*')
}

export function matchesWildcard(pattern: string, eventName: string): boolean {
  if (pattern === '*') {
    return true
  }

  if (!pattern.endsWith(':*')) {
    return pattern === eventName
  }

  const prefix = pattern.slice(0, -1)
  return eventName.startsWith(prefix)
}
