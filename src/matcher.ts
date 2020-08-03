import { DbCriteria } from 'mega-nice-db-query-parameter'

export function matchCriteria(obj: any, criteria: DbCriteria|undefined): boolean {
  if (criteria == undefined) {
    return true
  }

  for (let field in criteria) {
    if (field == 'orderBy' || field == 'limit' || field == 'offset' || field == 'arrayCount') {
      continue
    }

    if (obj[field] === undefined) {
      return false
    }

    let value = obj[field]
    let criterium = criteria[field]
    let operator = '='

    if (value instanceof Array) {
      let arrayCountMatched: boolean|undefined = undefined

      if (typeof criterium == 'object' && 'arrayCount' in criterium) {
        arrayCountMatched = matchValue(value.length, criterium.arrayCount, operator)
      }

      if (arrayCountMatched === false) {
        return false
      }

      let oneMatched = false

      for (let element of value) {
        if (matchCriteria(element, criterium)) {
          oneMatched = true
          break
        }
      }

      return oneMatched && (arrayCountMatched !== undefined ? arrayCountMatched : true)
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

export function matchValue(value: any, criterium: any, operator: string = '='): boolean {
  switch (operator) {
    case '=':
      if (value !== criterium) {
        return false
      }
      break

    case '>':
      if (value <= criterium) {
        return false
      }
      break

    case '>=':
      if (value < criterium) {
        return false
      }
      break

    case '<':
      if (value >= criterium) {
        return false
      }
      break

    case '<=':
      if (value > criterium) {
        return false
      }
      break

    case '<>':
    case '!=':
      if (value === criterium) {
        return false
      }
      break

    case 'IN':
      if (criterium.value instanceof Array && criterium.value.indexOf(value) == -1) {
        return false
      }
      break

    case 'IS':
      if (value !== null) {
        return false
      }
      break

    case 'IS NOT':
      if (value === null) {
        return false
      }
      break

    case 'LIKE':
      if (typeof criterium == 'string' && typeof value == 'string') {
        let regex = '^' + criterium.toLowerCase().replace(/%/g, '.*') + '$'

        if (value.search(regex) == -1) {
          return false
        }
      }
      break

    case 'ILIKE':
      if (typeof criterium == 'string' && typeof value == 'string') {
        let regex = '^' + criterium.toLowerCase().replace(/%/g, '.*') + '$'
        
        if (value.toLowerCase().search(regex) == -1) {
          return false
        }
      }
      break
  }

  return true
}