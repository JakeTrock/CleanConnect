export function tierConverter(tier) {
  if (tier.includes("0:")) return "0";
  if (tier.includes("1:")) return 1;
  else return 2;
}
export function reverseTierConverter(tier) {
  if (tier === 0) return "Tier 0: (INSERT DESCRIPTION)";
  if (tier === 1) return "Tier 1: (INSERT DESCRIPTION)";
  if (tier === 2) return "Tier 2: (INSERT DESCRIPTION)";
}
export function phoneConverter(number) {
  number = number.toString();
  return (
    number.substring(0, 3) +
    "." +
    number.substring(3, 6) +
    "." +
    number.substring(6, 10)
  );
}
export function reversePhoneConverter(number) {
  number = number.toString();
  return (
    number.substring(0, 3) + number.substring(4, 7) + number.substring(8, 12)
  );
}
