/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 351:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const os = __importStar(__nccwpck_require__(87));
const utils_1 = __nccwpck_require__(278);
/**
 * Commands
 *
 * Command Format:
 *   ::name key=value,key=value::message
 *
 * Examples:
 *   ::warning::This is the message
 *   ::set-env name=MY_VAR::some value
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            let first = true;
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        if (first) {
                            first = false;
                        }
                        else {
                            cmdStr += ',';
                        }
                        cmdStr += `${key}=${escapeProperty(val)}`;
                    }
                }
            }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
    }
}
function escapeData(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A');
}
function escapeProperty(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/:/g, '%3A')
        .replace(/,/g, '%2C');
}
//# sourceMappingURL=command.js.map

/***/ }),

/***/ 186:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const command_1 = __nccwpck_require__(351);
const file_command_1 = __nccwpck_require__(717);
const utils_1 = __nccwpck_require__(278);
const os = __importStar(__nccwpck_require__(87));
const path = __importStar(__nccwpck_require__(622));
/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * Sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exportVariable(name, val) {
    const convertedVal = utils_1.toCommandValue(val);
    process.env[name] = convertedVal;
    const filePath = process.env['GITHUB_ENV'] || '';
    if (filePath) {
        const delimiter = '_GitHubActionsFileCommandDelimeter_';
        const commandValue = `${name}<<${delimiter}${os.EOL}${convertedVal}${os.EOL}${delimiter}`;
        file_command_1.issueCommand('ENV', commandValue);
    }
    else {
        command_1.issueCommand('set-env', { name }, convertedVal);
    }
}
exports.exportVariable = exportVariable;
/**
 * Registers a secret which will get masked from logs
 * @param secret value of the secret
 */
function setSecret(secret) {
    command_1.issueCommand('add-mask', {}, secret);
}
exports.setSecret = setSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    const filePath = process.env['GITHUB_PATH'] || '';
    if (filePath) {
        file_command_1.issueCommand('PATH', inputPath);
    }
    else {
        command_1.issueCommand('add-path', {}, inputPath);
    }
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.  The value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setOutput(name, value) {
    process.stdout.write(os.EOL);
    command_1.issueCommand('set-output', { name }, value);
}
exports.setOutput = setOutput;
/**
 * Enables or disables the echoing of commands into stdout for the rest of the step.
 * Echoing is disabled by default if ACTIONS_STEP_DEBUG is not set.
 *
 */
function setCommandEcho(enabled) {
    command_1.issue('echo', enabled ? 'on' : 'off');
}
exports.setCommandEcho = setCommandEcho;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Gets whether Actions Step Debug is on or not
 */
function isDebug() {
    return process.env['RUNNER_DEBUG'] === '1';
}
exports.isDebug = isDebug;
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    command_1.issueCommand('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message. Errors will be converted to string via toString()
 */
function error(message) {
    command_1.issue('error', message instanceof Error ? message.toString() : message);
}
exports.error = error;
/**
 * Adds an warning issue
 * @param message warning issue message. Errors will be converted to string via toString()
 */
function warning(message) {
    command_1.issue('warning', message instanceof Error ? message.toString() : message);
}
exports.warning = warning;
/**
 * Writes info to log with console.log.
 * @param message info message
 */
function info(message) {
    process.stdout.write(message + os.EOL);
}
exports.info = info;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    command_1.issue('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    command_1.issue('endgroup');
}
exports.endGroup = endGroup;
/**
 * Wrap an asynchronous function call in a group.
 *
 * Returns the same type as the function itself.
 *
 * @param name The name of the group
 * @param fn The function to wrap in the group
 */
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;
//-----------------------------------------------------------------------
// Wrapper action state
//-----------------------------------------------------------------------
/**
 * Saves state for current action, the state can only be retrieved by this action's post job execution.
 *
 * @param     name     name of the state to store
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveState(name, value) {
    command_1.issueCommand('save-state', { name }, value);
}
exports.saveState = saveState;
/**
 * Gets the value of an state set by this action's main execution.
 *
 * @param     name     name of the state to get
 * @returns   string
 */
function getState(name) {
    return process.env[`STATE_${name}`] || '';
}
exports.getState = getState;
//# sourceMappingURL=core.js.map

/***/ }),

/***/ 717:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

// For internal use, subject to change.
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
const fs = __importStar(__nccwpck_require__(747));
const os = __importStar(__nccwpck_require__(87));
const utils_1 = __nccwpck_require__(278);
function issueCommand(command, message) {
    const filePath = process.env[`GITHUB_${command}`];
    if (!filePath) {
        throw new Error(`Unable to find environment variable for file command ${command}`);
    }
    if (!fs.existsSync(filePath)) {
        throw new Error(`Missing file at path: ${filePath}`);
    }
    fs.appendFileSync(filePath, `${utils_1.toCommandValue(message)}${os.EOL}`, {
        encoding: 'utf8'
    });
}
exports.issueCommand = issueCommand;
//# sourceMappingURL=file-command.js.map

/***/ }),

/***/ 278:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", ({ value: true }));
/**
 * Sanitizes an input into a string so it can be passed into issueCommand safely
 * @param input input to sanitize into a string
 */
function toCommandValue(input) {
    if (input === null || input === undefined) {
        return '';
    }
    else if (typeof input === 'string' || input instanceof String) {
        return input;
    }
    return JSON.stringify(input);
}
exports.toCommandValue = toCommandValue;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 731:
/***/ ((module) => {

"use strict";


/**
 * This is a port of the PrototypeJS method stripTags.
 * It strips a string of any HTML tags.
 * @param {string}  A string from which to strip HTML tags
 * @return {string} The result of the function
 */

function stripTags(str) {
    return String(str).replace(/<\w+(\s+("[^"]*"|'[^']*'|[^>])+)?(\/)?>|<\/\w+>/gi, '');
}

module.exports = stripTags;


/***/ }),

/***/ 137:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __nccwpck_require__) => {

const fetchNode = __nccwpck_require__(805)
const fetch = fetchNode.fetch.bind({})

fetch.polyfill = true

if (!global.fetch) {
  global.fetch = fetch
  global.Response = fetchNode.Response
  global.Headers = fetchNode.Headers
  global.Request = fetchNode.Request
}


/***/ }),

/***/ 805:
/***/ ((module, exports, __nccwpck_require__) => {

const nodeFetch = __nccwpck_require__(467)
const realFetch = nodeFetch.default || nodeFetch

const fetch = function (url, options) {
  // Support schemaless URIs on the server for parity with the browser.
  // Ex: //github.com/ -> https://github.com/
  if (/^\/\//.test(url)) {
    url = 'https:' + url
  }
  return realFetch.call(this, url, options)
}

fetch.ponyfill = true

module.exports = exports = fetch
exports.fetch = fetch
exports.Headers = nodeFetch.Headers
exports.Request = nodeFetch.Request
exports.Response = nodeFetch.Response

// Needed for TypeScript consumers without esModuleInterop.
exports.default = fetch


/***/ }),

/***/ 212:
/***/ ((module) => {

module.exports = function() {
	return /[\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2648-\u2653\u2660\u2663\u2665\u2666\u2668\u267B\u267F\u2692-\u2694\u2696\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD79\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED0\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3]|\uD83E[\uDD10-\uDD18\uDD80-\uDD84\uDDC0]|\uD83C\uDDFF\uD83C[\uDDE6\uDDF2\uDDFC]|\uD83C\uDDFE\uD83C[\uDDEA\uDDF9]|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDFC\uD83C[\uDDEB\uDDF8]|\uD83C\uDDFB\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA]|\uD83C\uDDFA\uD83C[\uDDE6\uDDEC\uDDF2\uDDF8\uDDFE\uDDFF]|\uD83C\uDDF9\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF]|\uD83C\uDDF8\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF]|\uD83C\uDDF7\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC]|\uD83C\uDDF6\uD83C\uDDE6|\uD83C\uDDF5\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE]|\uD83C\uDDF4\uD83C\uDDF2|\uD83C\uDDF3\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF]|\uD83C\uDDF2\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF]|\uD83C\uDDF1\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE]|\uD83C\uDDF0\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF]|\uD83C\uDDEF\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5]|\uD83C\uDDEE\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9]|\uD83C\uDDED\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA]|\uD83C\uDDEC\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE]|\uD83C\uDDEB\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7]|\uD83C\uDDEA\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA]|\uD83C\uDDE9\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF]|\uD83C\uDDE8\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF]|\uD83C\uDDE7\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF]|\uD83C\uDDE6\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF]|[#\*0-9]\u20E3/g;
};


/***/ }),

/***/ 237:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var emoji = __nccwpck_require__(212)

module.exports = BananaSlug

var own = Object.hasOwnProperty
var whitespace = /\s/g
var specials = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~’]/g

function BananaSlug () {
  var self = this

  if (!(self instanceof BananaSlug)) return new BananaSlug()

  self.reset()
}

/**
 * Generate a unique slug.
 * @param  {string} value String of text to slugify
 * @param  {boolean} [false] Keep the current case, otherwise make all lowercase
 * @return {string}       A unique slug string
 */
BananaSlug.prototype.slug = function (value, maintainCase) {
  var self = this
  var slug = slugger(value, maintainCase === true)
  var originalSlug = slug

  while (own.call(self.occurrences, slug)) {
    self.occurrences[originalSlug]++
    slug = originalSlug + '-' + self.occurrences[originalSlug]
  }

  self.occurrences[slug] = 0

  return slug
}

/**
 * Reset - Forget all previous slugs
 * @return void
 */
BananaSlug.prototype.reset = function () {
  this.occurrences = Object.create(null)
}

function slugger (string, maintainCase) {
  if (typeof string !== 'string') return ''
  if (!maintainCase) string = string.toLowerCase()

  return string.trim()
    .replace(specials, '')
    .replace(emoji(), '')
    .replace(whitespace, '-')
}

BananaSlug.slug = slugger


/***/ }),

/***/ 870:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

(function (global, factory) {
     true ? factory(exports, __nccwpck_require__(137)) :
    0;
}(this, (function (exports) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    var MeiliSearchError =
    /** @class */
    function (_super) {
      __extends(MeiliSearchError, _super);

      function MeiliSearchError(message) {
        var _this = _super.call(this, message) || this;

        _this.name = 'MeiliSearchError';
        _this.type = 'MeiliSearchError';

        if (Error.captureStackTrace) {
          Error.captureStackTrace(_this, MeiliSearchError);
        }

        return _this;
      }

      return MeiliSearchError;
    }(Error);

    var MeiliSearchTimeOutError =
    /** @class */
    function (_super) {
      __extends(MeiliSearchTimeOutError, _super);

      function MeiliSearchTimeOutError(message) {
        var _this = _super.call(this, message) || this;

        _this.name = 'MeiliSearchTimeOutError';
        _this.type = _this.constructor.name;

        if (Error.captureStackTrace) {
          Error.captureStackTrace(_this, MeiliSearchTimeOutError);
        }

        return _this;
      }

      return MeiliSearchTimeOutError;
    }(Error);

    /**
     * Removes undefined entries from object
     */

    function removeUndefinedFromObject(obj) {
      return Object.entries(obj).reduce(function (acc, curEntry) {
        var key = curEntry[0],
            val = curEntry[1];
        if (val !== undefined) acc[key] = val;
        return acc;
      }, {});
    }

    function sleep(ms) {
      return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4
              /*yield*/
              , new Promise(function (resolve) {
                return setTimeout(resolve, ms);
              })];

            case 1:
              return [2
              /*return*/
              , _a.sent()];
          }
        });
      });
    }

    var MeiliSearchCommunicationError =
    /** @class */
    function (_super) {
      __extends(MeiliSearchCommunicationError, _super);

      function MeiliSearchCommunicationError(message, body) {
        var _this = _super.call(this, message) || this;

        _this.name = 'MeiliSearchCommunicationError';
        _this.type = 'MeiliSearchCommunicationError';

        if (body instanceof Response) {
          _this.message = body.statusText;
          _this.statusCode = body.status;
        }

        if (body instanceof Error) {
          _this.errno = body.errno;
          _this.code = body.code;
        }

        if (Error.captureStackTrace) {
          Error.captureStackTrace(_this, MeiliSearchCommunicationError);
        }

        return _this;
      }

      return MeiliSearchCommunicationError;
    }(Error);

    var MeiliSearchApiError =
    /** @class */
    function (_super) {
      __extends(class_1, _super);

      function class_1(error, status) {
        var _this = _super.call(this, error.message) || this;

        _this.type = 'MeiliSearchApiError';
        _this.name = 'MeiliSearchApiError';
        _this.errorCode = error.errorCode;
        _this.errorType = error.errorType;
        _this.errorLink = error.errorLink;
        _this.message = error.message;
        _this.httpStatus = status;

        if (Error.captureStackTrace) {
          Error.captureStackTrace(_this, MeiliSearchApiError);
        }

        return _this;
      }

      return class_1;
    }(Error);

    function httpResponseErrorHandler(response) {
      return __awaiter(this, void 0, void 0, function () {
        var err;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!!response.ok) return [3
              /*break*/
              , 5];
              err = void 0;
              _a.label = 1;

            case 1:
              _a.trys.push([1, 3,, 4]);

              return [4
              /*yield*/
              , response.json()];

            case 2:
              err = _a.sent();
              return [3
              /*break*/
              , 4];

            case 3:
              _a.sent();
              throw new MeiliSearchCommunicationError(response.statusText, response);

            case 4:
              throw new MeiliSearchApiError(err, response.status);

            case 5:
              return [2
              /*return*/
              , response];
          }
        });
      });
    }

    function httpErrorHandler(response) {
      if (response.type !== 'MeiliSearchApiError') {
        throw new MeiliSearchCommunicationError(response.message, response);
      }

      throw response;
    }

    var HttpRequests =
    /** @class */
    function () {
      function HttpRequests(config) {
        this.headers = __assign(__assign(__assign({}, config.headers || {}), {
          'Content-Type': 'application/json'
        }), config.apiKey ? {
          'X-Meili-API-Key': config.apiKey
        } : {});
        this.url = new URL(config.host);
      }

      HttpRequests.addTrailingSlash = function (url) {
        if (!url.endsWith('/')) {
          url += '/';
        }

        return url;
      };

      HttpRequests.prototype.request = function (_a) {
        var method = _a.method,
            url = _a.url,
            params = _a.params,
            body = _a.body,
            config = _a.config;
        return __awaiter(this, void 0, void 0, function () {
          var constructURL, queryParams_1, response, parsedBody, parsedJson, e_1;
          return __generator(this, function (_b) {
            switch (_b.label) {
              case 0:
                _b.trys.push([0, 3,, 4]);

                constructURL = new URL(url, this.url);

                if (params) {
                  queryParams_1 = new URLSearchParams();
                  Object.keys(params).filter(function (x) {
                    return params[x] !== null;
                  }).map(function (x) {
                    return queryParams_1.set(x, params[x]);
                  });
                  constructURL.search = queryParams_1.toString();
                }

                return [4
                /*yield*/
                , fetch(constructURL.toString(), __assign(__assign({}, config), {
                  method: method,
                  body: body ? JSON.stringify(body) : undefined,
                  headers: this.headers
                })).then(function (res) {
                  return httpResponseErrorHandler(res);
                })];

              case 1:
                response = _b.sent();
                return [4
                /*yield*/
                , response.text()];

              case 2:
                parsedBody = _b.sent();

                try {
                  parsedJson = JSON.parse(parsedBody);
                  return [2
                  /*return*/
                  , parsedJson];
                } catch (_) {
                  return [2
                  /*return*/
                  ];
                }

                return [3
                /*break*/
                , 4];

              case 3:
                e_1 = _b.sent();
                httpErrorHandler(e_1);
                return [3
                /*break*/
                , 4];

              case 4:
                return [2
                /*return*/
                ];
            }
          });
        });
      };

      HttpRequests.prototype.get = function (url, params, config) {
        return __awaiter(this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                return [4
                /*yield*/
                , this.request({
                  method: 'GET',
                  url: url,
                  params: params,
                  config: config
                })];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      };

      HttpRequests.prototype.post = function (url, data, params, config) {
        return __awaiter(this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                return [4
                /*yield*/
                , this.request({
                  method: 'POST',
                  url: url,
                  body: data,
                  params: params,
                  config: config
                })];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      };

      HttpRequests.prototype.put = function (url, data, params, config) {
        return __awaiter(this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                return [4
                /*yield*/
                , this.request({
                  method: 'PUT',
                  url: url,
                  body: data,
                  params: params,
                  config: config
                })];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      };

      HttpRequests.prototype["delete"] = function (url, data, params, config) {
        return __awaiter(this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                return [4
                /*yield*/
                , this.request({
                  method: 'DELETE',
                  url: url,
                  body: data,
                  params: params,
                  config: config
                })];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      };

      return HttpRequests;
    }();

    /*
     * Bundle: MeiliSearch / Indexes
     * Project: MeiliSearch - Javascript API
     * Author: Quentin de Quelen <quentin@meilisearch.com>
     * Copyright: 2019, MeiliSearch
     */

    var Index =
    /** @class */
    function () {
      function Index(config, uid, primaryKey) {
        this.uid = uid;
        this.primaryKey = primaryKey;
        this.httpRequest = new HttpRequests(config);
      } ///
      /// STATIC
      ///


      Index.getApiRoutes = function () {
        return Index.apiRoutes;
      };

      Index.getRouteConstructors = function () {
        return Index.routeConstructors;
      }; ///
      /// UPDATES
      ///

      /**
       * Get the informations about an update status
       * @memberof Index
       * @method getUpdateStatus
       */


      Index.prototype.getUpdateStatus = function (updateId) {
        return __awaiter(this, void 0, void 0, function () {
          var url;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = Index.routeConstructors.getUpdateStatus(this.uid, updateId);
                return [4
                /*yield*/
                , this.httpRequest.get(url)];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      };

      Index.prototype.waitForPendingUpdate = function (updateId, _a) {
        var _b = _a === void 0 ? {} : _a,
            _c = _b.timeOutMs,
            timeOutMs = _c === void 0 ? 5000 : _c,
            _d = _b.intervalMs,
            intervalMs = _d === void 0 ? 50 : _d;

        return __awaiter(this, void 0, void 0, function () {
          var startingTime, response;
          return __generator(this, function (_e) {
            switch (_e.label) {
              case 0:
                startingTime = Date.now();
                _e.label = 1;

              case 1:
                if (!(Date.now() - startingTime < timeOutMs)) return [3
                /*break*/
                , 4];
                return [4
                /*yield*/
                , this.getUpdateStatus(updateId)];

              case 2:
                response = _e.sent();
                if (response.status !== 'enqueued') return [2
                /*return*/
                , response];
                return [4
                /*yield*/
                , sleep(intervalMs)];

              case 3:
                _e.sent();

                return [3
                /*break*/
                , 1];

              case 4:
                throw new MeiliSearchTimeOutError("timeout of " + timeOutMs + "ms has exceeded on process " + updateId + " when waiting for pending update to resolve.");
            }
          });
        });
      };
      /**
       * Get the list of all updates
       * @memberof Index
       * @method getAllUpdateStatus
       */


      Index.prototype.getAllUpdateStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
          var url;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = Index.routeConstructors.getAllUpdateStatus(this.uid);
                return [4
                /*yield*/
                , this.httpRequest.get(url)];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      }; ///
      /// SEARCH
      ///

      /**
       * Search for documents into an index
       * @memberof Index
       * @method search
       */


      Index.prototype.search = function (query, options, method, config) {
        if (method === void 0) {
          method = 'POST';
        }

        return __awaiter(this, void 0, void 0, function () {
          var url, params, getParams;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = Index.routeConstructors.search(this.uid);
                params = {
                  q: query,
                  offset: options === null || options === void 0 ? void 0 : options.offset,
                  limit: options === null || options === void 0 ? void 0 : options.limit,
                  cropLength: options === null || options === void 0 ? void 0 : options.cropLength,
                  filters: options === null || options === void 0 ? void 0 : options.filters,
                  matches: options === null || options === void 0 ? void 0 : options.matches,
                  facetFilters: options === null || options === void 0 ? void 0 : options.facetFilters,
                  facetsDistribution: options === null || options === void 0 ? void 0 : options.facetsDistribution,
                  attributesToRetrieve: options === null || options === void 0 ? void 0 : options.attributesToRetrieve,
                  attributesToCrop: options === null || options === void 0 ? void 0 : options.attributesToCrop,
                  attributesToHighlight: options === null || options === void 0 ? void 0 : options.attributesToHighlight
                };
                if (!(method.toUpperCase() === 'POST')) return [3
                /*break*/
                , 2];
                return [4
                /*yield*/
                , this.httpRequest.post(url, removeUndefinedFromObject(params), undefined, config)];

              case 1:
                return [2
                /*return*/
                , _a.sent()];

              case 2:
                if (!(method.toUpperCase() === 'GET')) return [3
                /*break*/
                , 4];
                getParams = __assign(__assign({}, params), {
                  facetFilters: Array.isArray(options === null || options === void 0 ? void 0 : options.facetFilters) && (options === null || options === void 0 ? void 0 : options.facetFilters) ? JSON.stringify(options.facetFilters) : undefined,
                  facetsDistribution: (options === null || options === void 0 ? void 0 : options.facetsDistribution) ? JSON.stringify(options.facetsDistribution) : undefined,
                  attributesToRetrieve: (options === null || options === void 0 ? void 0 : options.attributesToRetrieve) ? options.attributesToRetrieve.join(',') : undefined,
                  attributesToCrop: (options === null || options === void 0 ? void 0 : options.attributesToCrop) ? options.attributesToCrop.join(',') : undefined,
                  attributesToHighlight: (options === null || options === void 0 ? void 0 : options.attributesToHighlight) ? options.attributesToHighlight.join(',') : undefined
                });
                return [4
                /*yield*/
                , this.httpRequest.get(url, removeUndefinedFromObject(getParams), config)];

              case 3:
                return [2
                /*return*/
                , _a.sent()];

              case 4:
                throw new MeiliSearchError('method parameter should be either POST or GET');
            }
          });
        });
      }; ///
      /// INDEX
      ///

      /**
       * Get index information.
       * @memberof Index
       * @method getRawInfo
       */


      Index.prototype.getRawInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
          var url, res;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = Index.routeConstructors.indexRoute(this.uid);
                return [4
                /*yield*/
                , this.httpRequest.get(url)];

              case 1:
                res = _a.sent();
                this.primaryKey = res.primaryKey;
                return [2
                /*return*/
                , res];
            }
          });
        });
      };
      /**
       * Fetch and update Index information.
       * @memberof Index
       * @method fetchInfo
       */


      Index.prototype.fetchInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                return [4
                /*yield*/
                , this.getRawInfo()];

              case 1:
                _a.sent();

                return [2
                /*return*/
                , this];
            }
          });
        });
      };
      /**
       * Get Primary Key.
       * @memberof Index
       * @method fetchPrimaryKey
       */


      Index.prototype.fetchPrimaryKey = function () {
        return __awaiter(this, void 0, void 0, function () {
          var _a;

          return __generator(this, function (_b) {
            switch (_b.label) {
              case 0:
                _a = this;
                return [4
                /*yield*/
                , this.getRawInfo()];

              case 1:
                _a.primaryKey = _b.sent().primaryKey;
                return [2
                /*return*/
                , this.primaryKey];
            }
          });
        });
      };
      /**
       * Create an index.
       * @memberof Index
       * @method create
       */


      Index.create = function (config, uid, options) {
        if (options === void 0) {
          options = {};
        }

        return __awaiter(this, void 0, void 0, function () {
          var url, req, index;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = Index.apiRoutes.indexes;
                req = new HttpRequests(config);
                return [4
                /*yield*/
                , req.post(url, __assign(__assign({}, options), {
                  uid: uid
                }))];

              case 1:
                index = _a.sent();
                return [2
                /*return*/
                , new Index(config, uid, index.primaryKey)];
            }
          });
        });
      };
      /**
       * Update an index.
       * @memberof Index
       * @method update
       */


      Index.prototype.update = function (data) {
        return __awaiter(this, void 0, void 0, function () {
          var url, index;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = Index.routeConstructors.update(this.uid);
                return [4
                /*yield*/
                , this.httpRequest.put(url, data)];

              case 1:
                index = _a.sent();
                this.primaryKey = index.primaryKey;
                return [2
                /*return*/
                , this];
            }
          });
        });
      };
      /**
       * Delete an index.
       * @memberof Index
       * @method delete
       */


      Index.prototype["delete"] = function () {
        return __awaiter(this, void 0, void 0, function () {
          var url;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = Index.routeConstructors["delete"](this.uid);
                return [4
                /*yield*/
                , this.httpRequest["delete"](url)];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      }; ///
      /// STATS
      ///

      /**
       * get stats of an index
       * @memberof Index
       * @method getStats
       */


      Index.prototype.getStats = function () {
        return __awaiter(this, void 0, void 0, function () {
          var url;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = "/indexes/" + this.uid + "/stats";
                return [4
                /*yield*/
                , this.httpRequest.get(url)];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      }; ///
      /// DOCUMENTS
      ///

      /**
       * get documents of an index
       * @memberof Index
       * @method getDocuments
       */


      Index.prototype.getDocuments = function (options) {
        return __awaiter(this, void 0, void 0, function () {
          var url, attr;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = Index.routeConstructors.getDocuments(this.uid);

                if (options !== undefined && Array.isArray(options.attributesToRetrieve)) {
                  attr = options.attributesToRetrieve.join(',');
                }

                return [4
                /*yield*/
                , this.httpRequest.get(url, __assign(__assign({}, options), attr !== undefined ? {
                  attributesToRetrieve: attr
                } : {}))];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      };
      /**
       * Get one document
       * @memberof Index
       * @method getDocument
       */


      Index.prototype.getDocument = function (documentId) {
        return __awaiter(this, void 0, void 0, function () {
          var url;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = Index.routeConstructors.getDocument(this.uid, documentId);
                return [4
                /*yield*/
                , this.httpRequest.get(url)];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      };
      /**
       * Add or replace multiples documents to an index
       * @memberof Index
       * @method addDocuments
       */


      Index.prototype.addDocuments = function (documents, options) {
        return __awaiter(this, void 0, void 0, function () {
          var url;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = Index.routeConstructors.addDocuments(this.uid);
                return [4
                /*yield*/
                , this.httpRequest.post(url, documents, options)];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      };
      /**
       * Add or update multiples documents to an index
       * @memberof Index
       * @method updateDocuments
       */


      Index.prototype.updateDocuments = function (documents, options) {
        return __awaiter(this, void 0, void 0, function () {
          var url;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = Index.routeConstructors.updateDocuments(this.uid);
                return [4
                /*yield*/
                , this.httpRequest.put(url, documents, options)];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      };
      /**
       * Delete one document
       * @memberof Index
       * @method deleteDocument
       */


      Index.prototype.deleteDocument = function (documentId) {
        return __awaiter(this, void 0, void 0, function () {
          var url;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = Index.routeConstructors.deleteDocument(this.uid, documentId);
                return [4
                /*yield*/
                , this.httpRequest["delete"](url)];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      };
      /**
       * Delete multiples documents of an index
       * @memberof Index
       * @method deleteDocuments
       */


      Index.prototype.deleteDocuments = function (documentsIds) {
        return __awaiter(this, void 0, void 0, function () {
          var url;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = Index.routeConstructors.deleteDocuments(this.uid);
                return [4
                /*yield*/
                , this.httpRequest.post(url, documentsIds)];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      };
      /**
       * Delete all documents of an index
       * @memberof Index
       * @method deleteAllDocuments
       */


      Index.prototype.deleteAllDocuments = function () {
        return __awaiter(this, void 0, void 0, function () {
          var url;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = Index.routeConstructors.deleteAllDocuments(this.uid);
                return [4
                /*yield*/
                , this.httpRequest["delete"](url)];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      }; ///
      /// SETTINGS
      ///

      /**
       * Retrieve all settings
       * @memberof Index
       * @method getSettings
       */


      Index.prototype.getSettings = function () {
        return __awaiter(this, void 0, void 0, function () {
          var url;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = Index.routeConstructors.getSettings(this.uid);
                return [4
                /*yield*/
                , this.httpRequest.get(url)];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      };
      /**
       * Update all settings
       * Any parameters not provided will be left unchanged.
       * @memberof Index
       * @method updateSettings
       */


      Index.prototype.updateSettings = function (settings) {
        return __awaiter(this, void 0, void 0, function () {
          var url;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = Index.routeConstructors.updateSettings(this.uid);
                return [4
                /*yield*/
                , this.httpRequest.post(url, settings)];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      };
      /**
       * Reset settings.
       * @memberof Index
       * @method resetSettings
       */


      Index.prototype.resetSettings = function () {
        return __awaiter(this, void 0, void 0, function () {
          var url;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = Index.routeConstructors.resetSettings(this.uid);
                return [4
                /*yield*/
                , this.httpRequest["delete"](url)];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      }; ///
      /// SYNONYMS
      ///

      /**
       * Get the list of all synonyms
       * @memberof Index
       * @method getSynonyms
       */


      Index.prototype.getSynonyms = function () {
        return __awaiter(this, void 0, void 0, function () {
          var url;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = Index.routeConstructors.getSynonyms(this.uid);
                return [4
                /*yield*/
                , this.httpRequest.get(url)];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      };
      /**
       * Update the list of synonyms. Overwrite the old list.
       * @memberof Index
       * @method updateSynonyms
       */


      Index.prototype.updateSynonyms = function (synonyms) {
        return __awaiter(this, void 0, void 0, function () {
          var url;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = Index.routeConstructors.updateSynonyms(this.uid);
                return [4
                /*yield*/
                , this.httpRequest.post(url, synonyms)];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      };
      /**
       * Reset the synonym list to be empty again
       * @memberof Index
       * @method resetSynonyms
       */


      Index.prototype.resetSynonyms = function () {
        return __awaiter(this, void 0, void 0, function () {
          var url;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = Index.routeConstructors.resetSynonyms(this.uid);
                return [4
                /*yield*/
                , this.httpRequest["delete"](url)];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      }; ///
      /// STOP WORDS
      ///

      /**
       * Get the list of all stop-words
       * @memberof Index
       * @method getStopWords
       */


      Index.prototype.getStopWords = function () {
        return __awaiter(this, void 0, void 0, function () {
          var url;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = Index.routeConstructors.getStopWords(this.uid);
                return [4
                /*yield*/
                , this.httpRequest.get(url)];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      };
      /**
       * Update the list of stop-words. Overwrite the old list.
       * @memberof Index
       * @method updateStopWords
       */


      Index.prototype.updateStopWords = function (stopWords) {
        return __awaiter(this, void 0, void 0, function () {
          var url;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = Index.routeConstructors.updateStopWords(this.uid);
                return [4
                /*yield*/
                , this.httpRequest.post(url, stopWords)];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      };
      /**
       * Reset the stop-words list to be empty again
       * @memberof Index
       * @method resetStopWords
       */


      Index.prototype.resetStopWords = function () {
        return __awaiter(this, void 0, void 0, function () {
          var url;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = Index.routeConstructors.resetStopWords(this.uid);
                return [4
                /*yield*/
                , this.httpRequest["delete"](url)];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      }; ///
      /// RANKING RULES
      ///

      /**
       * Get the list of all ranking-rules
       * @memberof Index
       * @method getRankingRules
       */


      Index.prototype.getRankingRules = function () {
        return __awaiter(this, void 0, void 0, function () {
          var url;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = Index.routeConstructors.getRankingRules(this.uid);
                return [4
                /*yield*/
                , this.httpRequest.get(url)];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      };
      /**
       * Update the list of ranking-rules. Overwrite the old list.
       * @memberof Index
       * @method updateRankingRules
       */


      Index.prototype.updateRankingRules = function (rankingRules) {
        return __awaiter(this, void 0, void 0, function () {
          var url;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = Index.routeConstructors.updateRankingRules(this.uid);
                return [4
                /*yield*/
                , this.httpRequest.post(url, rankingRules)];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      };
      /**
       * Reset the ranking rules list to its default value
       * @memberof Index
       * @method resetRankingRules
       */


      Index.prototype.resetRankingRules = function () {
        return __awaiter(this, void 0, void 0, function () {
          var url;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = Index.routeConstructors.resetRankingRules(this.uid);
                return [4
                /*yield*/
                , this.httpRequest["delete"](url)];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      }; ///
      /// DISTINCT ATTRIBUTE
      ///

      /**
       * Get the distinct-attribute
       * @memberof Index
       * @method getDistinctAttribute
       */


      Index.prototype.getDistinctAttribute = function () {
        return __awaiter(this, void 0, void 0, function () {
          var url;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = Index.routeConstructors.getDistinctAttribute(this.uid);
                return [4
                /*yield*/
                , this.httpRequest.get(url)];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      };
      /**
       * Update the distinct-attribute.
       * @memberof Index
       * @method updateDistinctAttribute
       */


      Index.prototype.updateDistinctAttribute = function (distinctAttribute) {
        return __awaiter(this, void 0, void 0, function () {
          var url;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = Index.routeConstructors.updateDistinctAttribute(this.uid);
                return [4
                /*yield*/
                , this.httpRequest.post(url, distinctAttribute)];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      };
      /**
       * Reset the distinct-attribute.
       * @memberof Index
       * @method resetDistinctAttribute
       */


      Index.prototype.resetDistinctAttribute = function () {
        return __awaiter(this, void 0, void 0, function () {
          var url;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = Index.routeConstructors.resetDistinctAttribute(this.uid);
                return [4
                /*yield*/
                , this.httpRequest["delete"](url)];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      }; ///
      /// ATTRIBUTES FOR FACETING
      ///

      /**
       * Get the attributes-for-faceting
       * @memberof Index
       * @method getAttributesForFaceting
       */


      Index.prototype.getAttributesForFaceting = function () {
        return __awaiter(this, void 0, void 0, function () {
          var url;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = Index.routeConstructors.getAttributesForFaceting(this.uid);
                return [4
                /*yield*/
                , this.httpRequest.get(url)];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      };
      /**
       * Update the attributes-for-faceting.
       * @memberof Index
       * @method updateAttributesForFaceting
       */


      Index.prototype.updateAttributesForFaceting = function (attributesForFaceting) {
        return __awaiter(this, void 0, void 0, function () {
          var url;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = Index.routeConstructors.updateAttributesForFaceting(this.uid);
                return [4
                /*yield*/
                , this.httpRequest.post(url, attributesForFaceting)];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      };
      /**
       * Reset the attributes-for-faceting.
       * @memberof Index
       * @method resetAttributesForFaceting
       */


      Index.prototype.resetAttributesForFaceting = function () {
        return __awaiter(this, void 0, void 0, function () {
          var url;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = Index.routeConstructors.resetAttributesForFaceting(this.uid);
                return [4
                /*yield*/
                , this.httpRequest["delete"](url)];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      }; ///
      /// SEARCHABLE ATTRIBUTE
      ///

      /**
       * Get the searchable-attributes
       * @memberof Index
       * @method getSearchableAttributes
       */


      Index.prototype.getSearchableAttributes = function () {
        return __awaiter(this, void 0, void 0, function () {
          var url;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = Index.routeConstructors.getSearchableAttributes(this.uid);
                return [4
                /*yield*/
                , this.httpRequest.get(url)];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      };
      /**
       * Update the searchable-attributes.
       * @memberof Index
       * @method updateSearchableAttributes
       */


      Index.prototype.updateSearchableAttributes = function (searchableAttributes) {
        return __awaiter(this, void 0, void 0, function () {
          var url;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = Index.routeConstructors.updateSearchableAttributes(this.uid);
                return [4
                /*yield*/
                , this.httpRequest.post(url, searchableAttributes)];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      };
      /**
       * Reset the searchable-attributes.
       * @memberof Index
       * @method resetSearchableAttributes
       */


      Index.prototype.resetSearchableAttributes = function () {
        return __awaiter(this, void 0, void 0, function () {
          var url;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = Index.routeConstructors.resetSearchableAttributes(this.uid);
                return [4
                /*yield*/
                , this.httpRequest["delete"](url)];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      }; ///
      /// DISPLAYED ATTRIBUTE
      ///

      /**
       * Get the displayed-attributes
       * @memberof Index
       * @method getDisplayedAttributes
       */


      Index.prototype.getDisplayedAttributes = function () {
        return __awaiter(this, void 0, void 0, function () {
          var url;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = Index.routeConstructors.getDisplayedAttributes(this.uid);
                return [4
                /*yield*/
                , this.httpRequest.get(url)];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      };
      /**
       * Update the displayed-attributes.
       * @memberof Index
       * @method updateDisplayedAttributes
       */


      Index.prototype.updateDisplayedAttributes = function (displayedAttributes) {
        return __awaiter(this, void 0, void 0, function () {
          var url;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = Index.routeConstructors.updateDisplayedAttributes(this.uid);
                return [4
                /*yield*/
                , this.httpRequest.post(url, displayedAttributes)];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      };
      /**
       * Reset the displayed-attributes.
       * @memberof Index
       * @method resetDisplayedAttributes
       */


      Index.prototype.resetDisplayedAttributes = function () {
        return __awaiter(this, void 0, void 0, function () {
          var url;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = Index.routeConstructors.resetDisplayedAttributes(this.uid);
                return [4
                /*yield*/
                , this.httpRequest["delete"](url)];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      };

      Index.apiRoutes = {
        indexes: 'indexes'
      };
      Index.routeConstructors = {
        indexRoute: function indexRoute(indexUid) {
          return Index.apiRoutes.indexes + "/" + indexUid;
        },
        getUpdateStatus: function getUpdateStatus(indexUid, updateId) {
          return Index.routeConstructors.indexRoute(indexUid) + '/' + ("updates/" + updateId);
        },
        getAllUpdateStatus: function getAllUpdateStatus(indexUid) {
          return Index.routeConstructors.indexRoute(indexUid) + '/' + "updates";
        },
        search: function search(indexUid) {
          return Index.routeConstructors.indexRoute(indexUid) + '/' + "search";
        },
        getRawInfo: function getRawInfo(indexUid) {
          return "indexes/" + indexUid;
        },
        update: function update(indexUid) {
          return Index.routeConstructors.indexRoute(indexUid);
        },
        "delete": function _delete(indexUid) {
          return Index.routeConstructors.indexRoute(indexUid);
        },
        getStats: function getStats(indexUid) {
          return Index.routeConstructors.indexRoute(indexUid) + '/' + "stats";
        },
        getDocument: function getDocument(indexUid, documentId) {
          return Index.routeConstructors.indexRoute(indexUid) + '/' + ("documents/" + documentId);
        },
        getDocuments: function getDocuments(indexUid) {
          return Index.routeConstructors.indexRoute(indexUid) + '/' + "documents";
        },
        addDocuments: function addDocuments(indexUid) {
          return Index.routeConstructors.getDocuments(indexUid);
        },
        updateDocuments: function updateDocuments(indexUid) {
          return Index.routeConstructors.getDocuments(indexUid);
        },
        deleteAllDocuments: function deleteAllDocuments(indexUid) {
          return Index.routeConstructors.getDocuments(indexUid);
        },
        deleteDocument: function deleteDocument(indexUid, documentId) {
          return Index.routeConstructors.indexRoute(indexUid) + '/' + ("documents/" + documentId);
        },
        deleteDocuments: function deleteDocuments(indexUid) {
          return Index.routeConstructors.indexRoute(indexUid) + '/' + "documents/delete-batch";
        },
        getSettings: function getSettings(indexUid) {
          return Index.routeConstructors.indexRoute(indexUid) + '/' + "settings";
        },
        updateSettings: function updateSettings(indexUid) {
          return Index.routeConstructors.getSettings(indexUid);
        },
        resetSettings: function resetSettings(indexUid) {
          return Index.routeConstructors.getSettings(indexUid);
        },
        getSynonyms: function getSynonyms(indexUid) {
          return Index.routeConstructors.indexRoute(indexUid) + '/' + "settings/synonyms";
        },
        updateSynonyms: function updateSynonyms(indexUid) {
          return Index.routeConstructors.getSynonyms(indexUid);
        },
        resetSynonyms: function resetSynonyms(indexUid) {
          return Index.routeConstructors.getSynonyms(indexUid);
        },
        getStopWords: function getStopWords(indexUid) {
          return Index.routeConstructors.indexRoute(indexUid) + '/' + "settings/stop-words";
        },
        updateStopWords: function updateStopWords(indexUid) {
          return Index.routeConstructors.getStopWords(indexUid);
        },
        resetStopWords: function resetStopWords(indexUid) {
          return Index.routeConstructors.getStopWords(indexUid);
        },
        getRankingRules: function getRankingRules(indexUid) {
          return Index.routeConstructors.indexRoute(indexUid) + '/' + "settings/ranking-rules";
        },
        updateRankingRules: function updateRankingRules(indexUid) {
          return Index.routeConstructors.getRankingRules(indexUid);
        },
        resetRankingRules: function resetRankingRules(indexUid) {
          return Index.routeConstructors.getRankingRules(indexUid);
        },
        getDistinctAttribute: function getDistinctAttribute(indexUid) {
          return Index.routeConstructors.indexRoute(indexUid) + '/' + "settings/distinct-attribute";
        },
        updateDistinctAttribute: function updateDistinctAttribute(indexUid) {
          return Index.routeConstructors.getDistinctAttribute(indexUid);
        },
        resetDistinctAttribute: function resetDistinctAttribute(indexUid) {
          return Index.routeConstructors.getDistinctAttribute(indexUid);
        },
        getAttributesForFaceting: function getAttributesForFaceting(indexUid) {
          return Index.routeConstructors.indexRoute(indexUid) + '/' + "settings/attributes-for-faceting";
        },
        updateAttributesForFaceting: function updateAttributesForFaceting(indexUid) {
          return Index.routeConstructors.getAttributesForFaceting(indexUid);
        },
        resetAttributesForFaceting: function resetAttributesForFaceting(indexUid) {
          return Index.routeConstructors.getAttributesForFaceting(indexUid);
        },
        getSearchableAttributes: function getSearchableAttributes(indexUid) {
          return Index.routeConstructors.indexRoute(indexUid) + '/' + "settings/searchable-attributes";
        },
        updateSearchableAttributes: function updateSearchableAttributes(indexUid) {
          return Index.routeConstructors.getSearchableAttributes(indexUid);
        },
        resetSearchableAttributes: function resetSearchableAttributes(indexUid) {
          return Index.routeConstructors.getSearchableAttributes(indexUid);
        },
        getDisplayedAttributes: function getDisplayedAttributes(indexUid) {
          return Index.routeConstructors.indexRoute(indexUid) + '/' + "settings/displayed-attributes";
        },
        updateDisplayedAttributes: function updateDisplayedAttributes(indexUid) {
          return Index.routeConstructors.getDisplayedAttributes(indexUid);
        },
        resetDisplayedAttributes: function resetDisplayedAttributes(indexUid) {
          return Index.routeConstructors.getDisplayedAttributes(indexUid);
        }
      };
      return Index;
    }();

    /*
     * Bundle: MeiliSearch
     * Project: MeiliSearch - Javascript API
     * Author: Quentin de Quelen <quentin@meilisearch.com>
     * Copyright: 2019, MeiliSearch
     */

    var MeiliSearch =
    /** @class */
    function () {
      function MeiliSearch(config) {
        config.host = HttpRequests.addTrailingSlash(config.host);
        this.config = config;
        this.httpRequest = new HttpRequests(config);
      }

      MeiliSearch.getApiRoutes = function () {
        return MeiliSearch.apiRoutes;
      };

      MeiliSearch.getRouteConstructors = function () {
        return MeiliSearch.routeConstructors;
      };
      /**
       * Return an Index instance
       * @memberof MeiliSearch
       * @method index
       */


      MeiliSearch.prototype.index = function (indexUid) {
        return new Index(this.config, indexUid);
      };
      /**
       * Gather information about an index by calling MeiliSearch and
       * return an Index instance with the gathered information
       * @memberof MeiliSearch
       * @method getIndex
       */


      MeiliSearch.prototype.getIndex = function (indexUid) {
        return __awaiter(this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            return [2
            /*return*/
            , new Index(this.config, indexUid).fetchInfo()];
          });
        });
      };
      /**
       * Get an index or create it if it does not exist
       * @memberof MeiliSearch
       * @method getOrCreateIndex
       */


      MeiliSearch.prototype.getOrCreateIndex = function (uid, options) {
        if (options === void 0) {
          options = {};
        }

        return __awaiter(this, void 0, void 0, function () {
          var index, e_1;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                _a.trys.push([0, 2,, 3]);

                return [4
                /*yield*/
                , this.getIndex(uid)];

              case 1:
                index = _a.sent();
                return [2
                /*return*/
                , index];

              case 2:
                e_1 = _a.sent();

                if (e_1.errorCode === 'index_not_found') {
                  return [2
                  /*return*/
                  , this.createIndex(uid, options)];
                }

                throw new MeiliSearchApiError(e_1, e_1.status);

              case 3:
                return [2
                /*return*/
                ];
            }
          });
        });
      };
      /**
       * List all indexes in the database
       * @memberof MeiliSearch
       * @method listIndexes
       */


      MeiliSearch.prototype.listIndexes = function () {
        return __awaiter(this, void 0, void 0, function () {
          var url;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = MeiliSearch.apiRoutes.listIndexes;
                return [4
                /*yield*/
                , this.httpRequest.get(url)];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      };
      /**
       * Create a new index
       * @memberof MeiliSearch
       * @method createIndex
       */


      MeiliSearch.prototype.createIndex = function (uid, options) {
        if (options === void 0) {
          options = {};
        }

        return __awaiter(this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                return [4
                /*yield*/
                , Index.create(this.config, uid, options)];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      };
      /**
       * Update an index
       * @memberof MeiliSearch
       * @method updateIndex
       */


      MeiliSearch.prototype.updateIndex = function (uid, options) {
        if (options === void 0) {
          options = {};
        }

        return __awaiter(this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            return [2
            /*return*/
            , new Index(this.config, uid).update(options)];
          });
        });
      };
      /**
       * Delete an index
       * @memberof MeiliSearch
       * @method deleteIndex
       */


      MeiliSearch.prototype.deleteIndex = function (uid) {
        return __awaiter(this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            return [2
            /*return*/
            , new Index(this.config, uid)["delete"]()];
          });
        });
      }; ///
      /// KEYS
      ///

      /**
       * Get private and public key
       * @memberof MeiliSearch
       * @method getKey
       */


      MeiliSearch.prototype.getKeys = function () {
        return __awaiter(this, void 0, void 0, function () {
          var url;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = MeiliSearch.apiRoutes.getKeys;
                return [4
                /*yield*/
                , this.httpRequest.get(url)];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      }; ///
      /// HEALTH
      ///

      /**
       * Checks if the server is healthy, otherwise an error will be thrown.
       *
       * @memberof MeiliSearch
       * @method isHealthy
       */


      MeiliSearch.prototype.isHealthy = function () {
        return __awaiter(this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                return [4
                /*yield*/
                , this.httpRequest.get(MeiliSearch.apiRoutes.isHealthy).then(function () {
                  return true;
                })];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      }; ///
      /// STATS
      ///

      /**
       * Get the stats of all the database
       * @memberof MeiliSearch
       * @method stats
       */


      MeiliSearch.prototype.stats = function () {
        return __awaiter(this, void 0, void 0, function () {
          var url;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = MeiliSearch.apiRoutes.stats;
                return [4
                /*yield*/
                , this.httpRequest.get(url)];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      };
      /**
       * Get the version of MeiliSearch
       * @memberof MeiliSearch
       * @method version
       */


      MeiliSearch.prototype.version = function () {
        return __awaiter(this, void 0, void 0, function () {
          var url;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = MeiliSearch.apiRoutes.version;
                return [4
                /*yield*/
                , this.httpRequest.get(url)];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      }; ///
      /// DUMPS
      ///

      /**
       * Triggers a dump creation process
       * @memberof MeiliSearch
       * @method createDump
       */


      MeiliSearch.prototype.createDump = function () {
        return __awaiter(this, void 0, void 0, function () {
          var url;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = MeiliSearch.apiRoutes.createDump;
                return [4
                /*yield*/
                , this.httpRequest.post(url)];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      };
      /**
       * Get the status of a dump creation process
       * @memberof MeiliSearch
       * @method getDumpStatus
       */


      MeiliSearch.prototype.getDumpStatus = function (dumpUid) {
        return __awaiter(this, void 0, void 0, function () {
          var url;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                url = MeiliSearch.routeConstructors.getDumpStatus(dumpUid);
                return [4
                /*yield*/
                , this.httpRequest.get(url)];

              case 1:
                return [2
                /*return*/
                , _a.sent()];
            }
          });
        });
      };

      MeiliSearch.apiRoutes = {
        listIndexes: 'indexes',
        getKeys: 'keys',
        isHealthy: 'health',
        stats: 'stats',
        version: 'version',
        createDump: 'dumps'
      };
      MeiliSearch.routeConstructors = {
        getDumpStatus: function getDumpStatus(dumpUid) {
          return "dumps/" + dumpUid + "/status";
        }
      };
      return MeiliSearch;
    }();

    exports.MeiliSearch = MeiliSearch;

    Object.defineProperty(exports, '__esModule', { value: true });

})));


/***/ }),

/***/ 467:
/***/ ((module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Stream = _interopDefault(__nccwpck_require__(413));
var http = _interopDefault(__nccwpck_require__(605));
var Url = _interopDefault(__nccwpck_require__(835));
var https = _interopDefault(__nccwpck_require__(211));
var zlib = _interopDefault(__nccwpck_require__(761));

// Based on https://github.com/tmpvar/jsdom/blob/aa85b2abf07766ff7bf5c1f6daafb3726f2f2db5/lib/jsdom/living/blob.js

// fix for "Readable" isn't a named export issue
const Readable = Stream.Readable;

const BUFFER = Symbol('buffer');
const TYPE = Symbol('type');

class Blob {
	constructor() {
		this[TYPE] = '';

		const blobParts = arguments[0];
		const options = arguments[1];

		const buffers = [];
		let size = 0;

		if (blobParts) {
			const a = blobParts;
			const length = Number(a.length);
			for (let i = 0; i < length; i++) {
				const element = a[i];
				let buffer;
				if (element instanceof Buffer) {
					buffer = element;
				} else if (ArrayBuffer.isView(element)) {
					buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
				} else if (element instanceof ArrayBuffer) {
					buffer = Buffer.from(element);
				} else if (element instanceof Blob) {
					buffer = element[BUFFER];
				} else {
					buffer = Buffer.from(typeof element === 'string' ? element : String(element));
				}
				size += buffer.length;
				buffers.push(buffer);
			}
		}

		this[BUFFER] = Buffer.concat(buffers);

		let type = options && options.type !== undefined && String(options.type).toLowerCase();
		if (type && !/[^\u0020-\u007E]/.test(type)) {
			this[TYPE] = type;
		}
	}
	get size() {
		return this[BUFFER].length;
	}
	get type() {
		return this[TYPE];
	}
	text() {
		return Promise.resolve(this[BUFFER].toString());
	}
	arrayBuffer() {
		const buf = this[BUFFER];
		const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
		return Promise.resolve(ab);
	}
	stream() {
		const readable = new Readable();
		readable._read = function () {};
		readable.push(this[BUFFER]);
		readable.push(null);
		return readable;
	}
	toString() {
		return '[object Blob]';
	}
	slice() {
		const size = this.size;

		const start = arguments[0];
		const end = arguments[1];
		let relativeStart, relativeEnd;
		if (start === undefined) {
			relativeStart = 0;
		} else if (start < 0) {
			relativeStart = Math.max(size + start, 0);
		} else {
			relativeStart = Math.min(start, size);
		}
		if (end === undefined) {
			relativeEnd = size;
		} else if (end < 0) {
			relativeEnd = Math.max(size + end, 0);
		} else {
			relativeEnd = Math.min(end, size);
		}
		const span = Math.max(relativeEnd - relativeStart, 0);

		const buffer = this[BUFFER];
		const slicedBuffer = buffer.slice(relativeStart, relativeStart + span);
		const blob = new Blob([], { type: arguments[2] });
		blob[BUFFER] = slicedBuffer;
		return blob;
	}
}

Object.defineProperties(Blob.prototype, {
	size: { enumerable: true },
	type: { enumerable: true },
	slice: { enumerable: true }
});

Object.defineProperty(Blob.prototype, Symbol.toStringTag, {
	value: 'Blob',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * fetch-error.js
 *
 * FetchError interface for operational errors
 */

/**
 * Create FetchError instance
 *
 * @param   String      message      Error message for human
 * @param   String      type         Error type for machine
 * @param   String      systemError  For Node.js system error
 * @return  FetchError
 */
function FetchError(message, type, systemError) {
  Error.call(this, message);

  this.message = message;
  this.type = type;

  // when err.type is `system`, err.code contains system error code
  if (systemError) {
    this.code = this.errno = systemError.code;
  }

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor);
}

FetchError.prototype = Object.create(Error.prototype);
FetchError.prototype.constructor = FetchError;
FetchError.prototype.name = 'FetchError';

let convert;
try {
	convert = __nccwpck_require__(877).convert;
} catch (e) {}

const INTERNALS = Symbol('Body internals');

// fix an issue where "PassThrough" isn't a named export for node <10
const PassThrough = Stream.PassThrough;

/**
 * Body mixin
 *
 * Ref: https://fetch.spec.whatwg.org/#body
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
function Body(body) {
	var _this = this;

	var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	    _ref$size = _ref.size;

	let size = _ref$size === undefined ? 0 : _ref$size;
	var _ref$timeout = _ref.timeout;
	let timeout = _ref$timeout === undefined ? 0 : _ref$timeout;

	if (body == null) {
		// body is undefined or null
		body = null;
	} else if (isURLSearchParams(body)) {
		// body is a URLSearchParams
		body = Buffer.from(body.toString());
	} else if (isBlob(body)) ; else if (Buffer.isBuffer(body)) ; else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is ArrayBuffer
		body = Buffer.from(body);
	} else if (ArrayBuffer.isView(body)) {
		// body is ArrayBufferView
		body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
	} else if (body instanceof Stream) ; else {
		// none of the above
		// coerce to string then buffer
		body = Buffer.from(String(body));
	}
	this[INTERNALS] = {
		body,
		disturbed: false,
		error: null
	};
	this.size = size;
	this.timeout = timeout;

	if (body instanceof Stream) {
		body.on('error', function (err) {
			const error = err.name === 'AbortError' ? err : new FetchError(`Invalid response body while trying to fetch ${_this.url}: ${err.message}`, 'system', err);
			_this[INTERNALS].error = error;
		});
	}
}

Body.prototype = {
	get body() {
		return this[INTERNALS].body;
	},

	get bodyUsed() {
		return this[INTERNALS].disturbed;
	},

	/**
  * Decode response as ArrayBuffer
  *
  * @return  Promise
  */
	arrayBuffer() {
		return consumeBody.call(this).then(function (buf) {
			return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
		});
	},

	/**
  * Return raw response as Blob
  *
  * @return Promise
  */
	blob() {
		let ct = this.headers && this.headers.get('content-type') || '';
		return consumeBody.call(this).then(function (buf) {
			return Object.assign(
			// Prevent copying
			new Blob([], {
				type: ct.toLowerCase()
			}), {
				[BUFFER]: buf
			});
		});
	},

	/**
  * Decode response as json
  *
  * @return  Promise
  */
	json() {
		var _this2 = this;

		return consumeBody.call(this).then(function (buffer) {
			try {
				return JSON.parse(buffer.toString());
			} catch (err) {
				return Body.Promise.reject(new FetchError(`invalid json response body at ${_this2.url} reason: ${err.message}`, 'invalid-json'));
			}
		});
	},

	/**
  * Decode response as text
  *
  * @return  Promise
  */
	text() {
		return consumeBody.call(this).then(function (buffer) {
			return buffer.toString();
		});
	},

	/**
  * Decode response as buffer (non-spec api)
  *
  * @return  Promise
  */
	buffer() {
		return consumeBody.call(this);
	},

	/**
  * Decode response as text, while automatically detecting the encoding and
  * trying to decode to UTF-8 (non-spec api)
  *
  * @return  Promise
  */
	textConverted() {
		var _this3 = this;

		return consumeBody.call(this).then(function (buffer) {
			return convertBody(buffer, _this3.headers);
		});
	}
};

// In browsers, all properties are enumerable.
Object.defineProperties(Body.prototype, {
	body: { enumerable: true },
	bodyUsed: { enumerable: true },
	arrayBuffer: { enumerable: true },
	blob: { enumerable: true },
	json: { enumerable: true },
	text: { enumerable: true }
});

Body.mixIn = function (proto) {
	for (const name of Object.getOwnPropertyNames(Body.prototype)) {
		// istanbul ignore else: future proof
		if (!(name in proto)) {
			const desc = Object.getOwnPropertyDescriptor(Body.prototype, name);
			Object.defineProperty(proto, name, desc);
		}
	}
};

/**
 * Consume and convert an entire Body to a Buffer.
 *
 * Ref: https://fetch.spec.whatwg.org/#concept-body-consume-body
 *
 * @return  Promise
 */
function consumeBody() {
	var _this4 = this;

	if (this[INTERNALS].disturbed) {
		return Body.Promise.reject(new TypeError(`body used already for: ${this.url}`));
	}

	this[INTERNALS].disturbed = true;

	if (this[INTERNALS].error) {
		return Body.Promise.reject(this[INTERNALS].error);
	}

	let body = this.body;

	// body is null
	if (body === null) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	// body is blob
	if (isBlob(body)) {
		body = body.stream();
	}

	// body is buffer
	if (Buffer.isBuffer(body)) {
		return Body.Promise.resolve(body);
	}

	// istanbul ignore if: should never happen
	if (!(body instanceof Stream)) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	// body is stream
	// get ready to actually consume the body
	let accum = [];
	let accumBytes = 0;
	let abort = false;

	return new Body.Promise(function (resolve, reject) {
		let resTimeout;

		// allow timeout on slow response body
		if (_this4.timeout) {
			resTimeout = setTimeout(function () {
				abort = true;
				reject(new FetchError(`Response timeout while trying to fetch ${_this4.url} (over ${_this4.timeout}ms)`, 'body-timeout'));
			}, _this4.timeout);
		}

		// handle stream errors
		body.on('error', function (err) {
			if (err.name === 'AbortError') {
				// if the request was aborted, reject with this Error
				abort = true;
				reject(err);
			} else {
				// other errors, such as incorrect content-encoding
				reject(new FetchError(`Invalid response body while trying to fetch ${_this4.url}: ${err.message}`, 'system', err));
			}
		});

		body.on('data', function (chunk) {
			if (abort || chunk === null) {
				return;
			}

			if (_this4.size && accumBytes + chunk.length > _this4.size) {
				abort = true;
				reject(new FetchError(`content size at ${_this4.url} over limit: ${_this4.size}`, 'max-size'));
				return;
			}

			accumBytes += chunk.length;
			accum.push(chunk);
		});

		body.on('end', function () {
			if (abort) {
				return;
			}

			clearTimeout(resTimeout);

			try {
				resolve(Buffer.concat(accum, accumBytes));
			} catch (err) {
				// handle streams that have accumulated too much data (issue #414)
				reject(new FetchError(`Could not create Buffer from response body for ${_this4.url}: ${err.message}`, 'system', err));
			}
		});
	});
}

/**
 * Detect buffer encoding and convert to target encoding
 * ref: http://www.w3.org/TR/2011/WD-html5-20110113/parsing.html#determining-the-character-encoding
 *
 * @param   Buffer  buffer    Incoming buffer
 * @param   String  encoding  Target encoding
 * @return  String
 */
function convertBody(buffer, headers) {
	if (typeof convert !== 'function') {
		throw new Error('The package `encoding` must be installed to use the textConverted() function');
	}

	const ct = headers.get('content-type');
	let charset = 'utf-8';
	let res, str;

	// header
	if (ct) {
		res = /charset=([^;]*)/i.exec(ct);
	}

	// no charset in content type, peek at response body for at most 1024 bytes
	str = buffer.slice(0, 1024).toString();

	// html5
	if (!res && str) {
		res = /<meta.+?charset=(['"])(.+?)\1/i.exec(str);
	}

	// html4
	if (!res && str) {
		res = /<meta[\s]+?http-equiv=(['"])content-type\1[\s]+?content=(['"])(.+?)\2/i.exec(str);
		if (!res) {
			res = /<meta[\s]+?content=(['"])(.+?)\1[\s]+?http-equiv=(['"])content-type\3/i.exec(str);
			if (res) {
				res.pop(); // drop last quote
			}
		}

		if (res) {
			res = /charset=(.*)/i.exec(res.pop());
		}
	}

	// xml
	if (!res && str) {
		res = /<\?xml.+?encoding=(['"])(.+?)\1/i.exec(str);
	}

	// found charset
	if (res) {
		charset = res.pop();

		// prevent decode issues when sites use incorrect encoding
		// ref: https://hsivonen.fi/encoding-menu/
		if (charset === 'gb2312' || charset === 'gbk') {
			charset = 'gb18030';
		}
	}

	// turn raw buffers into a single utf-8 buffer
	return convert(buffer, 'UTF-8', charset).toString();
}

/**
 * Detect a URLSearchParams object
 * ref: https://github.com/bitinn/node-fetch/issues/296#issuecomment-307598143
 *
 * @param   Object  obj     Object to detect by type or brand
 * @return  String
 */
function isURLSearchParams(obj) {
	// Duck-typing as a necessary condition.
	if (typeof obj !== 'object' || typeof obj.append !== 'function' || typeof obj.delete !== 'function' || typeof obj.get !== 'function' || typeof obj.getAll !== 'function' || typeof obj.has !== 'function' || typeof obj.set !== 'function') {
		return false;
	}

	// Brand-checking and more duck-typing as optional condition.
	return obj.constructor.name === 'URLSearchParams' || Object.prototype.toString.call(obj) === '[object URLSearchParams]' || typeof obj.sort === 'function';
}

/**
 * Check if `obj` is a W3C `Blob` object (which `File` inherits from)
 * @param  {*} obj
 * @return {boolean}
 */
function isBlob(obj) {
	return typeof obj === 'object' && typeof obj.arrayBuffer === 'function' && typeof obj.type === 'string' && typeof obj.stream === 'function' && typeof obj.constructor === 'function' && typeof obj.constructor.name === 'string' && /^(Blob|File)$/.test(obj.constructor.name) && /^(Blob|File)$/.test(obj[Symbol.toStringTag]);
}

/**
 * Clone body given Res/Req instance
 *
 * @param   Mixed  instance  Response or Request instance
 * @return  Mixed
 */
function clone(instance) {
	let p1, p2;
	let body = instance.body;

	// don't allow cloning a used body
	if (instance.bodyUsed) {
		throw new Error('cannot clone body after it is used');
	}

	// check that body is a stream and not form-data object
	// note: we can't clone the form-data object without having it as a dependency
	if (body instanceof Stream && typeof body.getBoundary !== 'function') {
		// tee instance body
		p1 = new PassThrough();
		p2 = new PassThrough();
		body.pipe(p1);
		body.pipe(p2);
		// set instance body to teed body and return the other teed body
		instance[INTERNALS].body = p1;
		body = p2;
	}

	return body;
}

/**
 * Performs the operation "extract a `Content-Type` value from |object|" as
 * specified in the specification:
 * https://fetch.spec.whatwg.org/#concept-bodyinit-extract
 *
 * This function assumes that instance.body is present.
 *
 * @param   Mixed  instance  Any options.body input
 */
function extractContentType(body) {
	if (body === null) {
		// body is null
		return null;
	} else if (typeof body === 'string') {
		// body is string
		return 'text/plain;charset=UTF-8';
	} else if (isURLSearchParams(body)) {
		// body is a URLSearchParams
		return 'application/x-www-form-urlencoded;charset=UTF-8';
	} else if (isBlob(body)) {
		// body is blob
		return body.type || null;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return null;
	} else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is ArrayBuffer
		return null;
	} else if (ArrayBuffer.isView(body)) {
		// body is ArrayBufferView
		return null;
	} else if (typeof body.getBoundary === 'function') {
		// detect form data input from form-data module
		return `multipart/form-data;boundary=${body.getBoundary()}`;
	} else if (body instanceof Stream) {
		// body is stream
		// can't really do much about this
		return null;
	} else {
		// Body constructor defaults other things to string
		return 'text/plain;charset=UTF-8';
	}
}

/**
 * The Fetch Standard treats this as if "total bytes" is a property on the body.
 * For us, we have to explicitly get it with a function.
 *
 * ref: https://fetch.spec.whatwg.org/#concept-body-total-bytes
 *
 * @param   Body    instance   Instance of Body
 * @return  Number?            Number of bytes, or null if not possible
 */
function getTotalBytes(instance) {
	const body = instance.body;


	if (body === null) {
		// body is null
		return 0;
	} else if (isBlob(body)) {
		return body.size;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return body.length;
	} else if (body && typeof body.getLengthSync === 'function') {
		// detect form data input from form-data module
		if (body._lengthRetrievers && body._lengthRetrievers.length == 0 || // 1.x
		body.hasKnownLength && body.hasKnownLength()) {
			// 2.x
			return body.getLengthSync();
		}
		return null;
	} else {
		// body is stream
		return null;
	}
}

/**
 * Write a Body to a Node.js WritableStream (e.g. http.Request) object.
 *
 * @param   Body    instance   Instance of Body
 * @return  Void
 */
function writeToStream(dest, instance) {
	const body = instance.body;


	if (body === null) {
		// body is null
		dest.end();
	} else if (isBlob(body)) {
		body.stream().pipe(dest);
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		dest.write(body);
		dest.end();
	} else {
		// body is stream
		body.pipe(dest);
	}
}

// expose Promise
Body.Promise = global.Promise;

/**
 * headers.js
 *
 * Headers class offers convenient helpers
 */

const invalidTokenRegex = /[^\^_`a-zA-Z\-0-9!#$%&'*+.|~]/;
const invalidHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/;

function validateName(name) {
	name = `${name}`;
	if (invalidTokenRegex.test(name) || name === '') {
		throw new TypeError(`${name} is not a legal HTTP header name`);
	}
}

function validateValue(value) {
	value = `${value}`;
	if (invalidHeaderCharRegex.test(value)) {
		throw new TypeError(`${value} is not a legal HTTP header value`);
	}
}

/**
 * Find the key in the map object given a header name.
 *
 * Returns undefined if not found.
 *
 * @param   String  name  Header name
 * @return  String|Undefined
 */
function find(map, name) {
	name = name.toLowerCase();
	for (const key in map) {
		if (key.toLowerCase() === name) {
			return key;
		}
	}
	return undefined;
}

const MAP = Symbol('map');
class Headers {
	/**
  * Headers class
  *
  * @param   Object  headers  Response headers
  * @return  Void
  */
	constructor() {
		let init = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

		this[MAP] = Object.create(null);

		if (init instanceof Headers) {
			const rawHeaders = init.raw();
			const headerNames = Object.keys(rawHeaders);

			for (const headerName of headerNames) {
				for (const value of rawHeaders[headerName]) {
					this.append(headerName, value);
				}
			}

			return;
		}

		// We don't worry about converting prop to ByteString here as append()
		// will handle it.
		if (init == null) ; else if (typeof init === 'object') {
			const method = init[Symbol.iterator];
			if (method != null) {
				if (typeof method !== 'function') {
					throw new TypeError('Header pairs must be iterable');
				}

				// sequence<sequence<ByteString>>
				// Note: per spec we have to first exhaust the lists then process them
				const pairs = [];
				for (const pair of init) {
					if (typeof pair !== 'object' || typeof pair[Symbol.iterator] !== 'function') {
						throw new TypeError('Each header pair must be iterable');
					}
					pairs.push(Array.from(pair));
				}

				for (const pair of pairs) {
					if (pair.length !== 2) {
						throw new TypeError('Each header pair must be a name/value tuple');
					}
					this.append(pair[0], pair[1]);
				}
			} else {
				// record<ByteString, ByteString>
				for (const key of Object.keys(init)) {
					const value = init[key];
					this.append(key, value);
				}
			}
		} else {
			throw new TypeError('Provided initializer must be an object');
		}
	}

	/**
  * Return combined header value given name
  *
  * @param   String  name  Header name
  * @return  Mixed
  */
	get(name) {
		name = `${name}`;
		validateName(name);
		const key = find(this[MAP], name);
		if (key === undefined) {
			return null;
		}

		return this[MAP][key].join(', ');
	}

	/**
  * Iterate over all headers
  *
  * @param   Function  callback  Executed for each item with parameters (value, name, thisArg)
  * @param   Boolean   thisArg   `this` context for callback function
  * @return  Void
  */
	forEach(callback) {
		let thisArg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

		let pairs = getHeaders(this);
		let i = 0;
		while (i < pairs.length) {
			var _pairs$i = pairs[i];
			const name = _pairs$i[0],
			      value = _pairs$i[1];

			callback.call(thisArg, value, name, this);
			pairs = getHeaders(this);
			i++;
		}
	}

	/**
  * Overwrite header values given name
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */
	set(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find(this[MAP], name);
		this[MAP][key !== undefined ? key : name] = [value];
	}

	/**
  * Append a value onto existing header
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */
	append(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find(this[MAP], name);
		if (key !== undefined) {
			this[MAP][key].push(value);
		} else {
			this[MAP][name] = [value];
		}
	}

	/**
  * Check for header name existence
  *
  * @param   String   name  Header name
  * @return  Boolean
  */
	has(name) {
		name = `${name}`;
		validateName(name);
		return find(this[MAP], name) !== undefined;
	}

	/**
  * Delete all header values given name
  *
  * @param   String  name  Header name
  * @return  Void
  */
	delete(name) {
		name = `${name}`;
		validateName(name);
		const key = find(this[MAP], name);
		if (key !== undefined) {
			delete this[MAP][key];
		}
	}

	/**
  * Return raw headers (non-spec api)
  *
  * @return  Object
  */
	raw() {
		return this[MAP];
	}

	/**
  * Get an iterator on keys.
  *
  * @return  Iterator
  */
	keys() {
		return createHeadersIterator(this, 'key');
	}

	/**
  * Get an iterator on values.
  *
  * @return  Iterator
  */
	values() {
		return createHeadersIterator(this, 'value');
	}

	/**
  * Get an iterator on entries.
  *
  * This is the default iterator of the Headers object.
  *
  * @return  Iterator
  */
	[Symbol.iterator]() {
		return createHeadersIterator(this, 'key+value');
	}
}
Headers.prototype.entries = Headers.prototype[Symbol.iterator];

Object.defineProperty(Headers.prototype, Symbol.toStringTag, {
	value: 'Headers',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Headers.prototype, {
	get: { enumerable: true },
	forEach: { enumerable: true },
	set: { enumerable: true },
	append: { enumerable: true },
	has: { enumerable: true },
	delete: { enumerable: true },
	keys: { enumerable: true },
	values: { enumerable: true },
	entries: { enumerable: true }
});

function getHeaders(headers) {
	let kind = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'key+value';

	const keys = Object.keys(headers[MAP]).sort();
	return keys.map(kind === 'key' ? function (k) {
		return k.toLowerCase();
	} : kind === 'value' ? function (k) {
		return headers[MAP][k].join(', ');
	} : function (k) {
		return [k.toLowerCase(), headers[MAP][k].join(', ')];
	});
}

const INTERNAL = Symbol('internal');

function createHeadersIterator(target, kind) {
	const iterator = Object.create(HeadersIteratorPrototype);
	iterator[INTERNAL] = {
		target,
		kind,
		index: 0
	};
	return iterator;
}

const HeadersIteratorPrototype = Object.setPrototypeOf({
	next() {
		// istanbul ignore if
		if (!this || Object.getPrototypeOf(this) !== HeadersIteratorPrototype) {
			throw new TypeError('Value of `this` is not a HeadersIterator');
		}

		var _INTERNAL = this[INTERNAL];
		const target = _INTERNAL.target,
		      kind = _INTERNAL.kind,
		      index = _INTERNAL.index;

		const values = getHeaders(target, kind);
		const len = values.length;
		if (index >= len) {
			return {
				value: undefined,
				done: true
			};
		}

		this[INTERNAL].index = index + 1;

		return {
			value: values[index],
			done: false
		};
	}
}, Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]())));

Object.defineProperty(HeadersIteratorPrototype, Symbol.toStringTag, {
	value: 'HeadersIterator',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * Export the Headers object in a form that Node.js can consume.
 *
 * @param   Headers  headers
 * @return  Object
 */
function exportNodeCompatibleHeaders(headers) {
	const obj = Object.assign({ __proto__: null }, headers[MAP]);

	// http.request() only supports string as Host header. This hack makes
	// specifying custom Host header possible.
	const hostHeaderKey = find(headers[MAP], 'Host');
	if (hostHeaderKey !== undefined) {
		obj[hostHeaderKey] = obj[hostHeaderKey][0];
	}

	return obj;
}

/**
 * Create a Headers object from an object of headers, ignoring those that do
 * not conform to HTTP grammar productions.
 *
 * @param   Object  obj  Object of headers
 * @return  Headers
 */
function createHeadersLenient(obj) {
	const headers = new Headers();
	for (const name of Object.keys(obj)) {
		if (invalidTokenRegex.test(name)) {
			continue;
		}
		if (Array.isArray(obj[name])) {
			for (const val of obj[name]) {
				if (invalidHeaderCharRegex.test(val)) {
					continue;
				}
				if (headers[MAP][name] === undefined) {
					headers[MAP][name] = [val];
				} else {
					headers[MAP][name].push(val);
				}
			}
		} else if (!invalidHeaderCharRegex.test(obj[name])) {
			headers[MAP][name] = [obj[name]];
		}
	}
	return headers;
}

const INTERNALS$1 = Symbol('Response internals');

// fix an issue where "STATUS_CODES" aren't a named export for node <10
const STATUS_CODES = http.STATUS_CODES;

/**
 * Response class
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
class Response {
	constructor() {
		let body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
		let opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		Body.call(this, body, opts);

		const status = opts.status || 200;
		const headers = new Headers(opts.headers);

		if (body != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(body);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		this[INTERNALS$1] = {
			url: opts.url,
			status,
			statusText: opts.statusText || STATUS_CODES[status],
			headers,
			counter: opts.counter
		};
	}

	get url() {
		return this[INTERNALS$1].url || '';
	}

	get status() {
		return this[INTERNALS$1].status;
	}

	/**
  * Convenience property representing if the request ended normally
  */
	get ok() {
		return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
	}

	get redirected() {
		return this[INTERNALS$1].counter > 0;
	}

	get statusText() {
		return this[INTERNALS$1].statusText;
	}

	get headers() {
		return this[INTERNALS$1].headers;
	}

	/**
  * Clone this response
  *
  * @return  Response
  */
	clone() {
		return new Response(clone(this), {
			url: this.url,
			status: this.status,
			statusText: this.statusText,
			headers: this.headers,
			ok: this.ok,
			redirected: this.redirected
		});
	}
}

Body.mixIn(Response.prototype);

Object.defineProperties(Response.prototype, {
	url: { enumerable: true },
	status: { enumerable: true },
	ok: { enumerable: true },
	redirected: { enumerable: true },
	statusText: { enumerable: true },
	headers: { enumerable: true },
	clone: { enumerable: true }
});

Object.defineProperty(Response.prototype, Symbol.toStringTag, {
	value: 'Response',
	writable: false,
	enumerable: false,
	configurable: true
});

const INTERNALS$2 = Symbol('Request internals');

// fix an issue where "format", "parse" aren't a named export for node <10
const parse_url = Url.parse;
const format_url = Url.format;

const streamDestructionSupported = 'destroy' in Stream.Readable.prototype;

/**
 * Check if a value is an instance of Request.
 *
 * @param   Mixed   input
 * @return  Boolean
 */
function isRequest(input) {
	return typeof input === 'object' && typeof input[INTERNALS$2] === 'object';
}

function isAbortSignal(signal) {
	const proto = signal && typeof signal === 'object' && Object.getPrototypeOf(signal);
	return !!(proto && proto.constructor.name === 'AbortSignal');
}

/**
 * Request class
 *
 * @param   Mixed   input  Url or Request instance
 * @param   Object  init   Custom options
 * @return  Void
 */
class Request {
	constructor(input) {
		let init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		let parsedURL;

		// normalize input
		if (!isRequest(input)) {
			if (input && input.href) {
				// in order to support Node.js' Url objects; though WHATWG's URL objects
				// will fall into this branch also (since their `toString()` will return
				// `href` property anyway)
				parsedURL = parse_url(input.href);
			} else {
				// coerce input to a string before attempting to parse
				parsedURL = parse_url(`${input}`);
			}
			input = {};
		} else {
			parsedURL = parse_url(input.url);
		}

		let method = init.method || input.method || 'GET';
		method = method.toUpperCase();

		if ((init.body != null || isRequest(input) && input.body !== null) && (method === 'GET' || method === 'HEAD')) {
			throw new TypeError('Request with GET/HEAD method cannot have body');
		}

		let inputBody = init.body != null ? init.body : isRequest(input) && input.body !== null ? clone(input) : null;

		Body.call(this, inputBody, {
			timeout: init.timeout || input.timeout || 0,
			size: init.size || input.size || 0
		});

		const headers = new Headers(init.headers || input.headers || {});

		if (inputBody != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(inputBody);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		let signal = isRequest(input) ? input.signal : null;
		if ('signal' in init) signal = init.signal;

		if (signal != null && !isAbortSignal(signal)) {
			throw new TypeError('Expected signal to be an instanceof AbortSignal');
		}

		this[INTERNALS$2] = {
			method,
			redirect: init.redirect || input.redirect || 'follow',
			headers,
			parsedURL,
			signal
		};

		// node-fetch-only options
		this.follow = init.follow !== undefined ? init.follow : input.follow !== undefined ? input.follow : 20;
		this.compress = init.compress !== undefined ? init.compress : input.compress !== undefined ? input.compress : true;
		this.counter = init.counter || input.counter || 0;
		this.agent = init.agent || input.agent;
	}

	get method() {
		return this[INTERNALS$2].method;
	}

	get url() {
		return format_url(this[INTERNALS$2].parsedURL);
	}

	get headers() {
		return this[INTERNALS$2].headers;
	}

	get redirect() {
		return this[INTERNALS$2].redirect;
	}

	get signal() {
		return this[INTERNALS$2].signal;
	}

	/**
  * Clone this request
  *
  * @return  Request
  */
	clone() {
		return new Request(this);
	}
}

Body.mixIn(Request.prototype);

Object.defineProperty(Request.prototype, Symbol.toStringTag, {
	value: 'Request',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Request.prototype, {
	method: { enumerable: true },
	url: { enumerable: true },
	headers: { enumerable: true },
	redirect: { enumerable: true },
	clone: { enumerable: true },
	signal: { enumerable: true }
});

/**
 * Convert a Request to Node.js http request options.
 *
 * @param   Request  A Request instance
 * @return  Object   The options object to be passed to http.request
 */
function getNodeRequestOptions(request) {
	const parsedURL = request[INTERNALS$2].parsedURL;
	const headers = new Headers(request[INTERNALS$2].headers);

	// fetch step 1.3
	if (!headers.has('Accept')) {
		headers.set('Accept', '*/*');
	}

	// Basic fetch
	if (!parsedURL.protocol || !parsedURL.hostname) {
		throw new TypeError('Only absolute URLs are supported');
	}

	if (!/^https?:$/.test(parsedURL.protocol)) {
		throw new TypeError('Only HTTP(S) protocols are supported');
	}

	if (request.signal && request.body instanceof Stream.Readable && !streamDestructionSupported) {
		throw new Error('Cancellation of streamed requests with AbortSignal is not supported in node < 8');
	}

	// HTTP-network-or-cache fetch steps 2.4-2.7
	let contentLengthValue = null;
	if (request.body == null && /^(POST|PUT)$/i.test(request.method)) {
		contentLengthValue = '0';
	}
	if (request.body != null) {
		const totalBytes = getTotalBytes(request);
		if (typeof totalBytes === 'number') {
			contentLengthValue = String(totalBytes);
		}
	}
	if (contentLengthValue) {
		headers.set('Content-Length', contentLengthValue);
	}

	// HTTP-network-or-cache fetch step 2.11
	if (!headers.has('User-Agent')) {
		headers.set('User-Agent', 'node-fetch/1.0 (+https://github.com/bitinn/node-fetch)');
	}

	// HTTP-network-or-cache fetch step 2.15
	if (request.compress && !headers.has('Accept-Encoding')) {
		headers.set('Accept-Encoding', 'gzip,deflate');
	}

	let agent = request.agent;
	if (typeof agent === 'function') {
		agent = agent(parsedURL);
	}

	if (!headers.has('Connection') && !agent) {
		headers.set('Connection', 'close');
	}

	// HTTP-network fetch step 4.2
	// chunked encoding is handled by Node.js

	return Object.assign({}, parsedURL, {
		method: request.method,
		headers: exportNodeCompatibleHeaders(headers),
		agent
	});
}

/**
 * abort-error.js
 *
 * AbortError interface for cancelled requests
 */

/**
 * Create AbortError instance
 *
 * @param   String      message      Error message for human
 * @return  AbortError
 */
function AbortError(message) {
  Error.call(this, message);

  this.type = 'aborted';
  this.message = message;

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor);
}

AbortError.prototype = Object.create(Error.prototype);
AbortError.prototype.constructor = AbortError;
AbortError.prototype.name = 'AbortError';

// fix an issue where "PassThrough", "resolve" aren't a named export for node <10
const PassThrough$1 = Stream.PassThrough;
const resolve_url = Url.resolve;

/**
 * Fetch function
 *
 * @param   Mixed    url   Absolute url or Request instance
 * @param   Object   opts  Fetch options
 * @return  Promise
 */
function fetch(url, opts) {

	// allow custom promise
	if (!fetch.Promise) {
		throw new Error('native promise missing, set fetch.Promise to your favorite alternative');
	}

	Body.Promise = fetch.Promise;

	// wrap http.request into fetch
	return new fetch.Promise(function (resolve, reject) {
		// build request object
		const request = new Request(url, opts);
		const options = getNodeRequestOptions(request);

		const send = (options.protocol === 'https:' ? https : http).request;
		const signal = request.signal;

		let response = null;

		const abort = function abort() {
			let error = new AbortError('The user aborted a request.');
			reject(error);
			if (request.body && request.body instanceof Stream.Readable) {
				request.body.destroy(error);
			}
			if (!response || !response.body) return;
			response.body.emit('error', error);
		};

		if (signal && signal.aborted) {
			abort();
			return;
		}

		const abortAndFinalize = function abortAndFinalize() {
			abort();
			finalize();
		};

		// send request
		const req = send(options);
		let reqTimeout;

		if (signal) {
			signal.addEventListener('abort', abortAndFinalize);
		}

		function finalize() {
			req.abort();
			if (signal) signal.removeEventListener('abort', abortAndFinalize);
			clearTimeout(reqTimeout);
		}

		if (request.timeout) {
			req.once('socket', function (socket) {
				reqTimeout = setTimeout(function () {
					reject(new FetchError(`network timeout at: ${request.url}`, 'request-timeout'));
					finalize();
				}, request.timeout);
			});
		}

		req.on('error', function (err) {
			reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, 'system', err));
			finalize();
		});

		req.on('response', function (res) {
			clearTimeout(reqTimeout);

			const headers = createHeadersLenient(res.headers);

			// HTTP fetch step 5
			if (fetch.isRedirect(res.statusCode)) {
				// HTTP fetch step 5.2
				const location = headers.get('Location');

				// HTTP fetch step 5.3
				const locationURL = location === null ? null : resolve_url(request.url, location);

				// HTTP fetch step 5.5
				switch (request.redirect) {
					case 'error':
						reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, 'no-redirect'));
						finalize();
						return;
					case 'manual':
						// node-fetch-specific step: make manual redirect a bit easier to use by setting the Location header value to the resolved URL.
						if (locationURL !== null) {
							// handle corrupted header
							try {
								headers.set('Location', locationURL);
							} catch (err) {
								// istanbul ignore next: nodejs server prevent invalid response headers, we can't test this through normal request
								reject(err);
							}
						}
						break;
					case 'follow':
						// HTTP-redirect fetch step 2
						if (locationURL === null) {
							break;
						}

						// HTTP-redirect fetch step 5
						if (request.counter >= request.follow) {
							reject(new FetchError(`maximum redirect reached at: ${request.url}`, 'max-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 6 (counter increment)
						// Create a new Request object.
						const requestOpts = {
							headers: new Headers(request.headers),
							follow: request.follow,
							counter: request.counter + 1,
							agent: request.agent,
							compress: request.compress,
							method: request.method,
							body: request.body,
							signal: request.signal,
							timeout: request.timeout,
							size: request.size
						};

						// HTTP-redirect fetch step 9
						if (res.statusCode !== 303 && request.body && getTotalBytes(request) === null) {
							reject(new FetchError('Cannot follow redirect with body being a readable stream', 'unsupported-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 11
						if (res.statusCode === 303 || (res.statusCode === 301 || res.statusCode === 302) && request.method === 'POST') {
							requestOpts.method = 'GET';
							requestOpts.body = undefined;
							requestOpts.headers.delete('content-length');
						}

						// HTTP-redirect fetch step 15
						resolve(fetch(new Request(locationURL, requestOpts)));
						finalize();
						return;
				}
			}

			// prepare response
			res.once('end', function () {
				if (signal) signal.removeEventListener('abort', abortAndFinalize);
			});
			let body = res.pipe(new PassThrough$1());

			const response_options = {
				url: request.url,
				status: res.statusCode,
				statusText: res.statusMessage,
				headers: headers,
				size: request.size,
				timeout: request.timeout,
				counter: request.counter
			};

			// HTTP-network fetch step 12.1.1.3
			const codings = headers.get('Content-Encoding');

			// HTTP-network fetch step 12.1.1.4: handle content codings

			// in following scenarios we ignore compression support
			// 1. compression support is disabled
			// 2. HEAD request
			// 3. no Content-Encoding header
			// 4. no content response (204)
			// 5. content not modified response (304)
			if (!request.compress || request.method === 'HEAD' || codings === null || res.statusCode === 204 || res.statusCode === 304) {
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// For Node v6+
			// Be less strict when decoding compressed responses, since sometimes
			// servers send slightly invalid responses that are still accepted
			// by common browsers.
			// Always using Z_SYNC_FLUSH is what cURL does.
			const zlibOptions = {
				flush: zlib.Z_SYNC_FLUSH,
				finishFlush: zlib.Z_SYNC_FLUSH
			};

			// for gzip
			if (codings == 'gzip' || codings == 'x-gzip') {
				body = body.pipe(zlib.createGunzip(zlibOptions));
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// for deflate
			if (codings == 'deflate' || codings == 'x-deflate') {
				// handle the infamous raw deflate response from old servers
				// a hack for old IIS and Apache servers
				const raw = res.pipe(new PassThrough$1());
				raw.once('data', function (chunk) {
					// see http://stackoverflow.com/questions/37519828
					if ((chunk[0] & 0x0F) === 0x08) {
						body = body.pipe(zlib.createInflate());
					} else {
						body = body.pipe(zlib.createInflateRaw());
					}
					response = new Response(body, response_options);
					resolve(response);
				});
				return;
			}

			// for br
			if (codings == 'br' && typeof zlib.createBrotliDecompress === 'function') {
				body = body.pipe(zlib.createBrotliDecompress());
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// otherwise, use response as-is
			response = new Response(body, response_options);
			resolve(response);
		});

		writeToStream(req, request);
	});
}
/**
 * Redirect code matching
 *
 * @param   Number   code  Status code
 * @return  Boolean
 */
fetch.isRedirect = function (code) {
	return code === 301 || code === 302 || code === 303 || code === 307 || code === 308;
};

// expose Promise
fetch.Promise = global.Promise;

module.exports = exports = fetch;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.default = exports;
exports.Headers = Headers;
exports.Request = Request;
exports.Response = Response;
exports.FetchError = FetchError;


/***/ }),

/***/ 417:
/***/ (function(module) {

(function (global, factory) {
 true ? module.exports = factory() :
0;
}(this, (function () { 'use strict';

/* @flow */
/* @ts-check */

/**
 * Simple-Markdown
 * ===============
 *
 * Simple-Markdown's primary goal is to be easy to adapt. It aims
 * to be compliant with John Gruber's [Markdown Syntax page][1],
 * but compatiblity with other markdown implementations' edge-cases
 * will be sacrificed where it conflicts with simplicity or
 * extensibility.
 *
 * If your goal is to simply embed a standard markdown implementation
 * in your website, simple-markdown is probably not the best library
 * for you (although it should work). But if you have struggled to
 * customize an existing library to meet your needs, simple-markdown
 * might be able to help.
 *
 * Many of the regexes and original logic has been adapted from
 * the wonderful [marked.js](https://github.com/chjj/marked)
 *
 * LICENSE (MIT):
 * New code copyright (c) 2014-2019 Khan Academy & Aria Buckles.
 *
 * Portions adapted from marked.js copyright (c) 2011-2014
 * Christopher Jeffrey (https://github.com/chjj/).
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

// Typescript language & simple-markdown.d.ts references:
/// <reference lib="ES2018" />
/// <reference path="../simple-markdown.d.ts" />

/*::
// Flow Type Definitions:

type Capture =
    Array<string> & {index: number} |
    Array<string> & {index?: number};

type Attr = string | number | boolean | null | void;

type SingleASTNode = {
    type: string,
    [string]: any,
};

type UnTypedASTNode = {
    [string]: any
};

type ASTNode = SingleASTNode | Array<SingleASTNode>;

type State = {
    key?: string | number | void,
    inline?: ?boolean,
    [string]: any,
};

type ReactElement = React$Element<any>;
type ReactElements = React$Node;

type MatchFunction = { regex?: RegExp } & (
    source: string,
    state: State,
    prevCapture: string
) => ?Capture;

type Parser = (
    source: string,
    state?: ?State
) => Array<SingleASTNode>;

type ParseFunction = (
    capture: Capture,
    nestedParse: Parser,
    state: State,
) => (UnTypedASTNode | ASTNode);

type SingleNodeParseFunction = (
    capture: Capture,
    nestedParse: Parser,
    state: State,
) => UnTypedASTNode;

type Output<Result> = (
    node: ASTNode,
    state?: ?State
) => Result;

type NodeOutput<Result> = (
    node: SingleASTNode,
    nestedOutput: Output<Result>,
    state: State
) => Result;

type ArrayNodeOutput<Result> = (
    node: Array<SingleASTNode>,
    nestedOutput: Output<Result>,
    state: State
) => Result;

type ReactOutput = Output<ReactElements>;
type ReactNodeOutput = NodeOutput<ReactElements>;
type HtmlOutput = Output<string>;
type HtmlNodeOutput = NodeOutput<string>;

type ParserRule = {
    +order: number,
    +match: MatchFunction,
    +quality?: (capture: Capture, state: State, prevCapture: string) => number,
    +parse: ParseFunction,
};

type SingleNodeParserRule = {
    +order: number,
    +match: MatchFunction,
    +quality?: (capture: Capture, state: State, prevCapture: string) => number,
    +parse: SingleNodeParseFunction,
};

type ReactOutputRule = {
    // we allow null because some rules are never output results, and that's
    // legal as long as no parsers return an AST node matching that rule.
    // We don't use ? because this makes it be explicitly defined as either
    // a valid function or null, so it can't be forgotten.
    +react: ReactNodeOutput | null,
};

type HtmlOutputRule = {
    +html: HtmlNodeOutput | null,
};

type ArrayRule = {
    +react?: ArrayNodeOutput<ReactElements>,
    +html?: ArrayNodeOutput<string>,
    +[string]: ArrayNodeOutput<any>,
};

type ParserRules = {
    +Array?: ArrayRule,
    +[type: string]: ParserRule,
};

type OutputRules<Rule> = {
    +Array?: ArrayRule,
    +[type: string]: Rule
};
type Rules<OutputRule> = {
    +Array?: ArrayRule,
    +[type: string]: ParserRule & OutputRule,
};
type ReactRules = {
    +Array?: {
        +react: ArrayNodeOutput<ReactElements>,
    },
    +[type: string]: ParserRule & ReactOutputRule,
};
type HtmlRules = {
    +Array?: {
        +html: ArrayNodeOutput<string>,
    },
    +[type: string]: ParserRule & HtmlOutputRule,
};

// We want to clarify our defaultRules types a little bit more so clients can
// reuse defaultRules built-ins. So we make some stronger guarantess when
// we can:
type NonNullReactOutputRule = {
    +react: ReactNodeOutput,
};
type ElementReactOutputRule = {
    +react: NodeOutput<ReactElement>,
};
type TextReactOutputRule = {
    +react: NodeOutput<string>,
};
type NonNullHtmlOutputRule = {
    +html: HtmlNodeOutput,
};

type DefaultInRule = SingleNodeParserRule & ReactOutputRule & HtmlOutputRule;
type TextInOutRule = SingleNodeParserRule & TextReactOutputRule & NonNullHtmlOutputRule;
type LenientInOutRule = SingleNodeParserRule & NonNullReactOutputRule & NonNullHtmlOutputRule;
type DefaultInOutRule = SingleNodeParserRule & ElementReactOutputRule & NonNullHtmlOutputRule;

type DefaultRules = {
    +Array: {
        +react: ArrayNodeOutput<ReactElements>,
        +html: ArrayNodeOutput<string>
    },
    +heading: DefaultInOutRule,
    +nptable: DefaultInRule,
    +lheading: DefaultInRule,
    +hr: DefaultInOutRule,
    +codeBlock: DefaultInOutRule,
    +fence: DefaultInRule,
    +blockQuote: DefaultInOutRule,
    +list: DefaultInOutRule,
    +def: LenientInOutRule,
    +table: DefaultInOutRule,
    +tableSeparator: DefaultInRule,
    +newline: TextInOutRule,
    +paragraph: DefaultInOutRule,
    +escape: DefaultInRule,
    +autolink: DefaultInRule,
    +mailto: DefaultInRule,
    +url: DefaultInRule,
    +link: DefaultInOutRule,
    +image: DefaultInOutRule,
    +reflink: DefaultInRule,
    +refimage: DefaultInRule,
    +em: DefaultInOutRule,
    +strong: DefaultInOutRule,
    +u: DefaultInOutRule,
    +del: DefaultInOutRule,
    +inlineCode: DefaultInOutRule,
    +br: DefaultInOutRule,
    +text: TextInOutRule,
};

type RefNode = {
    type: string,
    content?: ASTNode,
    target?: string,
    title?: string,
    alt?: string,
};

// End Flow Definitions
*/

var CR_NEWLINE_R = /\r\n?/g;
var TAB_R = /\t/g;
var FORMFEED_R = /\f/g;

/**
 * Turn various whitespace into easy-to-process whitespace
 * @param {string} source
 * @returns {string}
 */
var preprocess = function(source /* : string */) {
    return source.replace(CR_NEWLINE_R, '\n')
            .replace(FORMFEED_R, '')
            .replace(TAB_R, '    ');
};

/**
 * @param {SimpleMarkdown.OptionalState} givenState
 * @param {SimpleMarkdown.OptionalState} defaultState
 * @returns {SimpleMarkdown.State}
 */
var populateInitialState = function(
    givenState /* : ?State */,
    defaultState /* : ?State */
) /* : State */{
    var state /* : State */ = givenState || {};
    if (defaultState != null) {
        for (var prop in defaultState) {
            if (Object.prototype.hasOwnProperty.call(defaultState, prop)) {
                state[prop] = defaultState[prop];
            }
        }
    }
    return state;
};

/**
 * Creates a parser for a given set of rules, with the precedence
 * specified as a list of rules.
 *
 * @param {SimpleMarkdown.ParserRules} rules
 *     an object containing
 *     rule type -> {match, order, parse} objects
 *     (lower order is higher precedence)
 * @param {SimpleMarkdown.OptionalState} [defaultState]
 *
 * @returns {SimpleMarkdown.Parser}
 *     The resulting parse function, with the following parameters:
 *     @source: the input source string to be parsed
 *     @state: an optional object to be threaded through parse
 *         calls. Allows clients to add stateful operations to
 *         parsing, such as keeping track of how many levels deep
 *         some nesting is. For an example use-case, see passage-ref
 *         parsing in src/widgets/passage/passage-markdown.jsx
 */
var parserFor = function(rules /*: ParserRules */, defaultState /*: ?State */) {
    // Sorts rules in order of increasing order, then
    // ascending rule name in case of ties.
    var ruleList = Object.keys(rules).filter(function(type) {
        var rule = rules[type];
        if (rule == null || rule.match == null) {
            return false;
        }
        var order = rule.order;
        if ((typeof order !== 'number' || !isFinite(order)) &&
                typeof console !== 'undefined') {
            console.warn(
                "simple-markdown: Invalid order for rule `" + type + "`: " +
                String(order)
            );
        }
        return true;
    });

    ruleList.sort(function(typeA, typeB) {
        var ruleA /* : ParserRule */ = /** @type {SimpleMarkdown.ParserRule} */ (rules[typeA] /*:: :any */);
        var ruleB /* : ParserRule */ = /** @type {SimpleMarkdown.ParserRule} */ (rules[typeB] /*:: :any */);
        var orderA = ruleA.order;
        var orderB = ruleB.order;

        // First sort based on increasing order
        if (orderA !== orderB) {
            return orderA - orderB;
        }

        var secondaryOrderA = ruleA.quality ? 0 : 1;
        var secondaryOrderB = ruleB.quality ? 0 : 1;

        if (secondaryOrderA !== secondaryOrderB) {
            return secondaryOrderA - secondaryOrderB;

        // Then based on increasing unicode lexicographic ordering
        } else if (typeA < typeB) {
            return -1;
        } else if (typeA > typeB) {
            return 1;

        } else {
            // Rules should never have the same name,
            // but this is provided for completeness.
            return 0;
        }
    });

    /** @type {SimpleMarkdown.State} */
    var latestState;
    /** @type {SimpleMarkdown.Parser} */
    var nestedParse = function(source /* : string */, state /* : ?State */) {
        /** @type Array<SimpleMarkdown.SingleASTNode> */
        var result = [];
        state = state || latestState;
        latestState = state;
        while (source) {
            // store the best match, it's rule, and quality:
            var ruleType = null;
            var rule = null;
            var capture = null;
            var quality = NaN;

            // loop control variables:
            var i = 0;
            var currRuleType = ruleList[0];
            var currRule /* : ParserRule */ = /** @type {SimpleMarkdown.ParserRule} */ ( rules[currRuleType] /*:: :any */ );

            do {
                var currOrder = currRule.order;
                var prevCaptureStr = state.prevCapture == null ? "" : state.prevCapture[0];
                var currCapture = currRule.match(source, state, prevCaptureStr);

                if (currCapture) {
                    var currQuality = currRule.quality ? currRule.quality(
                        currCapture,
                        state,
                        prevCaptureStr
                    ) : 0;
                    // This should always be true the first time because
                    // the initial quality is NaN (that's why there's the
                    // condition negation).
                    if (!(currQuality <= quality)) {
                        ruleType = currRuleType;
                        rule = currRule;
                        capture = currCapture;
                        quality = currQuality;
                    }
                }

                // Move on to the next item.
                // Note that this makes `currRule` be the next item
                i++;
                currRuleType = ruleList[i];
                currRule = /*::((*/ /** @type {SimpleMarkdown.ParserRule} */ (rules[currRuleType]) /*:: : any) : ParserRule)*/;

            } while (
                // keep looping while we're still within the ruleList
                currRule && (
                    // if we don't have a match yet, continue
                    !capture || (
                        // or if we have a match, but the next rule is
                        // at the same order, and has a quality measurement
                        // functions, then this rule must have a quality
                        // measurement function (since they are sorted before
                        // those without), and we need to check if there is
                        // a better quality match
                        currRule.order === currOrder &&
                        currRule.quality
                    )
                )
            );

            // TODO(aria): Write tests for these
            if (rule == null || capture == null /*:: || ruleType == null */) {
                throw new Error(
                    "Could not find a matching rule for the below " +
                    "content. The rule with highest `order` should " +
                    "always match content provided to it. Check " +
                    "the definition of `match` for '" +
                    ruleList[ruleList.length - 1] +
                    "'. It seems to not match the following source:\n" +
                    source
                );
            }
            if (capture.index) { // If present and non-zero, i.e. a non-^ regexp result:
                throw new Error(
                    "`match` must return a capture starting at index 0 " +
                    "(the current parse index). Did you forget a ^ at the " +
                    "start of the RegExp?"
                );
            }

            var parsed = rule.parse(capture, nestedParse, state);
            // We maintain the same object here so that rules can
            // store references to the objects they return and
            // modify them later. (oops sorry! but this adds a lot
            // of power--see reflinks.)
            if (Array.isArray(parsed)) {
                Array.prototype.push.apply(result, parsed);
            } else {
                // We also let rules override the default type of
                // their parsed node if they would like to, so that
                // there can be a single output function for all links,
                // even if there are several rules to parse them.
                if (parsed.type == null) {
                    parsed.type = ruleType;
                }
                result.push(/** @type {SimpleMarkdown.SingleASTNode} */ (parsed));
            }

            state.prevCapture = capture;
            source = source.substring(state.prevCapture[0].length);
        }
        return result;
    };

    /** @type {SimpleMarkdown.Parser} */
    var outerParse = function(source /* : string */, state /* : ?State */) {
        latestState = populateInitialState(state, defaultState);
        if (!latestState.inline && !latestState.disableAutoBlockNewlines) {
            source = source + "\n\n";
        }
        // We store the previous capture so that match functions can
        // use some limited amount of lookbehind. Lists use this to
        // ensure they don't match arbitrary '- ' or '* ' in inline
        // text (see the list rule for more information). This stores
        // the full regex capture object, if there is one.
        latestState.prevCapture = null;
        return nestedParse(preprocess(source), latestState);
    };
    return outerParse;
};

// Creates a match function for an inline scoped element from a regex
/** @type {(regex: RegExp) => SimpleMarkdown.MatchFunction} */
var inlineRegex = function(regex /* : RegExp */) {
    /** @type {SimpleMarkdown.MatchFunction} */
    var match /* : MatchFunction */ = function(source, state) {
        if (state.inline) {
            return regex.exec(source);
        } else {
            return null;
        }
    };
    match.regex = regex;
    return match;
};

// Creates a match function for a block scoped element from a regex
/** @type {(regex: RegExp) => SimpleMarkdown.MatchFunction} */
var blockRegex = function(regex /* : RegExp */) {
    /** @type {SimpleMarkdown.MatchFunction} */
    var match /* : MatchFunction */ = function(source, state) {
        if (state.inline) {
            return null;
        } else {
            return regex.exec(source);
        }
    };
    match.regex = regex;
    return match;
};

// Creates a match function from a regex, ignoring block/inline scope
/** @type {(regex: RegExp) => SimpleMarkdown.MatchFunction} */
var anyScopeRegex = function(regex /* : RegExp */) {
    /** @type {SimpleMarkdown.MatchFunction} */
    var match /* : MatchFunction */ = function(source, state) {
        return regex.exec(source);
    };
    match.regex = regex;
    return match;
};

var TYPE_SYMBOL =
    (typeof Symbol === 'function' && Symbol.for &&
     Symbol.for('react.element')) ||
    0xeac7;

/**
 * @param {string} type
 * @param {string | number | null | undefined} key
 * @param {Object<string, any>} props
 * @returns {SimpleMarkdown.ReactElement}
 */
var reactElement = function(
    type /* : string */,
    key /* : string | number | null | void */,
    props /* : { [string]: any } */
) /* : ReactElement */ {
    var element /* : ReactElement */ = /** @type {SimpleMarkdown.ReactElement} */ ({
        $$typeof: TYPE_SYMBOL,
        type: type,
        key: key == null ? undefined : key,
        ref: null,
        props: props,
        _owner: null
    } /* : any */);
    return element;
};

/** Returns a closed HTML tag.
 * @param {string} tagName - Name of HTML tag (eg. "em" or "a")
 * @param {string} content - Inner content of tag
 * @param {{ [attr: string]: SimpleMarkdown.Attr }} [attributes] - Optional extra attributes of tag as an object of key-value pairs
 *   eg. { "href": "http://google.com" }. Falsey attributes are filtered out.
 * @param {boolean} [isClosed] - boolean that controls whether tag is closed or not (eg. img tags).
 *   defaults to true
 */
var htmlTag = function(
    tagName /* : string */,
    content /* : string */,
    attributes /* : ?{[any]: ?Attr} */,
    isClosed /* : ?boolean */
) {
    attributes = attributes || {};
    isClosed = typeof isClosed !== 'undefined' ? isClosed : true;

    var attributeString = "";
    for (var attr in attributes) {
        var attribute = attributes[attr];
        // Removes falsey attributes
        if (Object.prototype.hasOwnProperty.call(attributes, attr) &&
                attribute) {
            attributeString += " " +
                sanitizeText(attr) + '="' +
                sanitizeText(attribute) + '"';
        }
    }

    var unclosedTag = "<" + tagName + attributeString + ">";

    if (isClosed) {
        return unclosedTag + content + "</" + tagName + ">";
    } else {
        return unclosedTag;
    }
};

var EMPTY_PROPS = {};

/**
 * @param {string | null | undefined} url - url to sanitize
 * @returns {string | null} - url if safe, or null if a safe url could not be made
 */
var sanitizeUrl = function(url /* : ?string */) {
    if (url == null) {
        return null;
    }
    try {
        var prot = decodeURIComponent(url)
            .replace(/[^A-Za-z0-9/:]/g, '')
            .toLowerCase();
        if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0 || prot.indexOf('data:') === 0) {
            return null;
        }
    } catch (e) {
        // decodeURIComponent sometimes throws a URIError
        // See `decodeURIComponent('a%AFc');`
        // http://stackoverflow.com/questions/9064536/javascript-decodeuricomponent-malformed-uri-exception
        return null;
    }
    return url;
};

var SANITIZE_TEXT_R = /[<>&"']/g;
/** @type {any} */
var SANITIZE_TEXT_CODES = {
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    "`": '&#96;'
};
/**
 * @param {SimpleMarkdown.Attr} text
 * @returns {string}
 */
var sanitizeText = function(text /* : Attr */) {
    return String(text).replace(SANITIZE_TEXT_R, function(chr) {
        return SANITIZE_TEXT_CODES[chr];
    });
};

var UNESCAPE_URL_R = /\\([^0-9A-Za-z\s])/g;

/**
 * @param {string} rawUrlString
 * @returns {string}
 */
var unescapeUrl = function(rawUrlString /* : string */) {
    return rawUrlString.replace(UNESCAPE_URL_R, "$1");
};

/**
 * Parse some content with the parser `parse`, with state.inline
 * set to true. Useful for block elements; not generally necessary
 * to be used by inline elements (where state.inline is already true.
 *
 * @param {SimpleMarkdown.Parser} parse
 * @param {string} content
 * @param {SimpleMarkdown.State} state
 * @returns {SimpleMarkdown.ASTNode}
 */
var parseInline = function(parse, content, state) {
    var isCurrentlyInline = state.inline || false;
    state.inline = true;
    var result = parse(content, state);
    state.inline = isCurrentlyInline;
    return result;
};
/**
 * @param {SimpleMarkdown.Parser} parse
 * @param {string} content
 * @param {SimpleMarkdown.State} state
 * @returns {SimpleMarkdown.ASTNode}
 */
var parseBlock = function(parse, content, state) {
    var isCurrentlyInline = state.inline || false;
    state.inline = false;
    var result = parse(content + "\n\n", state);
    state.inline = isCurrentlyInline;
    return result;
};

/**
 * @param {SimpleMarkdown.Capture} capture
 * @param {SimpleMarkdown.Parser} parse
 * @param {SimpleMarkdown.State} state
 * @returns {SimpleMarkdown.UnTypedASTNode}
 */
var parseCaptureInline = function(capture, parse, state) {
    return {
        content: parseInline(parse, capture[1], state)
    };
};
/**
 * @returns {SimpleMarkdown.UnTypedASTNode}
 */
var ignoreCapture = function() { return {}; };

// recognize a `*` `-`, `+`, `1.`, `2.`... list bullet
var LIST_BULLET = "(?:[*+-]|\\d+\\.)";
// recognize the start of a list item:
// leading space plus a bullet plus a space (`   * `)
var LIST_ITEM_PREFIX = "( *)(" + LIST_BULLET + ") +";
var LIST_ITEM_PREFIX_R = new RegExp("^" + LIST_ITEM_PREFIX);
// recognize an individual list item:
//  * hi
//    this is part of the same item
//
//    as is this, which is a new paragraph in the same item
//
//  * but this is not part of the same item
var LIST_ITEM_R = new RegExp(
    LIST_ITEM_PREFIX +
    "[^\\n]*(?:\\n" +
    "(?!\\1" + LIST_BULLET + " )[^\\n]*)*(\n|$)",
    "gm"
);
var BLOCK_END_R = /\n{2,}$/;
var INLINE_CODE_ESCAPE_BACKTICKS_R = /^ (?= *`)|(` *) $/g;
// recognize the end of a paragraph block inside a list item:
// two or more newlines at end end of the item
var LIST_BLOCK_END_R = BLOCK_END_R;
var LIST_ITEM_END_R = / *\n+$/;
// check whether a list item has paragraphs: if it does,
// we leave the newlines at the end
var LIST_R = new RegExp(
    "^( *)(" + LIST_BULLET + ") " +
    "[\\s\\S]+?(?:\n{2,}(?! )" +
    "(?!\\1" + LIST_BULLET + " )\\n*" +
    // the \\s*$ here is so that we can parse the inside of nested
    // lists, where our content might end before we receive two `\n`s
    "|\\s*\n*$)"
);
var LIST_LOOKBEHIND_R = /(?:^|\n)( *)$/;

var TABLES = (function() {
    var TABLE_ROW_SEPARATOR_TRIM = /^ *\| *| *\| *$/g;
    var TABLE_CELL_END_TRIM = / *$/;
    var TABLE_RIGHT_ALIGN = /^ *-+: *$/;
    var TABLE_CENTER_ALIGN = /^ *:-+: *$/;
    var TABLE_LEFT_ALIGN = /^ *:-+ *$/;

    /**
     * @param {string} alignCapture
     * @returns {SimpleMarkdown.TableAlignment}
     */
    var parseTableAlignCapture = function(alignCapture) {
        if (TABLE_RIGHT_ALIGN.test(alignCapture)) {
            return "right";
        } else if (TABLE_CENTER_ALIGN.test(alignCapture)) {
            return "center";
        } else if (TABLE_LEFT_ALIGN.test(alignCapture)) {
            return "left";
        } else {
            return null;
        }
    };

    /**
     * @param {string} source
     * @param {SimpleMarkdown.Parser} parse
     * @param {SimpleMarkdown.State} state
     * @param {boolean} trimEndSeparators
     * @returns {Array<SimpleMarkdown.TableAlignment>}
     */
    var parseTableAlign = function(source, parse, state, trimEndSeparators) {
        if (trimEndSeparators) {
            source = source.replace(TABLE_ROW_SEPARATOR_TRIM, "");
        }
        var alignText = source.trim().split("|");
        return alignText.map(parseTableAlignCapture);
    };

    /**
     * @param {string} source
     * @param {SimpleMarkdown.Parser} parse
     * @param {SimpleMarkdown.State} state
     * @param {boolean} trimEndSeparators
     * @returns {SimpleMarkdown.SingleASTNode[][]}
     */
    var parseTableRow = function(source, parse, state, trimEndSeparators) {
        var prevInTable = state.inTable;
        state.inTable = true;
        var tableRow = parse(source.trim(), state);
        state.inTable = prevInTable;

        /** @type {SimpleMarkdown.SingleASTNode[][]} */
        var cells = [[]];
        tableRow.forEach(function(node, i) {
            if (node.type === 'tableSeparator') {
                // Filter out empty table separators at the start/end:
                if (!trimEndSeparators || i !== 0 && i !== tableRow.length - 1) {
                    // Split the current row:
                    cells.push([]);
                }
            } else {
                if (node.type === 'text' && (
                    tableRow[i + 1] == null ||
                    tableRow[i + 1].type === 'tableSeparator'
                )) {
                    node.content = node.content.replace(TABLE_CELL_END_TRIM, "");
                }
                cells[cells.length - 1].push(node);
            }
        });

        return cells;
    };

    /**
     * @param {string} source
     * @param {SimpleMarkdown.Parser} parse
     * @param {SimpleMarkdown.State} state
     * @param {boolean} trimEndSeparators
     * @returns {SimpleMarkdown.ASTNode[][]}
     */
    var parseTableCells = function(source, parse, state, trimEndSeparators) {
        var rowsText = source.trim().split("\n");

        return rowsText.map(function(rowText) {
            return parseTableRow(rowText, parse, state, trimEndSeparators);
        });
    };

    /**
     * @param {boolean} trimEndSeparators
     * @returns {SimpleMarkdown.SingleNodeParseFunction}
     */
    var parseTable = function(trimEndSeparators) {
        /** @type {SimpleMarkdown.SingleNodeParseFunction} */
        return function(capture, parse, state) {
            state.inline = true;
            var header = parseTableRow(capture[1], parse, state, trimEndSeparators);
            var align = parseTableAlign(capture[2], parse, state, trimEndSeparators);
            var cells = parseTableCells(capture[3], parse, state, trimEndSeparators);
            state.inline = false;

            return {
                type: "table",
                header: header,
                align: align,
                cells: cells
            };
        };
    };

    return {
        parseTable: parseTable(true),
        parseNpTable: parseTable(false),
        TABLE_REGEX: /^ *(\|.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/,
        NPTABLE_REGEX: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/
    };
})();

var LINK_INSIDE = "(?:\\[[^\\]]*\\]|[^\\[\\]]|\\](?=[^\\[]*\\]))*";
var LINK_HREF_AND_TITLE =
        "\\s*<?((?:\\([^)]*\\)|[^\\s\\\\]|\\\\.)*?)>?(?:\\s+['\"]([\\s\\S]*?)['\"])?\\s*";
var AUTOLINK_MAILTO_CHECK_R = /mailto:/i;

/**
 * @param {SimpleMarkdown.Capture} capture
 * @param {SimpleMarkdown.State} state
 * @param {SimpleMarkdown.RefNode} refNode
 * @returns {SimpleMarkdown.RefNode}
 */
var parseRef = function(capture, state, refNode /* : RefNode */) {
    var ref = (capture[2] || capture[1])
        .replace(/\s+/g, ' ')
        .toLowerCase();

    // We store information about previously seen defs on
    // state._defs (_ to deconflict with client-defined
    // state). If the def for this reflink/refimage has
    // already been seen, we can use its target/source
    // and title here:
    if (state._defs && state._defs[ref]) {
        var def = state._defs[ref];
        // `refNode` can be a link or an image. Both use
        // target and title properties.
        refNode.target = def.target;
        refNode.title = def.title;
    }

    // In case we haven't seen our def yet (or if someone
    // overwrites that def later on), we add this node
    // to the list of ref nodes for that def. Then, when
    // we find the def, we can modify this link/image AST
    // node :).
    // I'm sorry.
    state._refs = state._refs || {};
    state._refs[ref] = state._refs[ref] || [];
    state._refs[ref].push(refNode);

    return refNode;
};

var currOrder = 0;
/** @type {SimpleMarkdown.DefaultRules} */
var defaultRules /* : DefaultRules */ = {
    Array: {
        react: function(arr, output, state) {
            var oldKey = state.key;
            var result /* : Array<ReactElements> */ = [];

            // map output over the ast, except group any text
            // nodes together into a single string output.
            for (var i = 0, key = 0; i < arr.length; i++, key++) {
                // `key` is our numerical `state.key`, which we increment for
                // every output node, but don't change for joined text nodes.
                // (i, however, must change for joined text nodes)
                state.key = '' + i;

                var node = arr[i];
                if (node.type === 'text') {
                    node = { type: 'text', content: node.content };
                    for (; i + 1 < arr.length && arr[i + 1].type === 'text'; i++) {
                        node.content += arr[i + 1].content;
                    }
                }

                result.push(output(node, state));
            }

            state.key = oldKey;
            return result;
        },
        html: function(arr, output, state) {
            var result = "";

            // map output over the ast, except group any text
            // nodes together into a single string output.
            for (var i = 0; i < arr.length; i++) {

                var node = arr[i];
                if (node.type === 'text') {
                    node = { type: 'text', content: node.content };
                    for (; i + 1 < arr.length && arr[i + 1].type === 'text'; i++) {
                        node.content += arr[i + 1].content;
                    }
                }

                result += output(node, state);
            }
            return result;
        }
    },
    heading: {
        order: currOrder++,
        match: blockRegex(/^ *(#{1,6})([^\n]+?)#* *(?:\n *)+\n/),
        parse: function(capture, parse, state) {
            return {
                level: capture[1].length,
                content: parseInline(parse, capture[2].trim(), state)
            };
        },
        react: function(node, output, state) {
            return reactElement(
                'h' + node.level,
                state.key,
                {
                    children: output(node.content, state)
                }
            );
        },
        html: function(node, output, state) {
            return htmlTag("h" + node.level, output(node.content, state));
        }
    },
    nptable: {
        order: currOrder++,
        match: blockRegex(TABLES.NPTABLE_REGEX),
        parse: TABLES.parseNpTable,
        react: null,
        html: null
    },
    lheading: {
        order: currOrder++,
        match: blockRegex(/^([^\n]+)\n *(=|-){3,} *(?:\n *)+\n/),
        parse: function(capture, parse, state) {
            return {
                type: "heading",
                level: capture[2] === '=' ? 1 : 2,
                content: parseInline(parse, capture[1], state)
            };
        },
        react: null,
        html: null
    },
    hr: {
        order: currOrder++,
        match: blockRegex(/^( *[-*_]){3,} *(?:\n *)+\n/),
        parse: ignoreCapture,
        react: function(node, output, state) {
            return reactElement(
                'hr',
                state.key,
                EMPTY_PROPS
            );
        },
        html: function(node, output, state) {
            return "<hr>";
        }
    },
    codeBlock: {
        order: currOrder++,
        match: blockRegex(/^(?:    [^\n]+\n*)+(?:\n *)+\n/),
        parse: function(capture, parse, state) {
            var content = capture[0]
                .replace(/^    /gm, '')
                .replace(/\n+$/, '');
            return {
                lang: undefined,
                content: content
            };
        },
        react: function(node, output, state) {
            var className = node.lang ?
                "markdown-code-" + node.lang :
                undefined;

            return reactElement(
                'pre',
                state.key,
                {
                    children: reactElement(
                        'code',
                        null,
                        {
                            className: className,
                            children: node.content
                        }
                    )
                }
            );
        },
        html: function(node, output, state) {
            var className = node.lang ?
                "markdown-code-" + node.lang :
                undefined;

            var codeBlock = htmlTag("code", sanitizeText(node.content), {
                class: className
            });
            return htmlTag("pre", codeBlock);
        }
    },
    fence: {
        order: currOrder++,
        match: blockRegex(/^ *(`{3,}|~{3,}) *(?:(\S+) *)?\n([\s\S]+?)\n?\1 *(?:\n *)+\n/),
        parse: function(capture, parse, state) {
            return {
                type: "codeBlock",
                lang: capture[2] || undefined,
                content: capture[3]
            };
        },
        react: null,
        html: null
    },
    blockQuote: {
        order: currOrder++,
        match: blockRegex(/^( *>[^\n]+(\n[^\n]+)*\n*)+\n{2,}/),
        parse: function(capture, parse, state) {
            var content = capture[0].replace(/^ *> ?/gm, '');
            return {
                content: parse(content, state)
            };
        },
        react: function(node, output, state) {
            return reactElement(
                'blockquote',
                state.key,
                {
                    children: output(node.content, state)
                }
            );
        },
        html: function(node, output, state) {
            return htmlTag("blockquote", output(node.content, state));
        }
    },
    list: {
        order: currOrder++,
        match: function(source, state) {
            // We only want to break into a list if we are at the start of a
            // line. This is to avoid parsing "hi * there" with "* there"
            // becoming a part of a list.
            // You might wonder, "but that's inline, so of course it wouldn't
            // start a list?". You would be correct! Except that some of our
            // lists can be inline, because they might be inside another list,
            // in which case we can parse with inline scope, but need to allow
            // nested lists inside this inline scope.
            var prevCaptureStr = state.prevCapture == null ? "" : state.prevCapture[0];
            var isStartOfLineCapture = LIST_LOOKBEHIND_R.exec(prevCaptureStr);
            var isListBlock = state._list || !state.inline;

            if (isStartOfLineCapture && isListBlock) {
                source = isStartOfLineCapture[1] + source;
                return LIST_R.exec(source);
            } else {
                return null;
            }
        },
        parse: function(capture, parse, state) {
            var bullet = capture[2];
            var ordered = bullet.length > 1;
            var start = ordered ? +bullet : undefined;
            var items = /** @type {string[]} */ (
                capture[0]
                    .replace(LIST_BLOCK_END_R, "\n")
                    .match(LIST_ITEM_R)
            );

            // We know this will match here, because of how the regexes are
            // defined
            /*:: items = ((items : any) : Array<string>) */

            var lastItemWasAParagraph = false;
            var itemContent = items.map(function(/** @type {string} */ item, /** @type {number} */ i) {
                // We need to see how far indented this item is:
                var prefixCapture = LIST_ITEM_PREFIX_R.exec(item);
                var space = prefixCapture ? prefixCapture[0].length : 0;
                // And then we construct a regex to "unindent" the subsequent
                // lines of the items by that amount:
                var spaceRegex = new RegExp("^ {1," + space + "}", "gm");

                // Before processing the item, we need a couple things
                var content = item
                         // remove indents on trailing lines:
                        .replace(spaceRegex, '')
                         // remove the bullet:
                        .replace(LIST_ITEM_PREFIX_R, '');

                // I'm not sur4 why this is necessary again?
                /*:: items = ((items : any) : Array<string>) */

                // Handling "loose" lists, like:
                //
                //  * this is wrapped in a paragraph
                //
                //  * as is this
                //
                //  * as is this
                var isLastItem = (i === items.length - 1);
                var containsBlocks = content.indexOf("\n\n") !== -1;

                // Any element in a list is a block if it contains multiple
                // newlines. The last element in the list can also be a block
                // if the previous item in the list was a block (this is
                // because non-last items in the list can end with \n\n, but
                // the last item can't, so we just "inherit" this property
                // from our previous element).
                var thisItemIsAParagraph = containsBlocks ||
                        (isLastItem && lastItemWasAParagraph);
                lastItemWasAParagraph = thisItemIsAParagraph;

                // backup our state for restoration afterwards. We're going to
                // want to set state._list to true, and state.inline depending
                // on our list's looseness.
                var oldStateInline = state.inline;
                var oldStateList = state._list;
                state._list = true;

                // Parse inline if we're in a tight list, or block if we're in
                // a loose list.
                var adjustedContent;
                if (thisItemIsAParagraph) {
                    state.inline = false;
                    adjustedContent = content.replace(LIST_ITEM_END_R, "\n\n");
                } else {
                    state.inline = true;
                    adjustedContent = content.replace(LIST_ITEM_END_R, "");
                }

                var result = parse(adjustedContent, state);

                // Restore our state before returning
                state.inline = oldStateInline;
                state._list = oldStateList;
                return result;
            });

            return {
                ordered: ordered,
                start: start,
                items: itemContent
            };
        },
        react: function(node, output, state) {
            var ListWrapper = node.ordered ? "ol" : "ul";

            return reactElement(
                ListWrapper,
                state.key,
                {
                    start: node.start,
                    children: node.items.map(function(
                        /** @type {SimpleMarkdown.ASTNode} */ item,
                        /** @type {number} */ i
                    ) {
                        return reactElement(
                            'li',
                            '' + i,
                            {
                                children: output(item, state)
                            }
                        );
                    })
                }
            );
        },
        html: function(node, output, state) {
            var listItems = node.items.map(function(/** @type {SimpleMarkdown.ASTNode} */ item) {
                return htmlTag("li", output(item, state));
            }).join("");

            var listTag = node.ordered ? "ol" : "ul";
            var attributes = {
                start: node.start
            };
            return htmlTag(listTag, listItems, attributes);
        }
    },
    def: {
        order: currOrder++,
        // TODO(aria): This will match without a blank line before the next
        // block element, which is inconsistent with most of the rest of
        // simple-markdown.
        match: blockRegex(
            /^ *\[([^\]]+)\]: *<?([^\s>]*)>?(?: +["(]([^\n]+)[")])? *\n(?: *\n)*/
        ),
        parse: function(capture, parse, state) {
            var def = capture[1]
                .replace(/\s+/g, ' ')
                .toLowerCase();
            var target = capture[2];
            var title = capture[3];

            // Look for previous links/images using this def
            // If any links/images using this def have already been declared,
            // they will have added themselves to the state._refs[def] list
            // (_ to deconflict with client-defined state). We look through
            // that list of reflinks for this def, and modify those AST nodes
            // with our newly found information now.
            // Sorry :(.
            if (state._refs && state._refs[def]) {
                // `refNode` can be a link or an image
                state._refs[def].forEach(function(/** @type {SimpleMarkdown.RefNode} */ refNode) {
                    refNode.target = target;
                    refNode.title = title;
                });
            }

            // Add this def to our map of defs for any future links/images
            // In case we haven't found any or all of the refs referring to
            // this def yet, we add our def to the table of known defs, so
            // that future reflinks can modify themselves appropriately with
            // this information.
            state._defs = state._defs || {};
            state._defs[def] = {
                target: target,
                title: title,
            };

            // return the relevant parsed information
            // for debugging only.
            return {
                def: def,
                target: target,
                title: title,
            };
        },
        react: function() { return null; },
        html: function() { return ""; }
    },
    table: {
        order: currOrder++,
        match: blockRegex(TABLES.TABLE_REGEX),
        parse: TABLES.parseTable,
        react: function(node, output, state) {
            /**
             * @param {number} colIndex
             * @returns {{ [attr: string]: SimpleMarkdown.Attr }}
             */
            var getStyle = function(colIndex) {
                return node.align[colIndex] == null ? {} : {
                    textAlign: node.align[colIndex]
                };
            };

            var headers = node.header.map(function(
                /** @type {SimpleMarkdown.ASTNode} */ content,
                /** @type {number} */ i
            ) {
                return reactElement(
                    'th',
                    '' + i,
                    {
                        style: getStyle(i),
                        scope: 'col',
                        children: output(content, state)
                    }
                );
            });

            var rows = node.cells.map(function(
                    /** @type {SimpleMarkdown.ASTNode[]} */ row,
                    /** @type {number} */ r
            ) {
                return reactElement(
                    'tr',
                    '' + r,
                    {
                        children: row.map(function(
                            /** @type {SimpleMarkdown.ASTNode} */ content,
                            /** @type {number} */ c
                        ) {
                            return reactElement(
                                'td',
                                '' + c,
                                {
                                    style: getStyle(c),
                                    children: output(content, state)
                                }
                            );
                        })
                    }
                );
            });

            return reactElement(
                'table',
                state.key,
                {
                    children: [reactElement(
                        'thead',
                        'thead',
                        {
                            children: reactElement(
                                'tr',
                                null,
                                {
                                    children: headers
                                }
                            )
                        }
                    ), reactElement(
                        'tbody',
                        'tbody',
                        {
                            children: rows
                        }
                    )]
                }
            );
        },
        html: function(node, output, state) {
            /**
             * @param {number} colIndex
             * @returns {string}
             */
            var getStyle = function(colIndex) {
                return node.align[colIndex] == null ? "" :
                    "text-align:" + node.align[colIndex] + ";";
            };

            var headers = node.header.map(function(
                /** @type {SimpleMarkdown.ASTNode} */ content,
                /** @type {number} */ i
            ) {
                return htmlTag("th", output(content, state),
                    { style: getStyle(i), scope: "col" });
            }).join("");

            var rows = node.cells.map(function(/** @type {SimpleMarkdown.ASTNode[]} */ row) {
                var cols = row.map(function(
                    /** @type {SimpleMarkdown.ASTNode} */ content,
                    /** @type {number} */ c
                ) {
                    return htmlTag("td", output(content, state),
                        { style: getStyle(c) });
                }).join("");

                return htmlTag("tr", cols);
            }).join("");

            var thead = htmlTag("thead", htmlTag("tr", headers));
            var tbody = htmlTag("tbody", rows);

            return htmlTag("table", thead + tbody);
        }
    },
    newline: {
        order: currOrder++,
        match: blockRegex(/^(?:\n *)*\n/),
        parse: ignoreCapture,
        react: function(node, output, state) { return "\n"; },
        html: function(node, output, state) { return "\n"; }
    },
    paragraph: {
        order: currOrder++,
        match: blockRegex(/^((?:[^\n]|\n(?! *\n))+)(?:\n *)+\n/),
        parse: parseCaptureInline,
        react: function(node, output, state) {
            return reactElement(
                'div',
                state.key,
                {
                    className: 'paragraph',
                    children: output(node.content, state)
                }
            );
        },
        html: function(node, output, state) {
            var attributes = {
                class: 'paragraph'
            };
            return htmlTag("div", output(node.content, state), attributes);
        }
    },
    escape: {
        order: currOrder++,
        // We don't allow escaping numbers, letters, or spaces here so that
        // backslashes used in plain text still get rendered. But allowing
        // escaping anything else provides a very flexible escape mechanism,
        // regardless of how this grammar is extended.
        match: inlineRegex(/^\\([^0-9A-Za-z\s])/),
        parse: function(capture, parse, state) {
            return {
                type: "text",
                content: capture[1]
            };
        },
        react: null,
        html: null
    },
    tableSeparator: {
        order: currOrder++,
        match: function(source, state) {
            if (!state.inTable) {
                return null;
            }
            return /^ *\| */.exec(source);
        },
        parse: function() {
            return { type: 'tableSeparator' };
        },
        // These shouldn't be reached, but in case they are, be reasonable:
        react: function() { return ' | '; },
        html: function() { return ' &vert; '; },
    },
    autolink: {
        order: currOrder++,
        match: inlineRegex(/^<([^: >]+:\/[^ >]+)>/),
        parse: function(capture, parse, state) {
            return {
                type: "link",
                content: [{
                    type: "text",
                    content: capture[1]
                }],
                target: capture[1]
            };
        },
        react: null,
        html: null
    },
    mailto: {
        order: currOrder++,
        match: inlineRegex(/^<([^ >]+@[^ >]+)>/),
        parse: function(capture, parse, state) {
            var address = capture[1];
            var target = capture[1];

            // Check for a `mailto:` already existing in the link:
            if (!AUTOLINK_MAILTO_CHECK_R.test(target)) {
                target = "mailto:" + target;
            }

            return {
                type: "link",
                content: [{
                    type: "text",
                    content: address
                }],
                target: target
            };
        },
        react: null,
        html: null
    },
    url: {
        order: currOrder++,
        match: inlineRegex(/^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/),
        parse: function(capture, parse, state) {
            return {
                type: "link",
                content: [{
                    type: "text",
                    content: capture[1]
                }],
                target: capture[1],
                title: undefined
            };
        },
        react: null,
        html: null
    },
    link: {
        order: currOrder++,
        match: inlineRegex(new RegExp(
            "^\\[(" + LINK_INSIDE + ")\\]\\(" + LINK_HREF_AND_TITLE + "\\)"
        )),
        parse: function(capture, parse, state) {
            var link ={
                content: parse(capture[1], state),
                target: unescapeUrl(capture[2]),
                title: capture[3]
            };
            return link;
        },
        react: function(node, output, state) {
            return reactElement(
                'a',
                state.key,
                {
                    href: sanitizeUrl(node.target),
                    title: node.title,
                    children: output(node.content, state)
                }
            );
        },
        html: function(node, output, state) {
            var attributes = {
                href: sanitizeUrl(node.target),
                title: node.title
            };

            return htmlTag("a", output(node.content, state), attributes);
        }
    },
    image: {
        order: currOrder++,
        match: inlineRegex(new RegExp(
            "^!\\[(" + LINK_INSIDE + ")\\]\\(" + LINK_HREF_AND_TITLE + "\\)"
        )),
        parse: function(capture, parse, state) {
            var image = {
                alt: capture[1],
                target: unescapeUrl(capture[2]),
                title: capture[3]
            };
            return image;
        },
        react: function(node, output, state) {
            return reactElement(
                'img',
                state.key,
                {
                    src: sanitizeUrl(node.target),
                    alt: node.alt,
                    title: node.title
                }
            );
        },
        html: function(node, output, state) {
            var attributes = {
                src: sanitizeUrl(node.target),
                alt: node.alt,
                title: node.title
            };

            return htmlTag("img", "", attributes, false);
        }
    },
    reflink: {
        order: currOrder++,
        match: inlineRegex(new RegExp(
            // The first [part] of the link
            "^\\[(" + LINK_INSIDE + ")\\]" +
            // The [ref] target of the link
            "\\s*\\[([^\\]]*)\\]"
        )),
        parse: function(capture, parse, state) {
            return parseRef(capture, state, {
                type: "link",
                content: parse(capture[1], state)
            });
        },
        react: null,
        html: null
    },
    refimage: {
        order: currOrder++,
        match: inlineRegex(new RegExp(
            // The first [part] of the link
            "^!\\[(" + LINK_INSIDE + ")\\]" +
            // The [ref] target of the link
            "\\s*\\[([^\\]]*)\\]"
        )),
        parse: function(capture, parse, state) {
            return parseRef(capture, state, {
                type: "image",
                alt: capture[1]
            });
        },
        react: null,
        html: null
    },
    em: {
        order: currOrder /* same as strong/u */,
        match: inlineRegex(
            new RegExp(
                // only match _s surrounding words.
                "^\\b_" +
                "((?:__|\\\\[\\s\\S]|[^\\\\_])+?)_" +
                "\\b" +
                // Or match *s:
                "|" +
                // Only match *s that are followed by a non-space:
                "^\\*(?=\\S)(" +
                // Match at least one of:
                "(?:" +
                  //  - `**`: so that bolds inside italics don't close the
                  //          italics
                  "\\*\\*|" +
                  //  - escape sequence: so escaped *s don't close us
                  "\\\\[\\s\\S]|" +
                  //  - whitespace: followed by a non-* (we don't
                  //          want ' *' to close an italics--it might
                  //          start a list)
                  "\\s+(?:\\\\[\\s\\S]|[^\\s\\*\\\\]|\\*\\*)|" +
                  //  - non-whitespace, non-*, non-backslash characters
                  "[^\\s\\*\\\\]" +
                ")+?" +
                // followed by a non-space, non-* then *
                ")\\*(?!\\*)"
            )
        ),
        quality: function(capture) {
            // precedence by length, `em` wins ties:
            return capture[0].length + 0.2;
        },
        parse: function(capture, parse, state) {
            return {
                content: parse(capture[2] || capture[1], state)
            };
        },
        react: function(node, output, state) {
            return reactElement(
                'em',
                state.key,
                {
                    children: output(node.content, state)
                }
            );
        },
        html: function(node, output, state) {
            return htmlTag("em", output(node.content, state));
        }
    },
    strong: {
        order: currOrder /* same as em */,
        match: inlineRegex(/^\*\*((?:\\[\s\S]|[^\\])+?)\*\*(?!\*)/),
        quality: function(capture) {
            // precedence by length, wins ties vs `u`:
            return capture[0].length + 0.1;
        },
        parse: parseCaptureInline,
        react: function(node, output, state) {
            return reactElement(
                'strong',
                state.key,
                {
                    children: output(node.content, state)
                }
            );
        },
        html: function(node, output, state) {
            return htmlTag("strong", output(node.content, state));
        }
    },
    u: {
        order: currOrder++ /* same as em&strong; increment for next rule */,
        match: inlineRegex(/^__((?:\\[\s\S]|[^\\])+?)__(?!_)/),
        quality: function(capture) {
            // precedence by length, loses all ties
            return capture[0].length;
        },
        parse: parseCaptureInline,
        react: function(node, output, state) {
            return reactElement(
                'u',
                state.key,
                {
                    children: output(node.content, state)
                }
            );
        },
        html: function(node, output, state) {
            return htmlTag("u", output(node.content, state));
        }
    },
    del: {
        order: currOrder++,
        match: inlineRegex(/^~~(?=\S)((?:\\[\s\S]|~(?!~)|[^\s~\\]|\s(?!~~))+?)~~/),
        parse: parseCaptureInline,
        react: function(node, output, state) {
            return reactElement(
                'del',
                state.key,
                {
                    children: output(node.content, state)
                }
            );
        },
        html: function(node, output, state) {
            return htmlTag("del", output(node.content, state));
        }
    },
    inlineCode: {
        order: currOrder++,
        match: inlineRegex(/^(`+)([\s\S]*?[^`])\1(?!`)/),
        parse: function(capture, parse, state) {
            return {
                content: capture[2].replace(INLINE_CODE_ESCAPE_BACKTICKS_R, "$1")
            };
        },
        react: function(node, output, state) {
            return reactElement(
                'code',
                state.key,
                {
                    children: node.content
                }
            );
        },
        html: function(node, output, state) {
            return htmlTag("code", sanitizeText(node.content));
        }
    },
    br: {
        order: currOrder++,
        match: anyScopeRegex(/^ {2,}\n/),
        parse: ignoreCapture,
        react: function(node, output, state) {
            return reactElement(
                'br',
                state.key,
                EMPTY_PROPS
            );
        },
        html: function(node, output, state) {
            return "<br>";
        }
    },
    text: {
        order: currOrder++,
        // Here we look for anything followed by non-symbols,
        // double newlines, or double-space-newlines
        // We break on any symbol characters so that this grammar
        // is easy to extend without needing to modify this regex
        match: anyScopeRegex(
            /^[\s\S]+?(?=[^0-9A-Za-z\s\u00c0-\uffff]|\n\n| {2,}\n|\w+:\S|$)/
        ),
        parse: function(capture, parse, state) {
            return {
                content: capture[0]
            };
        },
        react: function(node, output, state) {
            return node.content;
        },
        html: function(node, output, state) {
            return sanitizeText(node.content);
        }
    }
};

/** (deprecated)
 * @param {any} rules
 * @param {any} property
 * @returns {any}
 */
var ruleOutput = function/* :: <Rule : Object> */(
    rules /* : OutputRules<Rule> */,
    property /* : $Keys<Rule> */
) {
    if (!property && typeof console !== "undefined") {
        console.warn("simple-markdown ruleOutput should take 'react' or " +
            "'html' as the second argument."
        );
    }

    /** @type {SimpleMarkdown.NodeOutput<any>} */
    var nestedRuleOutput /* : NodeOutput<any> */ = function(
        ast /* : SingleASTNode */,
        outputFunc /* : Output<any> */,
        state /* : State */
    ) {
        return rules[ast.type][property](ast, outputFunc, state);
    };
    return nestedRuleOutput;
};

/** (deprecated)
 * @param {any} outputFunc
 * @returns {any}
 */
var reactFor = function(outputFunc /* : ReactNodeOutput */) /* : ReactOutput */ {
    /** @type {SimpleMarkdown.ReactOutput} */
    var nestedOutput /* : ReactOutput */ = function(ast, state) {
        state = state || {};
        if (Array.isArray(ast)) {
            var oldKey = state.key;
            var result /* : Array<ReactElements> */ = [];

            // map nestedOutput over the ast, except group any text
            // nodes together into a single string output.
            var lastResult = null;
            for (var i = 0; i < ast.length; i++) {
                state.key = '' + i;
                var nodeOut = nestedOutput(ast[i], state);
                if (typeof nodeOut === "string" && typeof lastResult === "string") {
                    lastResult = lastResult + nodeOut;
                    result[result.length - 1] = lastResult;
                } else {
                    result.push(nodeOut);
                    lastResult = nodeOut;
                }
            }

            state.key = oldKey;
            return result;
        } else {
            return outputFunc(ast, nestedOutput, state);
        }
    };
    return nestedOutput;
};

/** (deprecated)
 * @param {any} outputFunc
 * @returns {any}
 */
var htmlFor = function(outputFunc /* : HtmlNodeOutput */) /* : HtmlOutput */ {
    /** @type {SimpleMarkdown.HtmlOutput} */
    var nestedOutput /* : HtmlOutput */ = function(ast, state) {
        state = state || {};
        if (Array.isArray(ast)) {
            return ast.map(function(node) {
                return nestedOutput(node, state);
            }).join("");
        } else {
            return outputFunc(ast, nestedOutput, state);
        }
    };
    return nestedOutput;
};

/**
 * @type {SimpleMarkdown.OutputFor}
 */
var outputFor = function/* :: <Rule : Object> */(
    rules /* : OutputRules<Rule> */,
    property /* : $Keys<Rule> */,
    defaultState /* : ?State */
) {
    if (!property) {
        throw new Error('simple-markdown: outputFor: `property` must be ' +
            'defined. ' +
            'if you just upgraded, you probably need to replace `outputFor` ' +
            'with `reactFor`'
        );
    }

    /** @type {SimpleMarkdown.State} */
    var latestState;
    /** @type {SimpleMarkdown.ArrayRule} */
    var arrayRule = rules.Array || defaultRules.Array;

    // Tricks to convince tsc that this var is not null:
    var arrayRuleCheck = arrayRule[property];
    if (!arrayRuleCheck) {
        throw new Error('simple-markdown: outputFor: to join nodes of type `' +
            property + '` you must provide an `Array:` joiner rule with that type, ' +
            'Please see the docs for details on specifying an Array rule.'
        );
    }
    var arrayRuleOutput = arrayRuleCheck;

    /** @type {SimpleMarkdown.Output<any>} */
    var nestedOutput /* : Output<any> */ = function(ast, state) {
        state = state || latestState;
        latestState = state;
        if (Array.isArray(ast)) {
            return arrayRuleOutput(ast, nestedOutput, state);
        } else {
            return rules[ast.type][property](ast, nestedOutput, state);
        }
    };

    /** @type {SimpleMarkdown.Output<any>} */
    var outerOutput = function(ast, state) {
        latestState = populateInitialState(state, defaultState);
        return nestedOutput(ast, latestState);
    };
    return outerOutput;
};

var defaultRawParse = parserFor(defaultRules);
/**
 * @param {string} source
 * @param {SimpleMarkdown.OptionalState} [state]
 * @returns {Array<SimpleMarkdown.SingleASTNode>}
 */
var defaultBlockParse = function(source, state) {
    state = state || {};
    state.inline = false;
    return defaultRawParse(source, state);
};
/**
 * @param {string} source
 * @param {SimpleMarkdown.OptionalState} [state]
 * @returns {Array<SimpleMarkdown.SingleASTNode>}
 */
var defaultInlineParse = function(source, state) {
    state = state || {};
    state.inline = true;
    return defaultRawParse(source, state);
};
/**
 * @param {string} source
 * @param {SimpleMarkdown.OptionalState} [state]
 * @returns {Array<SimpleMarkdown.SingleASTNode>}
 */
var defaultImplicitParse = function(source, state) {
    var isBlock = BLOCK_END_R.test(source);
    state = state || {};
    state.inline = !isBlock;
    return defaultRawParse(source, state);
};

/** @type {SimpleMarkdown.ReactOutput} */
var defaultReactOutput /* : ReactOutput */ = outputFor(defaultRules, "react");
/** @type {SimpleMarkdown.HtmlOutput} */
var defaultHtmlOutput /* : HtmlOutput */ = outputFor(defaultRules, "html");

/**
 * @param {string} source
 * @param {SimpleMarkdown.OptionalState} [state]
 * @returns {SimpleMarkdown.ReactElements}
 */
var markdownToReact = function(source, state) /* : ReactElements */ {
    return defaultReactOutput(defaultBlockParse(source, state), state);
};
/**
 * @param {string} source
 * @param {SimpleMarkdown.OptionalState} [state]
 * @returns {string}
 */
var markdownToHtml = function(source, state) /* : string */ {
    return defaultHtmlOutput(defaultBlockParse(source, state), state);
};

/**
 * @param {SimpleMarkdown.ReactMarkdownProps} props
 * @returns {SimpleMarkdown.ReactElement}
 */
var ReactMarkdown = function(props) {
    /** @type {Object} */
    var divProps = {};

    for (var prop in props) {
        if (prop !== 'source' &&
            Object.prototype.hasOwnProperty.call(props, prop)
        ) {
            divProps[prop] = props[prop];
        }
    }
    divProps.children = markdownToReact(props.source);

    return reactElement(
        'div',
        null,
        divProps
    );
};


/*:: // Flow exports:
type Exports = {
    +defaultRules: DefaultRules,
    +parserFor: (rules: ParserRules, defaultState?: ?State) => Parser,
    +outputFor: <Rule : Object>(rules: OutputRules<Rule>, param: $Keys<Rule>, defaultState?: ?State) => Output<any>,

    +ruleOutput: <Rule : Object>(rules: OutputRules<Rule>, param: $Keys<Rule>) => NodeOutput<any>,
    +reactFor: (ReactNodeOutput) => ReactOutput,
    +htmlFor: (HtmlNodeOutput) => HtmlOutput,

    +inlineRegex: (regex: RegExp) => MatchFunction,
    +blockRegex: (regex: RegExp) => MatchFunction,
    +anyScopeRegex: (regex: RegExp) => MatchFunction,
    +parseInline: (parse: Parser, content: string, state: State) => ASTNode,
    +parseBlock: (parse: Parser, content: string, state: State) => ASTNode,

    +markdownToReact: (source: string, state?: ?State) => ReactElements,
    +markdownToHtml: (source: string, state?: ?State) => string,
    +ReactMarkdown: (props: { source: string, [string]: any }) => ReactElement,

    +defaultRawParse: (source: string, state?: ?State) => Array<SingleASTNode>,
    +defaultBlockParse: (source: string, state?: ?State) => Array<SingleASTNode>,
    +defaultInlineParse: (source: string, state?: ?State) => Array<SingleASTNode>,
    +defaultImplicitParse: (source: string, state?: ?State) => Array<SingleASTNode>,

    +defaultReactOutput: ReactOutput,
    +defaultHtmlOutput: HtmlOutput,

    +preprocess: (source: string) => string,
    +sanitizeText: (text: Attr) => string,
    +sanitizeUrl: (url: ?string) => ?string,
    +unescapeUrl: (url: string) => string,
    +htmlTag: (tagName: string, content: string, attributes: ?{ [any]: ?Attr }, isClosed: ?boolean) => string,
    +reactElement: (type: string, key: string | null, props: { [string]: any }) => ReactElement,
};

export type {
    // Hopefully you shouldn't have to use these, but they're here if you need!
    // Top-level API:
    State,
    Parser,
    Output,
    ReactOutput,
    HtmlOutput,

    // Most of the following types should be considered experimental and
    // subject to change or change names. Again, they shouldn't be necessary,
    // but if they are I'd love to hear how so I can better support them!

    // Individual Rule fields:
    Capture,
    MatchFunction,
    ParseFunction,
    NodeOutput,
    ArrayNodeOutput,
    ReactNodeOutput,

    // Single rules:
    ParserRule,
    ReactOutputRule,
    HtmlOutputRule,

    // Sets of rules:
    ParserRules,
    OutputRules,
    Rules,
    ReactRules,
    HtmlRules,
};
*/

var SimpleMarkdown /* : Exports */ = {
    defaultRules: defaultRules,
    parserFor: parserFor,
    outputFor: outputFor,

    inlineRegex: inlineRegex,
    blockRegex: blockRegex,
    anyScopeRegex: anyScopeRegex,
    parseInline: parseInline,
    parseBlock: parseBlock,

    // default wrappers:
    markdownToReact: markdownToReact,
    markdownToHtml: markdownToHtml,
    ReactMarkdown: ReactMarkdown,

    defaultBlockParse: defaultBlockParse,
    defaultInlineParse: defaultInlineParse,
    defaultImplicitParse: defaultImplicitParse,

    defaultReactOutput: defaultReactOutput,
    defaultHtmlOutput: defaultHtmlOutput,

    preprocess: preprocess,
    sanitizeText: sanitizeText,
    sanitizeUrl: sanitizeUrl,
    unescapeUrl: unescapeUrl,
    htmlTag: htmlTag,
    reactElement: reactElement,

    // deprecated:
    defaultRawParse: defaultRawParse,
    ruleOutput: ruleOutput,
    reactFor: reactFor,
    htmlFor: htmlFor,

    defaultParse: function() {
        if (typeof console !== 'undefined') {
            console.warn('defaultParse is deprecated, please use `defaultImplicitParse`');
        }
        return defaultImplicitParse.apply(null, /** @type {any} */ (arguments));
    },
    defaultOutput: function() {
        if (typeof console !== 'undefined') {
            console.warn('defaultOutput is deprecated, please use `defaultReactOutput`');
        }
        return defaultReactOutput.apply(null, /** @type {any} */ (arguments));
    }
};

return SimpleMarkdown;

})));


/***/ }),

/***/ 877:
/***/ ((module) => {

module.exports = eval("require")("encoding");


/***/ }),

/***/ 747:
/***/ ((module) => {

"use strict";
module.exports = require("fs");;

/***/ }),

/***/ 605:
/***/ ((module) => {

"use strict";
module.exports = require("http");;

/***/ }),

/***/ 211:
/***/ ((module) => {

"use strict";
module.exports = require("https");;

/***/ }),

/***/ 87:
/***/ ((module) => {

"use strict";
module.exports = require("os");;

/***/ }),

/***/ 622:
/***/ ((module) => {

"use strict";
module.exports = require("path");;

/***/ }),

/***/ 413:
/***/ ((module) => {

"use strict";
module.exports = require("stream");;

/***/ }),

/***/ 835:
/***/ ((module) => {

"use strict";
module.exports = require("url");;

/***/ }),

/***/ 761:
/***/ ((module) => {

"use strict";
module.exports = require("zlib");;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
const SimpleMarkdown = __nccwpck_require__(417);
const fs = __nccwpck_require__(747);
const slugger = __nccwpck_require__(237)();
const stripTags = __nccwpck_require__(731);
const core = __nccwpck_require__(186);
const { MeiliSearch } = __nccwpck_require__(870);

const mdParse = SimpleMarkdown.defaultBlockParse;
const getTitle = (markdown) => /title:\s*([^\n\r]*)[^-]*---/.exec(markdown)[1];

let objectID = 1;
const getObjectID = () => objectID++;

const INDEX = core.getInput("version").replace(/\W/g, "_");
const PATH = core.getInput("docusaurusPath");
const API_KEY = core.getInput("apiKey");
const HOST = core.getInput("host");
const DOCS = core.getInput("docs").split(",");

const createIndex = (data) => {
  const requiredFields = ["hierarchy_lvl0", "hierarchy_lvl1", "url"];
  const missingFields = requiredFields.filter(
    (requiredField) => !data[requiredField]
  );
  if (missingFields.length) {
    throw new Error(
      `Missing fields for indexing page ${data.url}: ${missingFields.join(
        ", "
      )}`
    );
  }
  return {
    objectID: getObjectID(),
    hierarchy_radio_lvl0: null,
    hierarchy_radio_lvl1: null,
    hierarchy_radio_lvl2: null,
    hierarchy_radio_lvl3: null,
    hierarchy_radio_lvl4: null,
    hierarchy_radio_lvl5: null,
    hierarchy_lvl0: null,
    hierarchy_lvl1: null,
    hierarchy_lvl2: null,
    hierarchy_lvl3: null,
    hierarchy_lvl4: null,
    hierarchy_lvl5: null,
    hierarchy_lvl6: null,
    content: null,
    anchor: null,
    ...data,
  };
};

const indexes = [];

const clearHierarchyLevelsTo = (baseData, level) => {
  for (let i = getNextHierarchyLevel(baseData); i >= level; --i) {
    baseData["hierarchy_lvl" + i] = null;
  }
};

const getContent = (contents) =>
  stripTags(
    contents
      .map((content) =>
        Array.isArray(content.content)
          ? getContent(content.content)
          : content.content
      )
      .join("")
  ).replace(/&nbsp;/g, "");

const processFile = (path, baseData) => {
  const md = fs.readFileSync(`${PATH}/docs/en/${path}.md`, {
    encoding: "utf8",
  });

  const title = getTitle(md);

  const syntaxTree = mdParse(md);

  let pageBaseData = {
    ...baseData,
    url: path,
    [getNextHierarchyLevel(baseData)]: title,
  };

  indexes.push(createIndex(pageBaseData));

  let lastNodeLevel = 1;
  syntaxTree.forEach((node, index) => {
    if (
      node.type !== "heading" ||
      (node.type === "heading" && node.level > 3)
    ) {
      return;
    }

    let content;
    if (syntaxTree[index + 1] && syntaxTree[index + 1].type === "paragraph") {
      content = getContent(syntaxTree[index + 1].content);
    }

    let levelHierarchy;
    if (node.level > lastNodeLevel) {
      levelHierarchy = getNextHierarchyLevel(pageBaseData);
    } else {
      levelHierarchy = lastNodeLevel - node.level;
      clearHierarchyLevelsTo(pageBaseData, levelHierarchy);
    }
    indexes.push(
      createIndex({
        ...pageBaseData,
        content,
        [levelHierarchy]: getContent(node.content),
        anchor: slugger.slug(getContent(node.content)),
      })
    );
  });
  slugger.reset();
};

const getNextHierarchyLevel = (data) => {
  for (let i = 0; i <= 6; ++i) {
    if (!data["hierarchy_lvl" + i]) {
      return "hierarchy_lvl" + i;
    }
  }
  throw new Error("Maximum depth reached, rework the indexer.");
};

const fetchIndexes = (node, baseData) => {
  if (typeof node === "string") {
    processFile(node, baseData);
  } else if (node.items) {
    const nextData = {
      ...baseData,
      [getNextHierarchyLevel(baseData)]: node.label,
    };
    node.items.forEach((node) => fetchIndexes(node, nextData));
  }
};

require(`${PATH}/sidebars.json`)
  .docs.filter((lvl0) => DOCS.includes(lvl0.label))
  .forEach(fetchIndexes, {
    hierarchy_lvl0: null,
    hierarchy_lvl1: null,
    hierarchy_lvl2: null,
    hierarchy_lvl3: null,
    hierarchy_lvl4: null,
    hierarchy_lvl5: null,
    hierarchy_lvl6: null,
  });

const client = new MeiliSearch({
  host: HOST,
  apiKey: API_KEY,
});

client
  .index(INDEX)
  .addDocuments(docs)
  .then((res) => console.log(res));

})();

module.exports = __webpack_exports__;
/******/ })()
;