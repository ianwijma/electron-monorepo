import {startupArguments} from "./startupArguments";
import {isDebug} from "./isDebug";

export const isVerbose = () => isDebug() || startupArguments.verbose