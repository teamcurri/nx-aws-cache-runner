"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageReporter = void 0;
class MessageReporter {
    constructor(logger) {
        this.error = null;
        this.logger = logger;
    }
    printMessages() {
        if (!this.error) {
            return;
        }
        this.logger.warn(this.error.message);
    }
}
exports.MessageReporter = MessageReporter;
//# sourceMappingURL=message-reporter.js.map