import { DbCriteria } from 'mega-nice-db-query-parameter'

export function criteriaMatch(obj: any, criteria?: DbCriteria): boolean {
  if (criteria == undefined) {
    return true
  }

  for (let field in criteria) {
    let value = obj[field]
    let criterium = criteria[field]
    let operator = '='

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
      let oneTrue: boolean|undefined = undefined

      for (criterium of criterium) {
        if (typeof criterium == 'object' && criterium !== null && typeof criterium.operator == 'string' && criterium.value !== undefined) {
          let subCriteria: any = {}
          subCriteria[field] = criterium

          if (! criteriaMatch(obj, subCriteria)) {
            return false
          }
        }
        else {
          oneTrue = false
          if (value === criterium) {
            oneTrue = true
            break
          }
        }
      }

      if (oneTrue === false) {
        return false
      }
    }
    else {
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
    }
  }

  return true
}