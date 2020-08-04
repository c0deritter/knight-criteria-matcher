import { DbCriteria } from 'mega-nice-db-query-parameter'

export function matchCriteria(obj: any, criteria: DbCriteria|undefined, customMatcher?: CustomMatcher): boolean {
  if (criteria == undefined) {
    return true
  }

  for (let field in criteria) {
    if (field == 'orderBy' || field == 'limit' || field == 'offset' || field == 'arrayLength') {
      continue
    }

    let value = obj[field]
    let criterium = criteria[field]
    let operator: string|undefined = undefined

    if (value == undefined && criterium !== null && typeof criterium == 'object' && 'arrayLength' in criterium) {
      return true
    }

    if (customMatcher != undefined) {
      let className: string
      
      if (obj.className != undefined) {  
        className = obj.className
      }
      else {
        className = obj.constructor.name
      }
      
      let customMatcherForClass = customMatcher[className]
      
      let fieldMatcher = undefined
      for (let matcher of customMatcherForClass) {
        if (matcher.field == field) {
          fieldMatcher = matcher
          break
        }
      }

      if (fieldMatcher != undefined) {
        return fieldMatcher.match(obj, criterium)
      }
    }

    if (value === undefined) {
      return false
    }

    if (value instanceof Array) {
      let arrayLengthMatched: boolean|undefined = undefined

      if (typeof criterium == 'object' && 'arrayLength' in criterium) {
        arrayLengthMatched = matchValue(value.length, criterium.arrayLength)
      }

      if (arrayLengthMatched === false) {
        return false
      }

      for (let element of value) {
        if (matchCriteria(element, criterium)) {
          return true
        }
      }

      return arrayLengthMatched !== undefined ? true : false
    }

    if (typeof value == 'object' && value !== null) {
      return matchCriteria(value, criterium)
    }

    if (typeof criterium == 'object' && criterium !== null && typeof criterium.operator == 'string' && criterium.value !== undefined) {
      operator = (<string>criterium.operator).toUpperCase()
      criterium = criterium.value
    }

    if (typeof criterium == 'string' && criterium.toUpperCase() == 'NULL') {
      criterium = null
    }

    if (value === undefined) {
      return false
    }

    if (criterium instanceof Array) {
      let oneMatched: boolean|undefined = undefined

      for (criterium of criterium) {
        if (typeof criterium == 'object' && criterium !== null && typeof criterium.operator == 'string' && criterium.value !== undefined) {
          let subCriteria: any = {}
          subCriteria[field] = criterium

          if (! matchCriteria(obj, subCriteria)) {
            return false
          }
        }
        else {
          oneMatched = false
          if (value === criterium) {
            oneMatched = true
            break
          }
        }
      }

      if (oneMatched === false) {
        return false
      }
    }
    else {
      return matchValue(value, criterium, operator)
    }
  }

  return true
}

export function matchValue(value: any, criterium: any, operator?: string): boolean {
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
      return criterium.value instanceof Array && criterium.value.indexOf(value) > -1

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