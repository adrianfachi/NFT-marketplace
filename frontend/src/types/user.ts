export type { UserProfile } from '../lib/api.types'

export interface WalletConfig {
  walletAddress: string
  walletType: string
  network: string
  secondaryWallet: string
}
