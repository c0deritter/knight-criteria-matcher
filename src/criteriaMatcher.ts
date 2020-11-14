import { Criteria } from 'mega-nice-criteria'

export function matchCriteria(obj: any, criteria: Criteria|undefined, customMatcher?: CustomMatcher): boolean {
  // console.log('Entering matchCriteria...')
  // console.log('obj', obj)
  // console.log('criteria', criteria)

  if (criteria === undefined) {
    // console.log('Criteria are undefined. No criteria do match. Returning true...')
    return true
  }

  let not = criteria['@not'] === true
  // console.log('not', not)

  for (let field in criteria) {
    // console.log('field', field)
    if (field == '@orderBy' || field == '@limit' || field == '@offset' || field == '@count' || field == '@not') {
      continue
    }

    let value = obj[field]
    let criterium = criteria[field]
    let operator: string|undefined = undefined
    // the value is assumed to be an array as soon as the correspoding criterium contains the @count property
    let criteriumContainsCount = criterium !== null && typeof criterium == 'object' && '@count' in criterium

    // console.log('value', value)
    // console.log('criterium', criterium)
    // console.log('operator', operator)
    // console.log('criteriumContainsCount', criteriumContainsCount)

    // look if there is a custom matcher for the given class/field combination
    if (customMatcher != undefined) {
      // console.log('Looking for custom matcher...')

      let className = obj.constructor.name
      let customMatchersForClass = customMatcher[className]
      let fieldMatcher = undefined

      if (customMatchersForClass != undefined) {
        for (let matcher of customMatchersForClass) {
          if (matcher.field == field) {
            fieldMatcher = matcher
            break
          }
        }  
      }
      
      // console.log('fieldMatcher', fieldMatcher)

      // if there is a field matcher and it does not match then return false. otherwise just continue to the
      // next criteria.
      if (fieldMatcher != undefined) {
        if (! fieldMatcher.match(obj, criterium)) {
          // console.log('Custom field matcher did not match. Returning false...')
          return not != false
        }
        else {
          // console.log('Custom field matcher did match. Continuing...')
          continue
        }
      }
    }

    // if the value is exactly undefined and the value is not supposed to be an array then we can return false
    // because an undefined value cannot be checked against anything valid.
    if (value === undefined && ! criteriumContainsCount) {
      // console.log('Value is undefined and not ought to be an array. Returning false...')
      return not != false
    }
    
    // if the value is an array go through the elements of that array one by one looking for at least one match
    if (value instanceof Array) {
      // console.log('Value is of type array')
      // if the array is empty we cannot match anything thus no criterium will match. Just return false in this case.
      // check if there is an @count property which we have to evaluate manually
      if (typeof criterium == 'object' && criterium !== null && '@count' in criterium) {
        if (! matchValue(value.length, criterium['@count'])) {
          return not != false
        }

        // clone criterium and remove @count
        criterium = { ...criterium }
        delete criterium['@count']

        // console.log('cloned criterium', criterium)

        // if there is nothing else to check apart from the array length continue
        if (Object.keys(criterium).length == 0) {
          // console.log('Criterium is empty. Continuing...')
          continue
        }
      }

      // if there was an @count and we are still here that means that the length was correct.
      // now check if there is at least one element that matches.
      let atLeastOneElementMatched = false

      for (let element of value) {
        if (matchCriteria(element, criterium)) {
          atLeastOneElementMatched = true
          break
        }
      }

      // console.log('atLeastOneElementMatched', atLeastOneElementMatched)

      // if not one element matched we can return false
      if (! atLeastOneElementMatched) {
        return not != false
      }
      else {
        continue
      }
    }
    // if the value should have been an array but it is not we return false if the wished length was not 0
    else if (criteriumContainsCount) {
      if (criterium['@count'] !== 0) {
        return not != false
      }
      else {
        continue
      }
    }

    // if the criterium is an object then we assume it is one that has an operator and a value property and we
    // set the corresponding variables accordingly
    if (typeof criterium == 'object' && criterium !== null && typeof criterium.operator == 'string' && criterium.value !== undefined) {
      // console.log('Extracting the operator and the criterium from the given criteria object...')
      operator = (<string>criterium.operator).toUpperCase()
      criterium = criterium.value

      // console.log('operator', operator)
      // console.log('criterium', criterium)
    }

    // support a written NULL instead of the JavaScript null
    if (typeof criterium == 'string' && criterium.toUpperCase() == 'NULL') {
      // console.log('The given criterium is NULL. Convert it to JavaScript null...')
      criterium = null
      // console.log('criterium', criterium)
    }

    // if the criterium is an array we assume that it is an array consisting of single values or objects
    // that have the operator and value property
    if (criterium instanceof Array) {
      // console.log('Criterium is of type array')

      // if the criterium is an array it might be that it consists of criterium objects
      let consistsOfCriteriumObjects = false
      for (let criteriumObj of criterium) {
        if (typeof criteriumObj == 'object' && criteriumObj !== null && typeof criteriumObj.operator == 'string' && criteriumObj.value !== undefined) {
          consistsOfCriteriumObjects = true
          // console.log('Evaluating criterum object', criterium)

          if (! matchValue(value, criteriumObj.value, criteriumObj.operator)) {
            // console.log('Criterium did not match. Returning false...')
            return not != false
          }
        }
        else {
          // if the first element was not a criterium object then we just stop the loop and assume
          // that the array is an array of values designed to be used with the IN operator
          // console.log('Criterium array is to be used with IN operator')
          break
        }
      }

      // console.log('consistsOfCriteriumObjects', consistsOfCriteriumObjects)

      if (! consistsOfCriteriumObjects) {
        if (! matchValue(value, criterium)) {
          // console.log('Criterium did not match. Returning false...')
          return not != false
        }
      }
    }
    // if the value is an object we just go into the recursion
    else if (typeof value == 'object' && value !== null && typeof criterium == 'object' && criterium !== null) {
      // console.log('Value is an object. Entering recursion...')

      if (! matchCriteria(value, criterium)) {
        // console.log('Leaving recursion. Object did not match the criteria. Returning false...')
        return not != false
      }
      else {
        // console.log('Leaving recursion. Object did match the criteria. Continuing...')
        continue
      }
    }
    else if (! matchValue(value, criterium, operator)) {
      return not != false
    }
  }

  // console.log('Iterated through all criteria without returning false. Returning true...')
  return not != true
}

export function matchValue(value: any, criterium: any, operator?: string): boolean {
  // console.log('Entering matchValue...')
  // console.log('matchValue > value', value)
  // console.log('matchValue > criterium', criterium)
  // console.log('matchValue > operator', operator)

  if (criterium instanceof Array && operator == undefined) {
    operator = 'IN'
  }

  if (operator == undefined || operator == '=') {
    return value === criterium
  }

  switch (operator) {
    case '>':
      return value > criterium

    case '>=':
      return value >= criterium

    case '<':
      return value < criterium

    case '<=':
      return value <= criterium

    case '<>':
    case '!=':
      return value !== criterium

    case 'IN':
      return criterium instanceof Array && criterium.indexOf(value) > -1

    case 'IS':
      return value === null

    case 'IS NOT':
      return value !== null

    case 'LIKE':
      if (typeof criterium == 'string' && typeof value == 'string') {
        let regex = '^' + criterium.toLowerCase().replace(/%/g, '.*') + '$'
        return value.search(regex) > -1
      }
      break

    case 'ILIKE':
      if (typeof criterium == 'string' && typeof value == 'string') {
        let regex = '^' + criterium.toLowerCase().replace(/%/g, '.*') + '$'
        return value.toLowerCase().search(regex) == -1
      }
      break
  }

  return false
}

export interface CustomMatcher {
  [className: string]: {
      field: string,
      match: (obj: any, criterium: any) => boolean
    }[]
}