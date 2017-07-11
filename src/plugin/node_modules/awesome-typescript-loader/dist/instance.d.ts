/// <reference types="node" />
import * as fs from 'fs';
import { Checker } from './checker';
import { CompilerInfo, LoaderConfig, TsConfig } from './interfaces';
export interface Instance {
    id: number;
    babelImpl?: any;
    compiledFiles: {
        [key: string]: boolean;
    };
    configFilePath: string;
    compilerConfig: TsConfig;
    loaderConfig: LoaderConfig;
    checker: Checker;
    cacheIdentifier: any;
}
export interface Compiler {
    inputFileSystem: typeof fs;
    _tsInstances: {
        [key: string]: Instance;
    };
    options: {
        watch: boolean;
    };
}
export interface Loader {
    _compiler: Compiler;
    cacheable: () => void;
    query: string;
    async: () => (err: Error, source?: string, map?: string) => void;
    resourcePath: string;
    resolve: () => void;
    addDependency: (dep: string) => void;
    clearDependencies: () => void;
    emitFile: (fileName: string, text: string) => void;
    options: {
        atl?: {};
    };
}
export declare type QueryOptions = LoaderConfig & ts.CompilerOptions;
export declare function ensureInstance(webpack: Loader, query: QueryOptions, instanceName: string): Instance;
export declare function setupTs(compiler: string): CompilerInfo;
export interface Configs {
    configFilePath: string;
    compilerConfig: TsConfig;
    loaderConfig: LoaderConfig;
}
export declare function readConfigFile(baseDir: string, query: QueryOptions, tsImpl: typeof ts): Configs;
