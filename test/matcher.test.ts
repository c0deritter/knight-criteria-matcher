import 'mocha'
import { expect } from 'chai'
import { criteriaMatch } from '../src/DbQueryParameterMatcher'

describe('criteriaMatch', function() {
  it('should match an implicit = operator', function() {
    expect(criteriaMatch({ a: 'a' }, { a: 'a' })).to.be.true
    expect(criteriaMatch({ a: 'a' }, { a: 'b' })).to.be.false
    expect(criteriaMatch({ }, { a: 'a' })).to.be.false
  })

  it('should match an implicit = operator involving null', function() {
    expect(criteriaMatch({ a: null }, { a: null })).to.be.true
    expect(criteriaMatch({ a: null }, { a: 'NULL' })).to.be.true
    expect(criteriaMatch({ }, { a: null })).to.be.false
    expect(criteriaMatch({ }, { a: 'NULL' })).to.be.false
    expect(criteriaMatch({ a: 'a' }, { a: null })).to.be.false
    expect(criteriaMatch({ a: 'a' }, { a: 'NULL' })).to.be.false
  })

  it('should match an implicit = operator involving an array', function() {
    expect(criteriaMatch({ a: 'z' }, { a: ['x','y','z']})).to.be.true
    expect(criteriaMatch({ a: 'a' }, { a: ['x','y','z']})).to.be.false
    expect(criteriaMatch({ }, { a: ['x','y','z']})).to.be.false
  })

  it('should match with operator =', function() {
    expect(criteriaMatch({ a: 'a' }, { a: { operator: '=', value: 'a' }})).to.be.true
    expect(criteriaMatch({ a: 'a' }, { a: { operator: '=', value: 'b' }})).to.be.false
    expect(criteriaMatch({ }, { a: { operator: '=', value: 'b' }})).to.be.false
  })

  it('should match with operator >', function() {
    expect(criteriaMatch({ a: 5 }, { a: { operator: '>', value: '4' }})).to.be.true
    expect(criteriaMatch({ a: 5 }, { a: { operator: '>', value: '5' }})).to.be.false
    expect(criteriaMatch({ }, { a: { operator: '>', value: '5' }})).to.be.false
  })

  it('should match with operator >=', function() {
    expect(criteriaMatch({ a: 5 }, { a: { operator: '>=', value: '5' }})).to.be.true
    expect(criteriaMatch({ a: 5 }, { a: { operator: '>=', value: '6' }})).to.be.false
    expect(criteriaMatch({ }, { a: { operator: '>=', value: '6' }})).to.be.false
  })

  it('should match with operator <', function() {
    expect(criteriaMatch({ a: 5 }, { a: { operator: '<', value: '6' }})).to.be.true
    expect(criteriaMatch({ a: 5 }, { a: { operator: '<', value: '5' }})).to.be.false
    expect(criteriaMatch({ }, { a: { operator: '<', value: '5' }})).to.be.false
  })

  it('should match with operator <=', function() {
    expect(criteriaMatch({ a: 5 }, { a: { operator: '<=', value: '5' }})).to.be.true
    expect(criteriaMatch({ a: 5 }, { a: { operator: '<=', value: '4' }})).to.be.false
    expect(criteriaMatch({ }, { a: { operator: '<=', value: '4' }})).to.be.false
  })

  it('should match with operator <>', function() {
    expect(criteriaMatch({ a: 'a' }, { a: { operator: '<>', value: 'aa' }})).to.be.true
    expect(criteriaMatch({ a: 'a' }, { a: { operator: '<>', value: 'a' }})).to.be.false
    expect(criteriaMatch({ }, { a: { operator: '<>', value: 'a' }})).to.be.false
  })

  it('should match with operator !=', function() {
    expect(criteriaMatch({ a: 'a' }, { a: { operator: '!=', value: 'aa' }})).to.be.true
    expect(criteriaMatch({ a: 'a' }, { a: { operator: '!=', value: 'a' }})).to.be.false
    expect(criteriaMatch({ }, { a: { operator: '!=', value: 'a' }})).to.be.false
  })

  it('should match with operator IN', function() {
    expect(criteriaMatch({ a: 'a' }, { a: { operator: 'IN', value: ['a'] }})).to.be.true
    expect(criteriaMatch({ a: 'a' }, { a: { operator: 'IN', value: ['aa'] }})).to.be.false
    expect(criteriaMatch({ }, { a: { operator: 'IN', value: ['aa'] }})).to.be.false
  })

  it('should match with operator IS NULL', function() {
    expect(criteriaMatch({ a: null }, { a: { operator: 'IS', value: null }})).to.be.true
    expect(criteriaMatch({ a: null }, { a: { operator: 'IS', value: 'NULL' }})).to.be.true
    expect(criteriaMatch({  }, { a: { operator: 'IS', value: null }})).to.be.false
    expect(criteriaMatch({  }, { a: { operator: 'IS', value: 'NULL' }})).to.be.false
    expect(criteriaMatch({ a: 'a' }, { a: { operator: 'IS', value: null }})).to.be.false
    expect(criteriaMatch({ a: 'a' }, { a: { operator: 'IS', value: 'NULL' }})).to.be.false
  })

  it('should match with operator IS NOT NULL', function() {
    expect(criteriaMatch({ a: null }, { a: { operator: 'IS NOT', value: null }})).to.be.false
    expect(criteriaMatch({ a: null }, { a: { operator: 'IS NOT', value: 'NULL' }})).to.be.false
    expect(criteriaMatch({  }, { a: { operator: 'IS NOT', value: null }})).to.be.false
    expect(criteriaMatch({  }, { a: { operator: 'IS NOT', value: 'NULL' }})).to.be.false
    expect(criteriaMatch({ a: 'a' }, { a: { operator: 'IS NOT', value: null }})).to.be.true
    expect(criteriaMatch({ a: 'a' }, { a: { operator: 'IS NOT', value: 'NULL' }})).to.be.true
  })

  it('should match with operator LIKE', function() {
    expect(criteriaMatch({ a: 'a' }, { a: { operator: 'LIKE', value: 'a' }})).to.be.true
    expect(criteriaMatch({ a: 'ab' }, { a: { operator: 'LIKE', value: 'a' }})).to.be.false
    expect(criteriaMatch({ a: 'ab' }, { a: { operator: 'LIKE', value: 'a%' }})).to.be.true
    expect(criteriaMatch({ a: 'ab' }, { a: { operator: 'LIKE', value: '%a' }})).to.be.false
    expect(criteriaMatch({ a: 'ab' }, { a: { operator: 'LIKE', value: '%a%' }})).to.be.true
    expect(criteriaMatch({ a: 'ab' }, { a: { operator: 'LIKE', value: 'b%' }})).to.be.false
    expect(criteriaMatch({ a: 'ab' }, { a: { operator: 'LIKE', value: '%b' }})).to.be.true
    expect(criteriaMatch({ a: 'ab' }, { a: { operator: 'LIKE', value: '%b%' }})).to.be.true
    expect(criteriaMatch({ }, { a: { operator: 'LIKE', value: '%a%' }})).to.be.false
  })

  it.only('should accept multiple operator objects for one property', function() {
    expect(criteriaMatch({ a: 5 }, { a: [{ operator: '>', value: 3 }, { operator: '<', value: 6 }]})).to.be.true
    expect(criteriaMatch({ a: 1 }, { a: [{ operator: '>', value: 3 }, { operator: '<', value: 6 }]})).to.be.false
  })

  it('should match multiple connected criteria', function() {
    expect(criteriaMatch({ a: 'a', b: 1 }, { a: ['a', 'b'], b: 1 })).to.be.true
    expect(criteriaMatch({ a: 'b', b: 1 }, { a: ['a', 'b'], b: 1 })).to.be.true
    expect(criteriaMatch({ a: 'a', b: 2 }, { a: ['a', 'b'], b: 1 })).to.be.false
    expect(criteriaMatch({ a: 'b', b: 2 }, { a: ['a', 'b'], b: 1 })).to.be.false
  })

})