## RxJS Devtools

This is a chrome extension that can be used to visualize RxJS streams in realtime. 

**Disclaimer:** This project started out as a POC to see if it was possible to visualize RxJS streams. It was later redefined as a chrome extension. This project is still a WIP. I encourage you to use it but remember, at this moment in time it is still in an early alpha phase and might not always work properly. Feel free to create github issues when you discover problems.
 
#### Installation

Install the following dependency in your project using yarn:

```yarn add rx-devtools```

or npm:

```npm i -S rx-devtools```

Initialize the package by calling the `setupRxDevtools` function:

```
import { setupRxDevtools } from 'rx-devtools/rx-devtools';
setupRxDevtools();
```
