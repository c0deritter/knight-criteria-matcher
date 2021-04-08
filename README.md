# Knight Criteria Matcher by Coderitter

Determines if an object matches given criteria.

## Related packages

This packages uses criteria from [knight-criteria](https://github.com/c0deritter/knight-criteria) and matches them against an JavaScript object.

There is an in-memory object database [knight-object-db](https://github.com/c0deritter/knight-object-db) which uses criteria and the matcher of this package to be able to query objects in that database.

## Install

`npm install knight-criteria-matcher`

## Overview

### matchCriteria()

```typescript
import { matchCriteria } from 'knight-criteria-matcher'
import { Criteria } from 'knight-criteria'

let obj = {
    name: 'Fatlinda'
}

let criteria: Criteria = {
    name: {
        operator: 'LIKE',
        value: '%linda%'
    }
}

matchCriteria(obj, criteria) == true
```