# combined-reducer-enhanced [![Build Status](https://travis-ci.org/kwintenp/combined-reducer-enhanced.svg?branch=master)](https://travis-ci.org/kwintenp/combined-reducer-enhanced)

> Extension on the combineReducer method as available in Redux libraries


## Install

```
$ npm install --save combine-reducers-enhanced
```

## How to use
```javascript
import {combineReducersEnhanced} from "combine-reducers-enhanced";

const rootReducer = {
  ui: {
      login: loginReducer,
      main: mainReducer
  } ,
  data: dataReducer
}

const enhancedRootReducer = combineReducersEnhanced(rootReducer);

let store: Store = new Store(enhancedRootReducer);
```

## Reason for creation

Every redux library provides us with a method called `combineReducers` (if you don't know this check the [documentation](http://redux.js.org/docs/api/combineReducers.html). This method is really helpful but has its limitations. This library was created to fix one of this limitations.

## Current situation with combineReducers

During design of your state tree, you typically divide it up into different sections. F.e.

``` javascript
{
  ui: uiReducer,
  data: dataReducer
}
```

@ngrx/store provides the `combineReducers` method to easily work with such structures.
## Problem description

If you want to work with multiple levels of nesting in your state tree, you need to do something else F.e.

``` javascript
{
  ui: {
      login:...,
      main: ...
  } ,
  data: ...
}
```

In that case, you'd could:
1. Write a uiReducer yourself which delegates every action related to login to a loginReducer and every 'main' related action to the mainReducer.
2. Use a utility such as: https://github.com/brechtbilliet/create-reducer-tree which handles this for you
3. Nest the combineReducers method like this:

``` javascript
const rootReducer =
{
   ui: combineReducers({
         login: loginReducer,
         main: mainReducer
  }),
  data: dataReducer
}
```
## Improvement description

Option 1 provides you with extra work and option 2 forces you to work with a third party library. I personally prefer option 3 where you nest the combineReducers method inside your tree.
This could actually be easily integrated into the current combineReducers method and make the following possible:

``` javascript
rootReducer = {
   ui: {
      login: loginReducer,
      main: mainReducer
   },
   data: dataReducer
}

new Store(rootReducer)
```

It's a lot cleaner than approach where you nest the combineReducers method yourself.
This implemented by making the combineReducers function recursive.

## License

MIT © [KwintenP](http://blog.kwintenp.com)
