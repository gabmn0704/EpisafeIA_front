import { passwordStrength } from './passwordStrength'

describe('passwordStrength', () => {
  it('scores weak and strong passwords', () => {
    expect(passwordStrength('abc').score).toBe(0)
    expect(passwordStrength('Demo1234').score).toBe(3)
    expect(passwordStrength('Demo1234!xyz').score).toBe(4)
  })
})
