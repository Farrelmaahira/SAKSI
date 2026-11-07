import { statusOrder } from '@/data/db'

export const signedOrLater = (s: string) => statusOrder.indexOf(s as never) >= statusOrder.indexOf('ditandatangani')
