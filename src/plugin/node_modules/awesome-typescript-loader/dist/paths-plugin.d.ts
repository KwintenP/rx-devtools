import { LoaderConfig } from './interfaces';
export interface Request {
    request?: Request;
    relativePath: string;
}
export interface Callback {
    (err?: Error, result?: any): void;
    log?: any;
    stack?: any;
    missing?: any;
}
export declare type ResolverCallback = (request: Request, callback: Callback) => void;
export interface ResolverPlugin {
    apply(resolver: Resolver): void;
}
export interface Resolver {
    apply(plugin: ResolverPlugin): void;
    plugin(source: string, cb: ResolverCallback): any;
    doResolve(target: string, req: Request, desc: string, Callback: any): any;
    join(relativePath: string, innerRequest: Request): Request;
}
export interface Mapping {
    onlyModule: boolean;
    alias: string;
    aliasPattern: RegExp;
    target: string;
}
export declare class PathsPlugin implements ResolverPlugin {
    source: string;
    target: string;
    ts: typeof ts;
    configFilePath: string;
    options: ts.CompilerOptions;
    baseUrl: string;
    mappings: Mapping[];
    absoluteBaseUrl: string;
    constructor(config?: LoaderConfig & ts.CompilerOptions);
    apply(resolver: Resolver): void;
    createPlugin(resolver: Resolver, mapping: Mapping): (request: any, callback: any) => any;
}
