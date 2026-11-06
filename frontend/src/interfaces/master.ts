export interface Region {
  id: string
  name: string
}

export interface Village {
  id: string
  name: string
  code: string
  district: string
  regionId: string
}

export type CounterpartyType = 'Penyedia' | 'UMKM' | 'BUMDes' | 'Penerima hibah' | 'Penyewa'

export interface Counterparty {
  id: string
  name: string
  type: CounterpartyType
  npwp?: string
  address: string
  email: string
  contact: string
  invited?: boolean
}

export interface RegionRule {
  directMax: number
  basis: string
}
