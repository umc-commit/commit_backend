// bigintJson.js

// BigInt를 JSON.stringify 시 문자열로 변환
export function bigintReplacer(key, value) {
  return typeof value === 'bigint' ? value.toString() : value;
}

// JSON.parse 시 BigInt 문자열을 BigInt로 변환
export function bigintReviver(key, value) {
  // 숫자형 문자열 중 BigInt로 변환 가능한 값 필터링 (필요에 따라 key별 조건 추가 가능)
  if (typeof value === 'string' && /^[0-9]+$/.test(value)) {
    return BigInt(value);
  }
  return value;
}

// 편리한 stringify, parse 래퍼 함수
export function stringifyWithBigInt(obj) {
  return JSON.stringify(obj, bigintReplacer);
}

export function parseWithBigInt(jsonStr) {
  return JSON.parse(jsonStr, bigintReviver);
}