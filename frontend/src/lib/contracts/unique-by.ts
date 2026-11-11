/* Drops repeated items that share a key (the first stays in place, the last one's data wins). */
export const uniqueBy = <T>(list: T[], key: (item: T) => string | number): T[] => [...new Map(list.map((x) => [key(x), x])).values()]
