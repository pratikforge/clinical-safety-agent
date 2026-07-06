export function stableHash(value) {
  const json = JSON.stringify(value, Object.keys(value).sort());
  let hash = 0;
  for (let index = 0; index < json.length; index += 1) {
    hash = (hash << 5) - hash + json.charCodeAt(index);
    hash |= 0;
  }
  return String(hash);
}
