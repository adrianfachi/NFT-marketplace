import Decimal from 'decimal.js'

export type EthValue = string

export function parseEth(value: EthValue | number): Decimal {
  return new Decimal(value)
}

export function formatEth(value: EthValue | number | Decimal, options: { decimals?: number } = {}): EthValue {
  const decimals = options.decimals ?? 3
  return new Decimal(value).toDecimalPlaces(decimals).toFixed(decimals)
}

export function add(...values: EthValue[]): EthValue {
  return formatEth(values.reduce((total, value) => total.plus(value), new Decimal(0)))
}

export function sub(value: EthValue, amount: EthValue): EthValue {
  return formatEth(new Decimal(value).minus(amount))
}

export function mul(value: EthValue, quantity: number): EthValue {
  if (!Number.isInteger(quantity) || quantity < 0) throw new Error('A quantidade deve ser um inteiro não negativo.')
  return formatEth(new Decimal(value).times(quantity))
}

export function compare(left: EthValue, right: EthValue): number {
  return new Decimal(left).comparedTo(right)
}
