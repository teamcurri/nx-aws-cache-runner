"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tasksRunner = void 0;
const default_1 = __importDefault(require("@nrwl/workspace/tasks-runners/default"));
const dotenv_1 = require("dotenv");
const rxjs_1 = require("rxjs");
const aws_cache_1 = require("./aws-cache");
const logger_1 = require("./logger");
const message_reporter_1 = require("./message-reporter");
(0, dotenv_1.config)();
function getOptions(options) {
    var _a, _b, _c, _d, _e, _f;
    return {
        awsAccessKeyId: (_a = process.env.NX_AWS_ACCESS_KEY_ID) !== null && _a !== void 0 ? _a : options.awsAccessKeyId,
        awsSecretAccessKey: (_b = process.env.NX_AWS_SECRET_ACCESS_KEY) !== null && _b !== void 0 ? _b : options.awsSecretAccessKey,
        awsBucket: (_c = process.env.NX_AWS_BUCKET) !== null && _c !== void 0 ? _c : options.awsBucket,
        awsRegion: (_d = process.env.NX_AWS_REGION) !== null && _d !== void 0 ? _d : options.awsRegion,
        awsProfile: (_e = process.env.NX_AWS_PROFILE) !== null && _e !== void 0 ? _e : options.awsProfile,
        awsEndpoint: (_f = process.env.NX_AWS_ENDPOINT) !== null && _f !== void 0 ? _f : options.awsEndpoint,
    };
}
const tasksRunner = (tasks, options, context) => {
    const awsOptions = getOptions(options);
    const logger = new logger_1.Logger();
    try {
        if (process.env.NX_AWS_DISABLE === 'true') {
            logger.note('Using Local Cache (NX_AWS_DISABLE is set to true)');
            return (0, default_1.default)(tasks, options, context);
        }
        logger.note('Using AWS S3 Remote Cache');
        const messages = new message_reporter_1.MessageReporter(logger);
        const remoteCache = new aws_cache_1.AwsCache(awsOptions, messages);
        const runnerWrapper = new rxjs_1.Subject();
        const runner = (0, default_1.default)(tasks, Object.assign(Object.assign({}, options), { remoteCache }), context);
        (0, rxjs_1.from)(runner).subscribe({
            next(value) {
                return runnerWrapper.next(value);
            },
            error(err) {
                return runnerWrapper.error(err);
            },
            complete() {
                return __awaiter(this, void 0, void 0, function* () {
                    yield remoteCache.waitForStoreRequestsToComplete();
                    messages.printMessages();
                    runnerWrapper.complete();
                });
            },
        });
        return runnerWrapper.toPromise();
    }
    catch (err) {
        logger.warn(err.message);
        logger.note('Using Local Cache');
        return (0, default_1.default)(tasks, options, context);
    }
};
exports.tasksRunner = tasksRunner;
exports.default = exports.tasksRunner;
//# sourceMappingURL=runner.js.map