export function itemLimit(user) {
  let limit = null;
  if (user.tier === 0) limit = 1;
  if (user.tier === 1) limit = 10;
  if (user.tier === 2) limit = 100;
  return limit;
}

export function tagLimit(user) {
  let limit = null;
  if (user.tier === 0) limit = 1;
  if (user.tier === 1) limit = 10;
  if (user.tier === 2) limit = 100;
  return limit;
}
