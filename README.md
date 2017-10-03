## RxJS Devtools

This is a chrome extension that can be used to visualize RxJS streams in realtime. 

**Disclaimer:** This project started out as a POC to see if it was possible to visualize RxJS streams. It was later redefined as a chrome extension. This project is still a WIP. I encourage you to use it but remember, at this moment in time it is still in **an early alpha phase** and might not always work properly. I haven't properly tested all the operators, check the table below to see which ones should be working as of the current version. Feel free to create github issues when you discover problems, I will try to tackle them asap.

**Disclaimer2:** With the arrival of lettable operators (see ![test](https://github.com/ReactiveX/rxjs/blob/master/doc/lettable-operators.md)) the core of how RxJS code is written will need to be updated. This will also affect this project. Currently, lettable operators will not work with this project.
 
### Installation

#### In your project

Install the following dependency in your project using yarn:

```yarn add rx-devtools```

or npm:

```npm i -S rx-devtools```

Initialize the package by calling the `setupRxDevtools` function:

```
import { setupRxDevtools } from 'rx-devtools/rx-devtools';
setupRxDevtools();
```

**Note:** this should only be active in a development environment. Try to avoid having this code in your production build.

#### Chrome extension

Install the following chrome extension:
<a href="https://chrome.google.com/webstore/detail/rxjs-developer-tools/dedeglckjaldaochjmnochcfamanokie" target="_blank">Rx Devtools</a>

### How to use

The extension can be used to visualize streams realtime in your application using marble diagrams. To make the extension work, open your developer tools and open the 'RxDevtools' tab. The tab has to be open before the extension will work (I'm trying to find a way around this). 

The extension will capture the emissions of events in observables for a certain timeframe. The timeframe at this moment in time is not configurable and is set to 15s (this will be fixed asap, see todo's at the bottom). The extension will start counting as soon as the application starts and will show the marbles onto the marble diagrams with a timeframe of 15s in mind. If a value is emitted after 5s of this 15s timeframe, it will be visualized at 33% of the marble diagrams length. Every value arriving after this 15s timeframe will be visualised at the end (again, this will be fixed asap). To reset the timer, you need to refresh the page.

#### Simple observables

For observables to be debugged, you need to add a special operator to denote you want to debug it. This can be done using the 'debug' operator. You have to add it to a stream and give it a name parameter. From this operator onwards up until the subscription, the stream will be visualised.
 
```typescript
import 'rx-devtools/add/operator/debug';

const interval$ = Observable.interval(1000)
  .debug('interval')
  .startWith(10)
  .take(10)
  .filter((val: number) => val % 2 > 0)
  .map((val: number) => val * 2)
  .subscribe();
```

This will generate the following marble diagram in the Rx devtools extension.

![marble-diagram](https://www.dropbox.com/s/7jbl6wdavlhned5/Screenshot%202017-08-02%2020.40.52.png?raw=1)

On the left side, you get an overview of all the observables you are debugging. You can select the one you want to look at in detail. In our case, it's only one. When you click it, you get an in detail marble diagram with all the operators. When you click an element, you get to see the actual value it had at that moment in time on the right. The selected marble will turn blue.

#### Combination observables

You can also work with operators that are combining observables. Let's look at the following streams.

```typescript
 const interval$ = Observable.interval(1000)
   .debug('interval')
   .startWith(10)
   .take(10)
   .filter((val: number) => val % 2 > 0)
   .map((val: number) => val * 2)
   .mergeMap(val => this.swService.getCharacters());
   
 const other$ = Observable.interval(2000)
   .debug('second interval')
   .skip(3)
   .take(5)
   .map((val: number) => val * 3);
   
 Observable.combineLatest(interval$, other$)
   .debug('combined')
   .subscribe();
```

Notice that we have two streams we are combining using `combineLatest`. For this to work, both the streams and the combined stream must have the `debug` operator on them. Otherwise, the streams will not be visualised. When running this code, the following will be generated.

![marble-diagram](https://www.dropbox.com/s/6z4c7bftc74gf6m/Screenshot%202017-08-02%2020.54.06.png?raw=1)

**Note:** You can clear the list by clicking the 'Clear data' button (obviously).

You can see all the streams have an entry in the list. If you click 'interval' or 'second interval' you will see a similar result as the one above. If you click the 'combined' entry however, you will see the combination stream as shown below.

![marble-diagram](https://www.dropbox.com/s/ptygvg00ixfi6xk/Screenshot%202017-08-02%2020.56.52.png?raw=1)

It will show the last stream from the 'interval' and the last one of the 'second interval' first. Below you will see the combination operator. 

That's it, you should be ready to get started ;).

### Supported and tested operators*

| Operators        | Tested           | Supported since |
| ------------- |:-------------:| -----:|
| Map      |yes|0.0.1-alpha.29|
| Filter      | yes|  0.0.1-alpha.29 |
| Take | yes     |    0.0.1-alpha.29 |
| Skip | yes     |    0.0.1-alpha.29 |
| MergeMap | yes     |    0.0.1-alpha.29 |
| Do | yes     |    0.0.1-alpha.29 |
| StartWith | yes     |    0.0.1-alpha.29 |
| CombineLatest | yes     |    0.0.1-alpha.29 |
| Zip | yes     |    0.0.1-alpha.29 |
| Concat | yes     |    0.0.1-alpha.29 |
| Merge | yes     |    0.0.1-alpha.29 |

* This is a non-exhaustive list. The extension will definitely support more operators as of today but they aren't all properly tested. The ones above have been tested and should be working.


### Integration with external libraries

This extension heavily depends on the monkeypatching of functions of the RxJS library. Whilst this will work in most cases, it will not work in some cases. Certain libraries (such as @ngrx/store) will implement their own 'Observable' by implementing the 'Observable' interface. For the library to work, you must monkeypatch this implementing class yourself. The library will provide you with the tools to do so.

Here is how you do it for @ngrx/store.

```typescript
 const monkeyPathStoreLift = function () {
    const originalLift = Store.prototype.lift;
    Store.prototype.lift = liftMonkeyPatchFunction(originalLift);
  };
  monkeyPathStoreLift();
```

You can copy this method and replace the `Store.prototype.lift` with the specific Observable you want to debug and you should be ready to go. As with the setup, try to avoid having this code in your production build.

#### TODO

- [ ] Make the recording timeframe resettable
- [ ] Visualize different subscriptions on the same stream properly (currently they are visualized on the same marble diagram)

(If you have any addition you want in this library, let me know through github issues).
