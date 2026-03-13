import { sm4 } from 'sm-crypto'

const key = '0123456789abcdeffedcba9876543210' // 与服务器相同的密钥
const iv = '00000000000000000000000000000000'

export function encrypt() {

}

export function decrypt(text: string) {
  const decrypted = sm4.decrypt(text, key, {
    iv,
    mode: 'cbc',
    output: 'string',
  })

  return JSON.parse(decrypted)
}
