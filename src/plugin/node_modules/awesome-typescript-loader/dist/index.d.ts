import { PathsPlugin } from './paths-plugin';
import { CheckerPlugin as _CheckerPlugin } from './watch-mode';
declare function loader(text: any): void;
declare namespace loader {
    const TsConfigPathsPlugin: typeof PathsPlugin;
    const CheckerPlugin: typeof _CheckerPlugin;
}
export = loader;
