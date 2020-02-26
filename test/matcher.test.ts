import 'mocha'
import { expect } from 'chai'
import { matchCriteria } from '../src/matcher'

describe('matchCriteria', function() {
  it('should match an implicit = operator', function() {
    expect(matchCriteria({ a: 'a' }, { a: 'a' }, ['a'])).to.be.true
    expect(matchCriteria({ a: 'a' }, { a: 'b' }, ['a'])).to.be.false
    expect(matchCriteria({ }, { a: 'a' }, ['a'])).to.be.false
  })

  it('should match an implicit = operator involving null', function() {
    expect(matchCriteria({ a: null }, { a: null }, ['a'])).to.be.true
    expect(matchCriteria({ a: null }, { a: 'NULL' }, ['a'])).to.be.true
    expect(matchCriteria({ }, { a: null }, ['a'])).to.be.false
    expect(matchCriteria({ }, { a: 'NULL' }, ['a'])).to.be.false
    expect(matchCriteria({ a: 'a' }, { a: null }, ['a'])).to.be.false
    expect(matchCriteria({ a: 'a' }, { a: 'NULL' }, ['a'])).to.be.false
  })

  it('should match an implicit = operator involving an array', function() {
    expect(matchCriteria({ a: 'z' }, { a: ['x','y','z']}, ['a'])).to.be.true
    expect(matchCriteria({ a: 'a' }, { a: ['x','y','z']}, ['a'])).to.be.false
    expect(matchCriteria({ }, { a: ['x','y','z']}, ['a'])).to.be.false
  })

  it('should match with operator =', function() {
    expect(matchCriteria({ a: 'a' }, { a: { operator: '=', value: 'a' }}, ['a'])).to.be.true
    expect(matchCriteria({ a: 'a' }, { a: { operator: '=', value: 'b' }}, ['a'])).to.be.false
    expect(matchCriteria({ }, { a: { operator: '=', value: 'b' }}, ['a'])).to.be.false
  })

  it('should match with operator >', function() {
    expect(matchCriteria({ a: 5 }, { a: { operator: '>', value: '4' }}, ['a'])).to.be.true
    expect(matchCriteria({ a: 5 }, { a: { operator: '>', value: '5' }}, ['a'])).to.be.false
    expect(matchCriteria({ }, { a: { operator: '>', value: '5' }}, ['a'])).to.be.false
  })

  it('should match with operator >=', function() {
    expect(matchCriteria({ a: 5 }, { a: { operator: '>=', value: '5' }}, ['a'])).to.be.true
    expect(matchCriteria({ a: 5 }, { a: { operator: '>=', value: '6' }}, ['a'])).to.be.false
    expect(matchCriteria({ }, { a: { operator: '>=', value: '6' }}, ['a'])).to.be.false
  })

  it('should match with operator <', function() {
    expect(matchCriteria({ a: 5 }, { a: { operator: '<', value: '6' }}, ['a'])).to.be.true
    expect(matchCriteria({ a: 5 }, { a: { operator: '<', value: '5' }}, ['a'])).to.be.false
    expect(matchCriteria({ }, { a: { operator: '<', value: '5' }}, ['a'])).to.be.false
  })

  it('should match with operator <=', function() {
    expect(matchCriteria({ a: 5 }, { a: { operator: '<=', value: '5' }}, ['a'])).to.be.true
    expect(matchCriteria({ a: 5 }, { a: { operator: '<=', value: '4' }}, ['a'])).to.be.false
    expect(matchCriteria({ }, { a: { operator: '<=', value: '4' }}, ['a'])).to.be.false
  })

  it('should match with operator <>', function() {
    expect(matchCriteria({ a: 'a' }, { a: { operator: '<>', value: 'aa' }}, ['a'])).to.be.true
    expect(matchCriteria({ a: 'a' }, { a: { operator: '<>', value: 'a' }}, ['a'])).to.be.false
    expect(matchCriteria({ }, { a: { operator: '<>', value: 'a' }}, ['a'])).to.be.false
  })

  it('should match with operator !=', function() {
    expect(matchCriteria({ a: 'a' }, { a: { operator: '!=', value: 'aa' }}, ['a'])).to.be.true
    expect(matchCriteria({ a: 'a' }, { a: { operator: '!=', value: 'a' }}, ['a'])).to.be.false
    expect(matchCriteria({ }, { a: { operator: '!=', value: 'a' }}, ['a'])).to.be.false
  })

  it('should match with operator IN', function() {
    expect(matchCriteria({ a: 'a' }, { a: { operator: 'IN', value: ['a'] }}, ['a'])).to.be.true
    expect(matchCriteria({ a: 'a' }, { a: { operator: 'IN', value: ['aa'] }}, ['a'])).to.be.false
    expect(matchCriteria({ }, { a: { operator: 'IN', value: ['aa'] }}, ['a'])).to.be.false
  })

  it('should match with operator IS NULL', function() {
    expect(matchCriteria({ a: null }, { a: { operator: 'IS', value: null }}, ['a'])).to.be.true
    expect(matchCriteria({ a: null }, { a: { operator: 'IS', value: 'NULL' }}, ['a'])).to.be.true
    expect(matchCriteria({  }, { a: { operator: 'IS', value: null }}, ['a'])).to.be.false
    expect(matchCriteria({  }, { a: { operator: 'IS', value: 'NULL' }}, ['a'])).to.be.false
    expect(matchCriteria({ a: 'a' }, { a: { operator: 'IS', value: null }}, ['a'])).to.be.false
    expect(matchCriteria({ a: 'a' }, { a: { operator: 'IS', value: 'NULL' }}, ['a'])).to.be.false
  })

  it('should match with operator IS NOT NULL', function() {
    expect(matchCriteria({ a: null }, { a: { operator: 'IS NOT', value: null }}, ['a'])).to.be.false
    expect(matchCriteria({ a: null }, { a: { operator: 'IS NOT', value: 'NULL' }}, ['a'])).to.be.false
    expect(matchCriteria({  }, { a: { operator: 'IS NOT', value: null }}, ['a'])).to.be.false
    expect(matchCriteria({  }, { a: { operator: 'IS NOT', value: 'NULL' }}, ['a'])).to.be.false
    expect(matchCriteria({ a: 'a' }, { a: { operator: 'IS NOT', value: null }}, ['a'])).to.be.true
    expect(matchCriteria({ a: 'a' }, { a: { operator: 'IS NOT', value: 'NULL' }}, ['a'])).to.be.true
  })

  it('should match with operator LIKE', function() {
    expect(matchCriteria({ a: 'a' }, { a: { operator: 'LIKE', value: 'a' }}, ['a'])).to.be.true
    expect(matchCriteria({ a: 'ab' }, { a: { operator: 'LIKE', value: 'a' }}, ['a'])).to.be.false
    expect(matchCriteria({ a: 'ab' }, { a: { operator: 'LIKE', value: 'a%' }}, ['a'])).to.be.true
    expect(matchCriteria({ a: 'ab' }, { a: { operator: 'LIKE', value: '%a' }}, ['a'])).to.be.false
    expect(matchCriteria({ a: 'ab' }, { a: { operator: 'LIKE', value: '%a%' }}, ['a'])).to.be.true
    expect(matchCriteria({ a: 'ab' }, { a: { operator: 'LIKE', value: 'b%' }}, ['a'])).to.be.false
    expect(matchCriteria({ a: 'ab' }, { a: { operator: 'LIKE', value: '%b' }}, ['a'])).to.be.true
    expect(matchCriteria({ a: 'ab' }, { a: { operator: 'LIKE', value: '%b%' }}, ['a'])).to.be.true
    expect(matchCriteria({ }, { a: { operator: 'LIKE', value: '%a%' }}, ['a'])).to.be.false
  })

  it('should accept multiple operator objects for one property', function() {
    expect(matchCriteria({ a: 5 }, { a: [{ operator: '>', value: 3 }, { operator: '<', value: 6 }]}, ['a'])).to.be.true
    expect(matchCriteria({ a: 1 }, { a: [{ operator: '>', value: 3 }, { operator: '<', value: 6 }]}, ['a'])).to.be.false
  })

  it('should match multiple connected criteria', function() {
    expect(matchCriteria({ a: 'a', b: 1 }, { a: ['a', 'b'], b: 1 }, ['a', 'b'])).to.be.true
    expect(matchCriteria({ a: 'b', b: 1 }, { a: ['a', 'b'], b: 1 }, ['a', 'b'])).to.be.true
    expect(matchCriteria({ a: 'a', b: 2 }, { a: ['a', 'b'], b: 1 }, ['a', 'b'])).to.be.false
    expect(matchCriteria({ a: 'b', b: 2 }, { a: ['a', 'b'], b: 1 }, ['a', 'b'])).to.be.false
  })
})