'use strict'

const app = require('./__support__/setup')

let guard

beforeAll(async (done) => {
  await app.setUp()

  done()
})

afterAll(async (done) => {
  await app.tearDown()

  done()
})

beforeEach(() => {
  const poolInterface = new (require('../lib/interface'))({})
  guard = new (require('../lib/guard'))(poolInterface)
})

describe('Transaction Guard', () => {
  it('should be an object', async () => {
    await expect(guard).toBeObject()
  })

  describe('validate', async () => {
    it('should be a function', async () => {
      await expect(guard.validate).toBeFunction()
    })
  })

  describe('getIds', async () => {
    it('should be a function', async () => {
      await expect(guard.getIds).toBeFunction()
    })

    it('should be ok', async () => {
      guard.transactions = [{ id: 1 }]
      guard.accept = [{ id: 2 }]
      guard.excess = [{ id: 3 }]
      guard.invalid = [{ id: 4 }]

      await expect(guard.getIds()).toEqual({
        transactions: [1],
        accept: [2],
        excess: [3],
        invalid: [4]
      })
    })

    it('should be ok using a type', async () => {
      guard.excess = [{ id: 3 }]

      await expect(guard.getIds('excess')).toEqual([3])
    })
  })

  describe('getTransactions', async () => {
    it('should be a function', async () => {
      await expect(guard.getTransactions).toBeFunction()
    })

    it('should be ok', async () => {
      guard.transactions = [{ id: 1 }]
      guard.accept = [{ id: 2 }]
      guard.excess = [{ id: 3 }]
      guard.invalid = [{ id: 4 }]

      await expect(guard.getTransactions()).toEqual({
        transactions: [{ id: 1 }],
        accept: [{ id: 2 }],
        excess: [{ id: 3 }],
        invalid: [{ id: 4 }]
      })
    })

    it('should be ok using a type', async () => {
      guard.excess = [{ id: 3 }]

      await expect(guard.getTransactions('excess')).toEqual([{ id: 3 }])
    })
  })

  describe('has', async () => {
    it('should be a function', async () => {
      await expect(guard.has).toBeFunction()
    })

    it('should be ok', async () => {
      guard.excess = [{ id: 1 }, { id: 2 }]

      await expect(guard.has('excess', 2)).toBeTruthy()
    })

    it('should not be ok', async () => {
      guard.excess = [{ id: 1 }, { id: 2 }]

      await expect(guard.has('excess', 1)).toBeFalsy()
    })
  })

  describe('hasAtLeast', async () => {
    it('should be a function', async () => {
      await expect(guard.hasAtLeast).toBeFunction()
    })

    it('should be ok', async () => {
      guard.excess = [{ id: 1 }, { id: 2 }]

      await expect(guard.hasAtLeast('excess', 2)).toBeTruthy()
    })

    it('should not be ok', async () => {
      guard.excess = [{ id: 1 }]

      await expect(guard.hasAtLeast('excess', 2)).toBeFalsy()
    })
  })

  describe('hasAny', async () => {
    it('should be a function', async () => {
      await expect(guard.hasAny).toBeFunction()
    })

    it('should be ok', async () => {
      guard.excess = [{ id: 1 }]

      await expect(guard.hasAny('excess')).toBeTruthy()
    })

    it('should not be ok', async () => {
      guard.excess = []

      await expect(guard.hasAny('excess')).toBeFalsy()
    })
  })

  describe('__transformTransactions', async () => {
    it('should be a function', async () => {
      expect(guard.__transformTransactions).toBeFunction()
    })
  })

  describe('__determineInvalidTransactions', () => {
    it('should be a function', () => {
      expect(guard.__determineInvalidTransactions).toBeFunction()
    })

    it('should be ok', () => {
      guard.__verifyTransaction = jest.fn(() => false)

      guard.transactions = [{ id: 1 }]

      expect(guard.invalid).toBeEmpty()

      guard.__determineInvalidTransactions()

      expect(guard.invalid).not.toBeEmpty()
    })

    it('should not be ok', () => {
      guard.__verifyTransaction = jest.fn(() => true)

      guard.transactions = [{ id: 1 }]

      expect(guard.invalid).toBeEmpty()

      guard.__determineInvalidTransactions()

      expect(guard.invalid).toBeEmpty()
    })
  })

  describe('__determineExcessTransactions', () => {
    it('should be a function', () => {
      expect(guard.__determineExcessTransactions).toBeFunction()
    })

    it('should be ok', async () => {
      guard.pool.determineExcessTransactions = jest.fn(() => ({
        accept: [1],
        excess: [2]
      }))

      expect(guard.accept).toBeEmpty()
      expect(guard.excess).toBeEmpty()

      await guard.__determineExcessTransactions()

      expect(guard.accept).not.toBeEmpty()
      expect(guard.excess).not.toBeEmpty()
    })
  })

  describe('__verifyTransaction', () => {
    it('should be a function', () => {
      expect(guard.__verifyTransaction).toBeFunction()
    })

    it('should be ok', () => {
      guard.__verifyTransaction = jest.fn(() => true)

      const verified = guard.__verifyTransaction({ id: 1 })

      expect(verified).toBeTruthy()
    })
  })

  describe('__reset', () => {
    it('should be a function', () => {
      expect(guard.__reset).toBeFunction()
    })

    it('should be ok', () => {
      guard.transactions = [{ id: 1 }]
      guard.accept = [{ id: 2 }]
      guard.excess = [{ id: 3 }]
      guard.invalid = [{ id: 4 }]

      expect(guard.transactions).not.toBeEmpty()
      expect(guard.accept).not.toBeEmpty()
      expect(guard.excess).not.toBeEmpty()
      expect(guard.invalid).not.toBeEmpty()

      guard.__reset()

      expect(guard.transactions).toBeEmpty()
      expect(guard.accept).toBeEmpty()
      expect(guard.excess).toBeEmpty()
      expect(guard.invalid).toBeEmpty()
    })
  })
})