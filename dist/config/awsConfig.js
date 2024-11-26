"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.s3Client = exports.default = void 0;
var _clientS = require("@aws-sdk/client-s3");
var _dotenv = _interopRequireDefault(require("dotenv"));
_dotenv.default.config();
const s3Client = exports.s3Client = new _clientS.S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});
var _default = exports.default = s3Client;
//# sourceMappingURL=awsConfig.js.map