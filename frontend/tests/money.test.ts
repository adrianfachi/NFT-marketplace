import { describe, expect, it } from 'vitest'
import { add, compare, formatEth, mul, parseEth, sub } from '@/lib/money'

describe('money utilities', () => {
  it('keeps decimal precision for additions', () => {
    expect(add('0.1', '0.2')).toBe('0.300')
  })

  it('rounds deterministically and supports quantities', () => {
    expect(mul('1.23456', 2)).toBe('2.469')
    expect(formatEth(parseEth('2.3456'), { decimals: 2 })).toBe('2.35')
  })

  it('compares and subtracts decimal values without floating point drift', () => {
    expect(compare('10.000', '9.999')).toBe(1)
    expect(sub('1.000', '0.1')).toBe('0.900')
  })
})
