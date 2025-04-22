import { isBeta, divisionDecimals } from '@/api/util'
export const NKey = isBeta ? '2-1' : '1-1'
export const NSymbol = 'NAI'
export const NDecimals = 4
export const NULSDecimals = 8
export const NDiffDeciamsl = NULSDecimals - NDecimals
export const FEE_PERKB = '100000'
export const Max_Deposit = '200000000000000'
export const Min_Deposit = '200000000000'

export const DEFAULT_FEE = divisionDecimals(FEE_PERKB, NDecimals)

export function calDecimalsAndSymbol(item) {
  const { chainId, assetId, symbol, decimals, decimal } = item
  const assetKey = chainId + '-' + assetId
  const isNULS = symbol == 'NULS' || assetKey === NKey
  const originDecimal = decimals || decimal
  const newDecimals = isNULS ? NDecimals : originDecimal
  return {
    decimals: newDecimals,
    symbol: isNULS ? NSymbol : symbol
  }
}
