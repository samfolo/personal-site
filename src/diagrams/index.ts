/**
 * Diagram registry
 *
 * Every SDK diagram, exported from one place so the figure components, the
 * dev preview, and any future export or OG surface read the same
 * definitions — dimensions, steps, and copy come from here, nowhere else.
 */

export {ledger} from "./ledger";
export {migration} from "./migration";
export {agenticPipeline, oneShotPipeline} from "./pipeline";
export {verifyLoop} from "./verify-loop";
