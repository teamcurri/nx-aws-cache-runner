"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwsCache = void 0;
const clientS3 = __importStar(require("@aws-sdk/client-s3"));
const AwsCredentialProviders = __importStar(require("@aws-sdk/credential-providers"));
const property_provider_1 = require("@aws-sdk/property-provider");
const fs_1 = require("fs");
const path_1 = require("path");
const stream_1 = require("stream");
const tar_1 = require("tar");
const util_1 = require("util");
const logger_1 = require("./logger");
class AwsCache {
    constructor(options, messages) {
        this.messages = messages;
        this.logger = new logger_1.Logger();
        this.uploadQueue = [];
        this.bucket = options.awsBucket;
        const clientConfig = {};
        if (options.awsRegion) {
            clientConfig.region = options.awsRegion;
        }
        if (options.awsEndpoint) {
            clientConfig.endpoint = options.awsEndpoint;
        }
        if (options.awsAccessKeyId && options.awsSecretAccessKey) {
            clientConfig.credentials = {
                accessKeyId: options.awsAccessKeyId,
                secretAccessKey: options.awsSecretAccessKey,
            };
        }
        else {
            if (options.awsProfile) {
                this.logger.debug('Using AWS Profile from node provider');
                clientConfig.credentials = AwsCredentialProviders.fromNodeProviderChain({
                    profile: options.awsProfile,
                });
            }
        }
        if (!options.awsBucket) {
            throw new Error(`Missing AWS option: NX_AWS_BUCKET`);
        }
        this.s3 = new clientS3.S3Client(clientConfig);
    }
    retrieve(hash, cacheDirectory) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.s3.config.credentials();
            }
            catch (err) {
                this.messages.error = err;
                return false;
            }
            if (this.messages.error) {
                return false;
            }
            try {
                this.logger.debug(`Storage Cache: Downloading ${hash}`);
                const tgzFilePath = this.getTgzFilePath(hash, cacheDirectory);
                if (!(yield this.checkIfCacheExists(hash))) {
                    this.logger.debug(`Storage Cache: Cache miss ${hash}`);
                    return false;
                }
                yield this.downloadFile(hash, tgzFilePath);
                yield this.extractTgzFile(tgzFilePath, cacheDirectory);
                yield this.createCommitFile(hash, cacheDirectory);
                this.logger.debug(`Storage Cache: Cache hit ${hash}`);
                return true;
            }
            catch (err) {
                this.messages.error = err;
                this.logger.debug(`Storage Cache: Cache error ${hash}`);
                return false;
            }
        });
    }
    store(hash, cacheDirectory) {
        if (this.messages.error) {
            return Promise.resolve(false);
        }
        const resultPromise = this.createAndUploadFile(hash, cacheDirectory);
        this.uploadQueue.push(resultPromise);
        return resultPromise;
    }
    waitForStoreRequestsToComplete() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all(this.uploadQueue);
        });
    }
    createAndUploadFile(hash, cacheDirectory) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tgzFilePath = this.getTgzFilePath(hash, cacheDirectory);
                yield this.createTgzFile(tgzFilePath, hash, cacheDirectory);
                yield this.uploadFile(hash, tgzFilePath);
                return true;
            }
            catch (err) {
                this.messages.error = err;
                return false;
            }
        });
    }
    createTgzFile(tgzFilePath, hash, cacheDirectory) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, tar_1.create)({
                    gzip: true,
                    file: tgzFilePath,
                    cwd: cacheDirectory,
                }, [hash]);
            }
            catch (err) {
                throw new Error(`Error creating tar.gz file - ${err}`);
            }
        });
    }
    extractTgzFile(tgzFilePath, cacheDirectory) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, tar_1.extract)({
                    file: tgzFilePath,
                    cwd: cacheDirectory,
                });
            }
            catch (err) {
                throw new Error(`Error extracting tar.gz file - ${err}`);
            }
        });
    }
    uploadFile(hash, tgzFilePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const tgzFileName = this.getTgzFileName(hash);
            const params = new clientS3.PutObjectCommand({
                Bucket: this.bucket,
                Key: tgzFileName,
                Body: (0, fs_1.createReadStream)(tgzFilePath),
            });
            try {
                this.logger.debug(`Storage Cache: Uploading ${hash}`);
                yield this.s3.send(params);
                this.logger.debug(`Storage Cache: Stored ${hash}`);
            }
            catch (err) {
                throw new Error(`Storage Cache: Upload error - ${err}`);
            }
        });
    }
    downloadFile(hash, tgzFilePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const pipelinePromise = (0, util_1.promisify)(stream_1.pipeline);
            const tgzFileName = this.getTgzFileName(hash);
            const writeFileToLocalDir = (0, fs_1.createWriteStream)(tgzFilePath);
            const params = new clientS3.GetObjectCommand({
                Bucket: this.bucket,
                Key: tgzFileName,
            });
            try {
                const commandOutput = yield this.s3.send(params);
                const fileStream = commandOutput.Body;
                yield pipelinePromise(fileStream, writeFileToLocalDir);
            }
            catch (err) {
                throw new Error(`Storage Cache: Download error - ${err}`);
            }
        });
    }
    checkIfCacheExists(hash) {
        return __awaiter(this, void 0, void 0, function* () {
            const tgzFileName = this.getTgzFileName(hash);
            const params = new clientS3.HeadObjectCommand({
                Bucket: this.bucket,
                Key: tgzFileName,
            });
            try {
                yield this.s3.send(params);
                return true;
            }
            catch (err) {
                if (err.name === 'NotFound') {
                    return false;
                }
                else if (err instanceof property_provider_1.CredentialsProviderError) {
                    return false;
                }
                throw new Error(`Error checking cache file existence - ${err}`);
            }
        });
    }
    createCommitFile(hash, cacheDirectory) {
        return __awaiter(this, void 0, void 0, function* () {
            const writeFileAsync = (0, util_1.promisify)(fs_1.writeFile);
            yield writeFileAsync((0, path_1.join)(cacheDirectory, this.getCommitFileName(hash)), 'true');
        });
    }
    getTgzFileName(hash) {
        return `${hash}.tar.gz`;
    }
    getTgzFilePath(hash, cacheDirectory) {
        return (0, path_1.join)(cacheDirectory, this.getTgzFileName(hash));
    }
    getCommitFileName(hash) {
        return `${hash}.commit`;
    }
}
exports.AwsCache = AwsCache;
//# sourceMappingURL=aws-cache.js.map