"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const workspace_1 = require("@nx/workspace");
const chalk_1 = __importDefault(require("chalk"));
class Logger {
    debug(message) {
        if (!process.env.NX_VERBOSE_LOGGING) {
            return;
        }
        workspace_1.output.addNewline();
        workspace_1.output.writeOutputTitle({
            label: chalk_1.default.reset.inverse.bold.keyword('grey')(' AWS-CLOUD '),
            title: chalk_1.default.keyword('grey')(message),
        });
        workspace_1.output.addNewline();
    }
    error(message) {
        workspace_1.output.addNewline();
        workspace_1.output.writeOutputTitle({
            label: chalk_1.default.reset.inverse.bold.red(' AWS-CLOUD '),
            title: chalk_1.default.bold.red(message),
        });
        workspace_1.output.addNewline();
    }
    warn(message) {
        workspace_1.output.addNewline();
        workspace_1.output.writeOutputTitle({
            label: chalk_1.default.reset.inverse.bold.yellow(' AWS-CLOUD '),
            title: chalk_1.default.bold.yellow(message),
        });
        workspace_1.output.addNewline();
    }
    success(message) {
        workspace_1.output.addNewline();
        workspace_1.output.writeOutputTitle({
            label: chalk_1.default.reset.inverse.bold.green(' AWS-CLOUD '),
            title: chalk_1.default.bold.green(message),
        });
        workspace_1.output.addNewline();
    }
    note(message) {
        workspace_1.output.addNewline();
        workspace_1.output.writeOutputTitle({
            label: chalk_1.default.reset.inverse.bold.keyword('orange')(' AWS-CLOUD '),
            title: chalk_1.default.keyword('orange')(message),
        });
        workspace_1.output.addNewline();
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map