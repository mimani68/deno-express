// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.

// This is a specialised implementation of a System module loader.

"use strict";

// @ts-nocheck
/* eslint-disable */
let System, __instantiate;
(() => {
  const r = new Map();

  System = {
    register(id, d, f) {
      r.set(id, { d, f, exp: {} });
    },
  };
  async function dI(mid, src) {
    let id = mid.replace(/\.\w+$/i, "");
    if (id.includes("./")) {
      const [o, ...ia] = id.split("/").reverse(),
        [, ...sa] = src.split("/").reverse(),
        oa = [o];
      let s = 0,
        i;
      while ((i = ia.shift())) {
        if (i === "..") s++;
        else if (i === ".") break;
        else oa.push(i);
      }
      if (s < sa.length) oa.push(...sa.slice(s));
      id = oa.reverse().join("/");
    }
    return r.has(id) ? gExpA(id) : import(mid);
  }

  function gC(id, main) {
    return {
      id,
      import: (m) => dI(m, id),
      meta: { url: id, main },
    };
  }

  function gE(exp) {
    return (id, v) => {
      v = typeof id === "string" ? { [id]: v } : id;
      for (const [id, value] of Object.entries(v)) {
        Object.defineProperty(exp, id, {
          value,
          writable: true,
          enumerable: true,
        });
      }
    };
  }

  function rF(main) {
    for (const [id, m] of r.entries()) {
      const { f, exp } = m;
      const { execute: e, setters: s } = f(gE(exp), gC(id, id === main));
      delete m.f;
      m.e = e;
      m.s = s;
    }
  }

  async function gExpA(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](await gExpA(d[i]));
      const r = e();
      if (r) await r;
    }
    return m.exp;
  }

  function gExp(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](gExp(d[i]));
      e();
    }
    return m.exp;
  }
  __instantiate = (m, a) => {
    System = __instantiate = undefined;
    rF(m);
    return a ? gExpA(m) : gExp(m);
  };
})();

System.register("https://deno.land/std/log/levels", [], function (exports_1, context_1) {
    "use strict";
    var LogLevels, LogLevelNames, byLevel;
    var __moduleName = context_1 && context_1.id;
    /** Returns the numeric log level associated with the passed,
     * stringy log level name.
     */
    function getLevelByName(name) {
        switch (name) {
            case "NOTSET":
                return LogLevels.NOTSET;
            case "DEBUG":
                return LogLevels.DEBUG;
            case "INFO":
                return LogLevels.INFO;
            case "WARNING":
                return LogLevels.WARNING;
            case "ERROR":
                return LogLevels.ERROR;
            case "CRITICAL":
                return LogLevels.CRITICAL;
            default:
                throw new Error(`no log level found for "${name}"`);
        }
    }
    exports_1("getLevelByName", getLevelByName);
    /** Returns the stringy log level name provided the numeric log level */
    function getLevelName(level) {
        const levelName = byLevel[level];
        if (levelName) {
            return levelName;
        }
        throw new Error(`no level name found for level: ${level}`);
    }
    exports_1("getLevelName", getLevelName);
    return {
        setters: [],
        execute: function () {
            // Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
            /** Get log level numeric values through enum constants
             */
            (function (LogLevels) {
                LogLevels[LogLevels["NOTSET"] = 0] = "NOTSET";
                LogLevels[LogLevels["DEBUG"] = 10] = "DEBUG";
                LogLevels[LogLevels["INFO"] = 20] = "INFO";
                LogLevels[LogLevels["WARNING"] = 30] = "WARNING";
                LogLevels[LogLevels["ERROR"] = 40] = "ERROR";
                LogLevels[LogLevels["CRITICAL"] = 50] = "CRITICAL";
            })(LogLevels || (LogLevels = {}));
            exports_1("LogLevels", LogLevels);
            /** Permitted log level names */
            exports_1("LogLevelNames", LogLevelNames = Object.keys(LogLevels).filter((key) => isNaN(Number(key))));
            byLevel = {
                [String(LogLevels.NOTSET)]: "NOTSET",
                [String(LogLevels.DEBUG)]: "DEBUG",
                [String(LogLevels.INFO)]: "INFO",
                [String(LogLevels.WARNING)]: "WARNING",
                [String(LogLevels.ERROR)]: "ERROR",
                [String(LogLevels.CRITICAL)]: "CRITICAL",
            };
        }
    };
});
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
/** A module to print ANSI terminal colors. Inspired by chalk, kleur, and colors
 * on npm.
 *
 * ```
 * import { bgBlue, red, bold } from "https://deno.land/std/fmt/colors.ts";
 * console.log(bgBlue(red(bold("Hello world!"))));
 * ```
 *
 * This module supports `NO_COLOR` environmental variable disabling any coloring
 * if `NO_COLOR` is set.
 *
 * This module is browser compatible. */
System.register("https://deno.land/std/fmt/colors", [], function (exports_2, context_2) {
    "use strict";
    var noColor, enabled, ANSI_PATTERN;
    var __moduleName = context_2 && context_2.id;
    function setColorEnabled(value) {
        if (noColor) {
            return;
        }
        enabled = value;
    }
    exports_2("setColorEnabled", setColorEnabled);
    function getColorEnabled() {
        return enabled;
    }
    exports_2("getColorEnabled", getColorEnabled);
    function code(open, close) {
        return {
            open: `\x1b[${open.join(";")}m`,
            close: `\x1b[${close}m`,
            regexp: new RegExp(`\\x1b\\[${close}m`, "g"),
        };
    }
    function run(str, code) {
        return enabled
            ? `${code.open}${str.replace(code.regexp, code.open)}${code.close}`
            : str;
    }
    function reset(str) {
        return run(str, code([0], 0));
    }
    exports_2("reset", reset);
    function bold(str) {
        return run(str, code([1], 22));
    }
    exports_2("bold", bold);
    function dim(str) {
        return run(str, code([2], 22));
    }
    exports_2("dim", dim);
    function italic(str) {
        return run(str, code([3], 23));
    }
    exports_2("italic", italic);
    function underline(str) {
        return run(str, code([4], 24));
    }
    exports_2("underline", underline);
    function inverse(str) {
        return run(str, code([7], 27));
    }
    exports_2("inverse", inverse);
    function hidden(str) {
        return run(str, code([8], 28));
    }
    exports_2("hidden", hidden);
    function strikethrough(str) {
        return run(str, code([9], 29));
    }
    exports_2("strikethrough", strikethrough);
    function black(str) {
        return run(str, code([30], 39));
    }
    exports_2("black", black);
    function red(str) {
        return run(str, code([31], 39));
    }
    exports_2("red", red);
    function green(str) {
        return run(str, code([32], 39));
    }
    exports_2("green", green);
    function yellow(str) {
        return run(str, code([33], 39));
    }
    exports_2("yellow", yellow);
    function blue(str) {
        return run(str, code([34], 39));
    }
    exports_2("blue", blue);
    function magenta(str) {
        return run(str, code([35], 39));
    }
    exports_2("magenta", magenta);
    function cyan(str) {
        return run(str, code([36], 39));
    }
    exports_2("cyan", cyan);
    function white(str) {
        return run(str, code([37], 39));
    }
    exports_2("white", white);
    function gray(str) {
        return run(str, code([90], 39));
    }
    exports_2("gray", gray);
    function bgBlack(str) {
        return run(str, code([40], 49));
    }
    exports_2("bgBlack", bgBlack);
    function bgRed(str) {
        return run(str, code([41], 49));
    }
    exports_2("bgRed", bgRed);
    function bgGreen(str) {
        return run(str, code([42], 49));
    }
    exports_2("bgGreen", bgGreen);
    function bgYellow(str) {
        return run(str, code([43], 49));
    }
    exports_2("bgYellow", bgYellow);
    function bgBlue(str) {
        return run(str, code([44], 49));
    }
    exports_2("bgBlue", bgBlue);
    function bgMagenta(str) {
        return run(str, code([45], 49));
    }
    exports_2("bgMagenta", bgMagenta);
    function bgCyan(str) {
        return run(str, code([46], 49));
    }
    exports_2("bgCyan", bgCyan);
    function bgWhite(str) {
        return run(str, code([47], 49));
    }
    exports_2("bgWhite", bgWhite);
    /* Special Color Sequences */
    function clampAndTruncate(n, max = 255, min = 0) {
        return Math.trunc(Math.max(Math.min(n, max), min));
    }
    /** Set text color using paletted 8bit colors.
     * https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit */
    function rgb8(str, color) {
        return run(str, code([38, 5, clampAndTruncate(color)], 39));
    }
    exports_2("rgb8", rgb8);
    /** Set background color using paletted 8bit colors.
     * https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit */
    function bgRgb8(str, color) {
        return run(str, code([48, 5, clampAndTruncate(color)], 49));
    }
    exports_2("bgRgb8", bgRgb8);
    /** Set text color using 24bit rgb.
     * `color` can be a number in range `0x000000` to `0xffffff` or
     * an `Rgb`.
     *
     * To produce the color magenta:
     *
     *      rgba24("foo", 0xff00ff);
     *      rgba24("foo", {r: 255, g: 0, b: 255});
     */
    function rgb24(str, color) {
        if (typeof color === "number") {
            return run(str, code([38, 2, (color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff], 39));
        }
        return run(str, code([
            38,
            2,
            clampAndTruncate(color.r),
            clampAndTruncate(color.g),
            clampAndTruncate(color.b),
        ], 39));
    }
    exports_2("rgb24", rgb24);
    /** Set background color using 24bit rgb.
     * `color` can be a number in range `0x000000` to `0xffffff` or
     * an `Rgb`.
     *
     * To produce the color magenta:
     *
     *      bgRgba24("foo", 0xff00ff);
     *      bgRgba24("foo", {r: 255, g: 0, b: 255});
     */
    function bgRgb24(str, color) {
        if (typeof color === "number") {
            return run(str, code([48, 2, (color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff], 49));
        }
        return run(str, code([
            48,
            2,
            clampAndTruncate(color.r),
            clampAndTruncate(color.g),
            clampAndTruncate(color.b),
        ], 49));
    }
    exports_2("bgRgb24", bgRgb24);
    function stripColor(string) {
        return string.replace(ANSI_PATTERN, "");
    }
    exports_2("stripColor", stripColor);
    return {
        setters: [],
        execute: function () {
            noColor = globalThis.Deno?.noColor ?? true;
            enabled = !noColor;
            // https://github.com/chalk/ansi-regex/blob/2b56fb0c7a07108e5b54241e8faec160d393aedb/index.js
            ANSI_PATTERN = new RegExp([
                "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
                "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))",
            ].join("|"), "g");
        }
    };
});
System.register("https://deno.land/std/fs/exists", [], function (exports_3, context_3) {
    "use strict";
    var __moduleName = context_3 && context_3.id;
    // Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
    /**
     * Test whether or not the given path exists by checking with the file system
     */
    async function exists(filePath) {
        try {
            await Deno.lstat(filePath);
            return true;
        }
        catch (err) {
            if (err instanceof Deno.errors.NotFound) {
                return false;
            }
            throw err;
        }
    }
    exports_3("exists", exists);
    /**
     * Test whether or not the given path exists by checking with the file system
     */
    function existsSync(filePath) {
        try {
            Deno.lstatSync(filePath);
            return true;
        }
        catch (err) {
            if (err instanceof Deno.errors.NotFound) {
                return false;
            }
            throw err;
        }
    }
    exports_3("existsSync", existsSync);
    return {
        setters: [],
        execute: function () {
        }
    };
});
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
System.register("https://deno.land/std/bytes/mod", [], function (exports_4, context_4) {
    "use strict";
    var __moduleName = context_4 && context_4.id;
    /** Find first index of binary pattern from a. If not found, then return -1
     * @param source source array
     * @param pat pattern to find in source array
     */
    function findIndex(source, pat) {
        const s = pat[0];
        for (let i = 0; i < source.length; i++) {
            if (source[i] !== s)
                continue;
            const pin = i;
            let matched = 1;
            let j = i;
            while (matched < pat.length) {
                j++;
                if (source[j] !== pat[j - pin]) {
                    break;
                }
                matched++;
            }
            if (matched === pat.length) {
                return pin;
            }
        }
        return -1;
    }
    exports_4("findIndex", findIndex);
    /** Find last index of binary pattern from a. If not found, then return -1.
     * @param source source array
     * @param pat pattern to find in source array
     */
    function findLastIndex(source, pat) {
        const e = pat[pat.length - 1];
        for (let i = source.length - 1; i >= 0; i--) {
            if (source[i] !== e)
                continue;
            const pin = i;
            let matched = 1;
            let j = i;
            while (matched < pat.length) {
                j--;
                if (source[j] !== pat[pat.length - 1 - (pin - j)]) {
                    break;
                }
                matched++;
            }
            if (matched === pat.length) {
                return pin - pat.length + 1;
            }
        }
        return -1;
    }
    exports_4("findLastIndex", findLastIndex);
    /** Check whether binary arrays are equal to each other.
     * @param source first array to check equality
     * @param match second array to check equality
     */
    function equal(source, match) {
        if (source.length !== match.length)
            return false;
        for (let i = 0; i < match.length; i++) {
            if (source[i] !== match[i])
                return false;
        }
        return true;
    }
    exports_4("equal", equal);
    /** Check whether binary array starts with prefix.
     * @param source srouce array
     * @param prefix prefix array to check in source
     */
    function hasPrefix(source, prefix) {
        for (let i = 0, max = prefix.length; i < max; i++) {
            if (source[i] !== prefix[i])
                return false;
        }
        return true;
    }
    exports_4("hasPrefix", hasPrefix);
    /** Check whether binary array ends with suffix.
     * @param source source array
     * @param suffix suffix array to check in source
     */
    function hasSuffix(source, suffix) {
        for (let srci = source.length - 1, sfxi = suffix.length - 1; sfxi >= 0; srci--, sfxi--) {
            if (source[srci] !== suffix[sfxi])
                return false;
        }
        return true;
    }
    exports_4("hasSuffix", hasSuffix);
    /** Repeat bytes. returns a new byte slice consisting of `count` copies of `b`.
     * @param origin The origin bytes
     * @param count The count you want to repeat.
     */
    function repeat(origin, count) {
        if (count === 0) {
            return new Uint8Array();
        }
        if (count < 0) {
            throw new Error("bytes: negative repeat count");
        }
        else if ((origin.length * count) / count !== origin.length) {
            throw new Error("bytes: repeat count causes overflow");
        }
        const int = Math.floor(count);
        if (int !== count) {
            throw new Error("bytes: repeat count must be an integer");
        }
        const nb = new Uint8Array(origin.length * count);
        let bp = copyBytes(origin, nb);
        for (; bp < nb.length; bp *= 2) {
            copyBytes(nb.slice(0, bp), nb, bp);
        }
        return nb;
    }
    exports_4("repeat", repeat);
    /** Concatenate two binary arrays and return new one.
     * @param origin origin array to concatenate
     * @param b array to concatenate with origin
     */
    function concat(origin, b) {
        const output = new Uint8Array(origin.length + b.length);
        output.set(origin, 0);
        output.set(b, origin.length);
        return output;
    }
    exports_4("concat", concat);
    /** Check source array contains pattern array.
     * @param source source array
     * @param pat patter array
     */
    function contains(source, pat) {
        return findIndex(source, pat) != -1;
    }
    exports_4("contains", contains);
    /**
     * Copy bytes from one Uint8Array to another.  Bytes from `src` which don't fit
     * into `dst` will not be copied.
     *
     * @param src Source byte array
     * @param dst Destination byte array
     * @param off Offset into `dst` at which to begin writing values from `src`.
     * @return number of bytes copied
     */
    function copyBytes(src, dst, off = 0) {
        off = Math.max(0, Math.min(off, dst.byteLength));
        const dstBytesAvailable = dst.byteLength - off;
        if (src.byteLength > dstBytesAvailable) {
            src = src.subarray(0, dstBytesAvailable);
        }
        dst.set(src, off);
        return src.byteLength;
    }
    exports_4("copyBytes", copyBytes);
    return {
        setters: [],
        execute: function () {
        }
    };
});
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
System.register("https://deno.land/std/_util/assert", [], function (exports_5, context_5) {
    "use strict";
    var DenoStdInternalError;
    var __moduleName = context_5 && context_5.id;
    /** Make an assertion, if not `true`, then throw. */
    function assert(expr, msg = "") {
        if (!expr) {
            throw new DenoStdInternalError(msg);
        }
    }
    exports_5("assert", assert);
    return {
        setters: [],
        execute: function () {
            DenoStdInternalError = class DenoStdInternalError extends Error {
                constructor(message) {
                    super(message);
                    this.name = "DenoStdInternalError";
                }
            };
            exports_5("DenoStdInternalError", DenoStdInternalError);
        }
    };
});
// Based on https://github.com/golang/go/blob/891682/src/bufio/bufio.go
// Copyright 2009 The Go Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
System.register("https://deno.land/std/io/bufio", ["https://deno.land/std/bytes/mod", "https://deno.land/std/_util/assert"], function (exports_6, context_6) {
    "use strict";
    var mod_ts_1, assert_ts_1, DEFAULT_BUF_SIZE, MIN_BUF_SIZE, MAX_CONSECUTIVE_EMPTY_READS, CR, LF, BufferFullError, PartialReadError, BufReader, AbstractBufBase, BufWriter, BufWriterSync;
    var __moduleName = context_6 && context_6.id;
    /** Generate longest proper prefix which is also suffix array. */
    function createLPS(pat) {
        const lps = new Uint8Array(pat.length);
        lps[0] = 0;
        let prefixEnd = 0;
        let i = 1;
        while (i < lps.length) {
            if (pat[i] == pat[prefixEnd]) {
                prefixEnd++;
                lps[i] = prefixEnd;
                i++;
            }
            else if (prefixEnd === 0) {
                lps[i] = 0;
                i++;
            }
            else {
                prefixEnd = pat[prefixEnd - 1];
            }
        }
        return lps;
    }
    /** Read delimited bytes from a Reader. */
    async function* readDelim(reader, delim) {
        // Avoid unicode problems
        const delimLen = delim.length;
        const delimLPS = createLPS(delim);
        let inputBuffer = new Deno.Buffer();
        const inspectArr = new Uint8Array(Math.max(1024, delimLen + 1));
        // Modified KMP
        let inspectIndex = 0;
        let matchIndex = 0;
        while (true) {
            const result = await reader.read(inspectArr);
            if (result === null) {
                // Yield last chunk.
                yield inputBuffer.bytes();
                return;
            }
            if (result < 0) {
                // Discard all remaining and silently fail.
                return;
            }
            const sliceRead = inspectArr.subarray(0, result);
            await Deno.writeAll(inputBuffer, sliceRead);
            let sliceToProcess = inputBuffer.bytes();
            while (inspectIndex < sliceToProcess.length) {
                if (sliceToProcess[inspectIndex] === delim[matchIndex]) {
                    inspectIndex++;
                    matchIndex++;
                    if (matchIndex === delimLen) {
                        // Full match
                        const matchEnd = inspectIndex - delimLen;
                        const readyBytes = sliceToProcess.subarray(0, matchEnd);
                        // Copy
                        const pendingBytes = sliceToProcess.slice(inspectIndex);
                        yield readyBytes;
                        // Reset match, different from KMP.
                        sliceToProcess = pendingBytes;
                        inspectIndex = 0;
                        matchIndex = 0;
                    }
                }
                else {
                    if (matchIndex === 0) {
                        inspectIndex++;
                    }
                    else {
                        matchIndex = delimLPS[matchIndex - 1];
                    }
                }
            }
            // Keep inspectIndex and matchIndex.
            inputBuffer = new Deno.Buffer(sliceToProcess);
        }
    }
    exports_6("readDelim", readDelim);
    /** Read delimited strings from a Reader. */
    async function* readStringDelim(reader, delim) {
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        for await (const chunk of readDelim(reader, encoder.encode(delim))) {
            yield decoder.decode(chunk);
        }
    }
    exports_6("readStringDelim", readStringDelim);
    /** Read strings line-by-line from a Reader. */
    // eslint-disable-next-line require-await
    async function* readLines(reader) {
        yield* readStringDelim(reader, "\n");
    }
    exports_6("readLines", readLines);
    return {
        setters: [
            function (mod_ts_1_1) {
                mod_ts_1 = mod_ts_1_1;
            },
            function (assert_ts_1_1) {
                assert_ts_1 = assert_ts_1_1;
            }
        ],
        execute: function () {
            DEFAULT_BUF_SIZE = 4096;
            MIN_BUF_SIZE = 16;
            MAX_CONSECUTIVE_EMPTY_READS = 100;
            CR = "\r".charCodeAt(0);
            LF = "\n".charCodeAt(0);
            BufferFullError = class BufferFullError extends Error {
                constructor(partial) {
                    super("Buffer full");
                    this.partial = partial;
                    this.name = "BufferFullError";
                }
            };
            exports_6("BufferFullError", BufferFullError);
            PartialReadError = class PartialReadError extends Deno.errors.UnexpectedEof {
                constructor() {
                    super("Encountered UnexpectedEof, data only partially read");
                    this.name = "PartialReadError";
                }
            };
            exports_6("PartialReadError", PartialReadError);
            /** BufReader implements buffering for a Reader object. */
            BufReader = class BufReader {
                constructor(rd, size = DEFAULT_BUF_SIZE) {
                    this.r = 0; // buf read position.
                    this.w = 0; // buf write position.
                    this.eof = false;
                    if (size < MIN_BUF_SIZE) {
                        size = MIN_BUF_SIZE;
                    }
                    this._reset(new Uint8Array(size), rd);
                }
                // private lastByte: number;
                // private lastCharSize: number;
                /** return new BufReader unless r is BufReader */
                static create(r, size = DEFAULT_BUF_SIZE) {
                    return r instanceof BufReader ? r : new BufReader(r, size);
                }
                /** Returns the size of the underlying buffer in bytes. */
                size() {
                    return this.buf.byteLength;
                }
                buffered() {
                    return this.w - this.r;
                }
                // Reads a new chunk into the buffer.
                async _fill() {
                    // Slide existing data to beginning.
                    if (this.r > 0) {
                        this.buf.copyWithin(0, this.r, this.w);
                        this.w -= this.r;
                        this.r = 0;
                    }
                    if (this.w >= this.buf.byteLength) {
                        throw Error("bufio: tried to fill full buffer");
                    }
                    // Read new data: try a limited number of times.
                    for (let i = MAX_CONSECUTIVE_EMPTY_READS; i > 0; i--) {
                        const rr = await this.rd.read(this.buf.subarray(this.w));
                        if (rr === null) {
                            this.eof = true;
                            return;
                        }
                        assert_ts_1.assert(rr >= 0, "negative read");
                        this.w += rr;
                        if (rr > 0) {
                            return;
                        }
                    }
                    throw new Error(`No progress after ${MAX_CONSECUTIVE_EMPTY_READS} read() calls`);
                }
                /** Discards any buffered data, resets all state, and switches
                 * the buffered reader to read from r.
                 */
                reset(r) {
                    this._reset(this.buf, r);
                }
                _reset(buf, rd) {
                    this.buf = buf;
                    this.rd = rd;
                    this.eof = false;
                    // this.lastByte = -1;
                    // this.lastCharSize = -1;
                }
                /** reads data into p.
                 * It returns the number of bytes read into p.
                 * The bytes are taken from at most one Read on the underlying Reader,
                 * hence n may be less than len(p).
                 * To read exactly len(p) bytes, use io.ReadFull(b, p).
                 */
                async read(p) {
                    let rr = p.byteLength;
                    if (p.byteLength === 0)
                        return rr;
                    if (this.r === this.w) {
                        if (p.byteLength >= this.buf.byteLength) {
                            // Large read, empty buffer.
                            // Read directly into p to avoid copy.
                            const rr = await this.rd.read(p);
                            const nread = rr ?? 0;
                            assert_ts_1.assert(nread >= 0, "negative read");
                            // if (rr.nread > 0) {
                            //   this.lastByte = p[rr.nread - 1];
                            //   this.lastCharSize = -1;
                            // }
                            return rr;
                        }
                        // One read.
                        // Do not use this.fill, which will loop.
                        this.r = 0;
                        this.w = 0;
                        rr = await this.rd.read(this.buf);
                        if (rr === 0 || rr === null)
                            return rr;
                        assert_ts_1.assert(rr >= 0, "negative read");
                        this.w += rr;
                    }
                    // copy as much as we can
                    const copied = mod_ts_1.copyBytes(this.buf.subarray(this.r, this.w), p, 0);
                    this.r += copied;
                    // this.lastByte = this.buf[this.r - 1];
                    // this.lastCharSize = -1;
                    return copied;
                }
                /** reads exactly `p.length` bytes into `p`.
                 *
                 * If successful, `p` is returned.
                 *
                 * If the end of the underlying stream has been reached, and there are no more
                 * bytes available in the buffer, `readFull()` returns `null` instead.
                 *
                 * An error is thrown if some bytes could be read, but not enough to fill `p`
                 * entirely before the underlying stream reported an error or EOF. Any error
                 * thrown will have a `partial` property that indicates the slice of the
                 * buffer that has been successfully filled with data.
                 *
                 * Ported from https://golang.org/pkg/io/#ReadFull
                 */
                async readFull(p) {
                    let bytesRead = 0;
                    while (bytesRead < p.length) {
                        try {
                            const rr = await this.read(p.subarray(bytesRead));
                            if (rr === null) {
                                if (bytesRead === 0) {
                                    return null;
                                }
                                else {
                                    throw new PartialReadError();
                                }
                            }
                            bytesRead += rr;
                        }
                        catch (err) {
                            err.partial = p.subarray(0, bytesRead);
                            throw err;
                        }
                    }
                    return p;
                }
                /** Returns the next byte [0, 255] or `null`. */
                async readByte() {
                    while (this.r === this.w) {
                        if (this.eof)
                            return null;
                        await this._fill(); // buffer is empty.
                    }
                    const c = this.buf[this.r];
                    this.r++;
                    // this.lastByte = c;
                    return c;
                }
                /** readString() reads until the first occurrence of delim in the input,
                 * returning a string containing the data up to and including the delimiter.
                 * If ReadString encounters an error before finding a delimiter,
                 * it returns the data read before the error and the error itself
                 * (often `null`).
                 * ReadString returns err != nil if and only if the returned data does not end
                 * in delim.
                 * For simple uses, a Scanner may be more convenient.
                 */
                async readString(delim) {
                    if (delim.length !== 1) {
                        throw new Error("Delimiter should be a single character");
                    }
                    const buffer = await this.readSlice(delim.charCodeAt(0));
                    if (buffer === null)
                        return null;
                    return new TextDecoder().decode(buffer);
                }
                /** `readLine()` is a low-level line-reading primitive. Most callers should
                 * use `readString('\n')` instead or use a Scanner.
                 *
                 * `readLine()` tries to return a single line, not including the end-of-line
                 * bytes. If the line was too long for the buffer then `more` is set and the
                 * beginning of the line is returned. The rest of the line will be returned
                 * from future calls. `more` will be false when returning the last fragment
                 * of the line. The returned buffer is only valid until the next call to
                 * `readLine()`.
                 *
                 * The text returned from ReadLine does not include the line end ("\r\n" or
                 * "\n").
                 *
                 * When the end of the underlying stream is reached, the final bytes in the
                 * stream are returned. No indication or error is given if the input ends
                 * without a final line end. When there are no more trailing bytes to read,
                 * `readLine()` returns `null`.
                 *
                 * Calling `unreadByte()` after `readLine()` will always unread the last byte
                 * read (possibly a character belonging to the line end) even if that byte is
                 * not part of the line returned by `readLine()`.
                 */
                async readLine() {
                    let line;
                    try {
                        line = await this.readSlice(LF);
                    }
                    catch (err) {
                        let { partial } = err;
                        assert_ts_1.assert(partial instanceof Uint8Array, "bufio: caught error from `readSlice()` without `partial` property");
                        // Don't throw if `readSlice()` failed with `BufferFullError`, instead we
                        // just return whatever is available and set the `more` flag.
                        if (!(err instanceof BufferFullError)) {
                            throw err;
                        }
                        // Handle the case where "\r\n" straddles the buffer.
                        if (!this.eof &&
                            partial.byteLength > 0 &&
                            partial[partial.byteLength - 1] === CR) {
                            // Put the '\r' back on buf and drop it from line.
                            // Let the next call to ReadLine check for "\r\n".
                            assert_ts_1.assert(this.r > 0, "bufio: tried to rewind past start of buffer");
                            this.r--;
                            partial = partial.subarray(0, partial.byteLength - 1);
                        }
                        return { line: partial, more: !this.eof };
                    }
                    if (line === null) {
                        return null;
                    }
                    if (line.byteLength === 0) {
                        return { line, more: false };
                    }
                    if (line[line.byteLength - 1] == LF) {
                        let drop = 1;
                        if (line.byteLength > 1 && line[line.byteLength - 2] === CR) {
                            drop = 2;
                        }
                        line = line.subarray(0, line.byteLength - drop);
                    }
                    return { line, more: false };
                }
                /** `readSlice()` reads until the first occurrence of `delim` in the input,
                 * returning a slice pointing at the bytes in the buffer. The bytes stop
                 * being valid at the next read.
                 *
                 * If `readSlice()` encounters an error before finding a delimiter, or the
                 * buffer fills without finding a delimiter, it throws an error with a
                 * `partial` property that contains the entire buffer.
                 *
                 * If `readSlice()` encounters the end of the underlying stream and there are
                 * any bytes left in the buffer, the rest of the buffer is returned. In other
                 * words, EOF is always treated as a delimiter. Once the buffer is empty,
                 * it returns `null`.
                 *
                 * Because the data returned from `readSlice()` will be overwritten by the
                 * next I/O operation, most clients should use `readString()` instead.
                 */
                async readSlice(delim) {
                    let s = 0; // search start index
                    let slice;
                    while (true) {
                        // Search buffer.
                        let i = this.buf.subarray(this.r + s, this.w).indexOf(delim);
                        if (i >= 0) {
                            i += s;
                            slice = this.buf.subarray(this.r, this.r + i + 1);
                            this.r += i + 1;
                            break;
                        }
                        // EOF?
                        if (this.eof) {
                            if (this.r === this.w) {
                                return null;
                            }
                            slice = this.buf.subarray(this.r, this.w);
                            this.r = this.w;
                            break;
                        }
                        // Buffer full?
                        if (this.buffered() >= this.buf.byteLength) {
                            this.r = this.w;
                            // #4521 The internal buffer should not be reused across reads because it causes corruption of data.
                            const oldbuf = this.buf;
                            const newbuf = this.buf.slice(0);
                            this.buf = newbuf;
                            throw new BufferFullError(oldbuf);
                        }
                        s = this.w - this.r; // do not rescan area we scanned before
                        // Buffer is not full.
                        try {
                            await this._fill();
                        }
                        catch (err) {
                            err.partial = slice;
                            throw err;
                        }
                    }
                    // Handle last byte, if any.
                    // const i = slice.byteLength - 1;
                    // if (i >= 0) {
                    //   this.lastByte = slice[i];
                    //   this.lastCharSize = -1
                    // }
                    return slice;
                }
                /** `peek()` returns the next `n` bytes without advancing the reader. The
                 * bytes stop being valid at the next read call.
                 *
                 * When the end of the underlying stream is reached, but there are unread
                 * bytes left in the buffer, those bytes are returned. If there are no bytes
                 * left in the buffer, it returns `null`.
                 *
                 * If an error is encountered before `n` bytes are available, `peek()` throws
                 * an error with the `partial` property set to a slice of the buffer that
                 * contains the bytes that were available before the error occurred.
                 */
                async peek(n) {
                    if (n < 0) {
                        throw Error("negative count");
                    }
                    let avail = this.w - this.r;
                    while (avail < n && avail < this.buf.byteLength && !this.eof) {
                        try {
                            await this._fill();
                        }
                        catch (err) {
                            err.partial = this.buf.subarray(this.r, this.w);
                            throw err;
                        }
                        avail = this.w - this.r;
                    }
                    if (avail === 0 && this.eof) {
                        return null;
                    }
                    else if (avail < n && this.eof) {
                        return this.buf.subarray(this.r, this.r + avail);
                    }
                    else if (avail < n) {
                        throw new BufferFullError(this.buf.subarray(this.r, this.w));
                    }
                    return this.buf.subarray(this.r, this.r + n);
                }
            };
            exports_6("BufReader", BufReader);
            AbstractBufBase = class AbstractBufBase {
                constructor() {
                    this.usedBufferBytes = 0;
                    this.err = null;
                }
                /** Size returns the size of the underlying buffer in bytes. */
                size() {
                    return this.buf.byteLength;
                }
                /** Returns how many bytes are unused in the buffer. */
                available() {
                    return this.buf.byteLength - this.usedBufferBytes;
                }
                /** buffered returns the number of bytes that have been written into the
                 * current buffer.
                 */
                buffered() {
                    return this.usedBufferBytes;
                }
            };
            /** BufWriter implements buffering for an deno.Writer object.
             * If an error occurs writing to a Writer, no more data will be
             * accepted and all subsequent writes, and flush(), will return the error.
             * After all data has been written, the client should call the
             * flush() method to guarantee all data has been forwarded to
             * the underlying deno.Writer.
             */
            BufWriter = class BufWriter extends AbstractBufBase {
                constructor(writer, size = DEFAULT_BUF_SIZE) {
                    super();
                    this.writer = writer;
                    if (size <= 0) {
                        size = DEFAULT_BUF_SIZE;
                    }
                    this.buf = new Uint8Array(size);
                }
                /** return new BufWriter unless writer is BufWriter */
                static create(writer, size = DEFAULT_BUF_SIZE) {
                    return writer instanceof BufWriter ? writer : new BufWriter(writer, size);
                }
                /** Discards any unflushed buffered data, clears any error, and
                 * resets buffer to write its output to w.
                 */
                reset(w) {
                    this.err = null;
                    this.usedBufferBytes = 0;
                    this.writer = w;
                }
                /** Flush writes any buffered data to the underlying io.Writer. */
                async flush() {
                    if (this.err !== null)
                        throw this.err;
                    if (this.usedBufferBytes === 0)
                        return;
                    try {
                        await Deno.writeAll(this.writer, this.buf.subarray(0, this.usedBufferBytes));
                    }
                    catch (e) {
                        this.err = e;
                        throw e;
                    }
                    this.buf = new Uint8Array(this.buf.length);
                    this.usedBufferBytes = 0;
                }
                /** Writes the contents of `data` into the buffer.  If the contents won't fully
                 * fit into the buffer, those bytes that can are copied into the buffer, the
                 * buffer is the flushed to the writer and the remaining bytes are copied into
                 * the now empty buffer.
                 *
                 * @return the number of bytes written to the buffer.
                 */
                async write(data) {
                    if (this.err !== null)
                        throw this.err;
                    if (data.length === 0)
                        return 0;
                    let totalBytesWritten = 0;
                    let numBytesWritten = 0;
                    while (data.byteLength > this.available()) {
                        if (this.buffered() === 0) {
                            // Large write, empty buffer.
                            // Write directly from data to avoid copy.
                            try {
                                numBytesWritten = await this.writer.write(data);
                            }
                            catch (e) {
                                this.err = e;
                                throw e;
                            }
                        }
                        else {
                            numBytesWritten = mod_ts_1.copyBytes(data, this.buf, this.usedBufferBytes);
                            this.usedBufferBytes += numBytesWritten;
                            await this.flush();
                        }
                        totalBytesWritten += numBytesWritten;
                        data = data.subarray(numBytesWritten);
                    }
                    numBytesWritten = mod_ts_1.copyBytes(data, this.buf, this.usedBufferBytes);
                    this.usedBufferBytes += numBytesWritten;
                    totalBytesWritten += numBytesWritten;
                    return totalBytesWritten;
                }
            };
            exports_6("BufWriter", BufWriter);
            /** BufWriterSync implements buffering for a deno.WriterSync object.
             * If an error occurs writing to a WriterSync, no more data will be
             * accepted and all subsequent writes, and flush(), will return the error.
             * After all data has been written, the client should call the
             * flush() method to guarantee all data has been forwarded to
             * the underlying deno.WriterSync.
             */
            BufWriterSync = class BufWriterSync extends AbstractBufBase {
                constructor(writer, size = DEFAULT_BUF_SIZE) {
                    super();
                    this.writer = writer;
                    if (size <= 0) {
                        size = DEFAULT_BUF_SIZE;
                    }
                    this.buf = new Uint8Array(size);
                }
                /** return new BufWriterSync unless writer is BufWriterSync */
                static create(writer, size = DEFAULT_BUF_SIZE) {
                    return writer instanceof BufWriterSync
                        ? writer
                        : new BufWriterSync(writer, size);
                }
                /** Discards any unflushed buffered data, clears any error, and
                 * resets buffer to write its output to w.
                 */
                reset(w) {
                    this.err = null;
                    this.usedBufferBytes = 0;
                    this.writer = w;
                }
                /** Flush writes any buffered data to the underlying io.WriterSync. */
                flush() {
                    if (this.err !== null)
                        throw this.err;
                    if (this.usedBufferBytes === 0)
                        return;
                    try {
                        Deno.writeAllSync(this.writer, this.buf.subarray(0, this.usedBufferBytes));
                    }
                    catch (e) {
                        this.err = e;
                        throw e;
                    }
                    this.buf = new Uint8Array(this.buf.length);
                    this.usedBufferBytes = 0;
                }
                /** Writes the contents of `data` into the buffer.  If the contents won't fully
                 * fit into the buffer, those bytes that can are copied into the buffer, the
                 * buffer is the flushed to the writer and the remaining bytes are copied into
                 * the now empty buffer.
                 *
                 * @return the number of bytes written to the buffer.
                 */
                writeSync(data) {
                    if (this.err !== null)
                        throw this.err;
                    if (data.length === 0)
                        return 0;
                    let totalBytesWritten = 0;
                    let numBytesWritten = 0;
                    while (data.byteLength > this.available()) {
                        if (this.buffered() === 0) {
                            // Large write, empty buffer.
                            // Write directly from data to avoid copy.
                            try {
                                numBytesWritten = this.writer.writeSync(data);
                            }
                            catch (e) {
                                this.err = e;
                                throw e;
                            }
                        }
                        else {
                            numBytesWritten = mod_ts_1.copyBytes(data, this.buf, this.usedBufferBytes);
                            this.usedBufferBytes += numBytesWritten;
                            this.flush();
                        }
                        totalBytesWritten += numBytesWritten;
                        data = data.subarray(numBytesWritten);
                    }
                    numBytesWritten = mod_ts_1.copyBytes(data, this.buf, this.usedBufferBytes);
                    this.usedBufferBytes += numBytesWritten;
                    totalBytesWritten += numBytesWritten;
                    return totalBytesWritten;
                }
            };
            exports_6("BufWriterSync", BufWriterSync);
        }
    };
});
System.register("https://deno.land/std/log/handlers", ["https://deno.land/std/log/levels", "https://deno.land/std/fmt/colors", "https://deno.land/std/fs/exists", "https://deno.land/std/io/bufio"], function (exports_7, context_7) {
    "use strict";
    var levels_ts_1, colors_ts_1, exists_ts_1, bufio_ts_1, DEFAULT_FORMATTER, BaseHandler, ConsoleHandler, WriterHandler, FileHandler, RotatingFileHandler;
    var __moduleName = context_7 && context_7.id;
    return {
        setters: [
            function (levels_ts_1_1) {
                levels_ts_1 = levels_ts_1_1;
            },
            function (colors_ts_1_1) {
                colors_ts_1 = colors_ts_1_1;
            },
            function (exists_ts_1_1) {
                exists_ts_1 = exists_ts_1_1;
            },
            function (bufio_ts_1_1) {
                bufio_ts_1 = bufio_ts_1_1;
            }
        ],
        execute: function () {
            DEFAULT_FORMATTER = "{levelName} {msg}";
            BaseHandler = class BaseHandler {
                constructor(levelName, options = {}) {
                    this.level = levels_ts_1.getLevelByName(levelName);
                    this.levelName = levelName;
                    this.formatter = options.formatter || DEFAULT_FORMATTER;
                }
                handle(logRecord) {
                    if (this.level > logRecord.level)
                        return;
                    const msg = this.format(logRecord);
                    return this.log(msg);
                }
                format(logRecord) {
                    if (this.formatter instanceof Function) {
                        return this.formatter(logRecord);
                    }
                    return this.formatter.replace(/{(\S+)}/g, (match, p1) => {
                        const value = logRecord[p1];
                        // do not interpolate missing values
                        if (value == null) {
                            return match;
                        }
                        return String(value);
                    });
                }
                log(_msg) { }
                async setup() { }
                async destroy() { }
            };
            exports_7("BaseHandler", BaseHandler);
            ConsoleHandler = class ConsoleHandler extends BaseHandler {
                format(logRecord) {
                    let msg = super.format(logRecord);
                    switch (logRecord.level) {
                        case levels_ts_1.LogLevels.INFO:
                            msg = colors_ts_1.blue(msg);
                            break;
                        case levels_ts_1.LogLevels.WARNING:
                            msg = colors_ts_1.yellow(msg);
                            break;
                        case levels_ts_1.LogLevels.ERROR:
                            msg = colors_ts_1.red(msg);
                            break;
                        case levels_ts_1.LogLevels.CRITICAL:
                            msg = colors_ts_1.bold(colors_ts_1.red(msg));
                            break;
                        default:
                            break;
                    }
                    return msg;
                }
                log(msg) {
                    console.log(msg);
                }
            };
            exports_7("ConsoleHandler", ConsoleHandler);
            WriterHandler = class WriterHandler extends BaseHandler {
                constructor() {
                    super(...arguments);
                    this.#encoder = new TextEncoder();
                }
                #encoder;
            };
            exports_7("WriterHandler", WriterHandler);
            FileHandler = class FileHandler extends WriterHandler {
                constructor(levelName, options) {
                    super(levelName, options);
                    this._encoder = new TextEncoder();
                    this.#unloadCallback = () => this.destroy();
                    this._filename = options.filename;
                    // default to append mode, write only
                    this._mode = options.mode ? options.mode : "a";
                    this._openOptions = {
                        createNew: this._mode === "x",
                        create: this._mode !== "x",
                        append: this._mode === "a",
                        truncate: this._mode !== "a",
                        write: true,
                    };
                }
                #unloadCallback;
                async setup() {
                    this._file = await Deno.open(this._filename, this._openOptions);
                    this._writer = this._file;
                    this._buf = new bufio_ts_1.BufWriterSync(this._file);
                    addEventListener("unload", this.#unloadCallback);
                }
                handle(logRecord) {
                    super.handle(logRecord);
                    // Immediately flush if log level is higher than ERROR
                    if (logRecord.level > levels_ts_1.LogLevels.ERROR) {
                        this.flush();
                    }
                }
                log(msg) {
                    this._buf.writeSync(this._encoder.encode(msg + "\n"));
                }
                flush() {
                    if (this._buf?.buffered() > 0) {
                        this._buf.flush();
                    }
                }
                destroy() {
                    this.flush();
                    this._file?.close();
                    this._file = undefined;
                    removeEventListener("unload", this.#unloadCallback);
                    return Promise.resolve();
                }
            };
            exports_7("FileHandler", FileHandler);
            RotatingFileHandler = class RotatingFileHandler extends FileHandler {
                constructor(levelName, options) {
                    super(levelName, options);
                    this.#currentFileSize = 0;
                    this.#maxBytes = options.maxBytes;
                    this.#maxBackupCount = options.maxBackupCount;
                }
                #maxBytes;
                #maxBackupCount;
                #currentFileSize;
                async setup() {
                    if (this.#maxBytes < 1) {
                        this.destroy();
                        throw new Error("maxBytes cannot be less than 1");
                    }
                    if (this.#maxBackupCount < 1) {
                        this.destroy();
                        throw new Error("maxBackupCount cannot be less than 1");
                    }
                    await super.setup();
                    if (this._mode === "w") {
                        // Remove old backups too as it doesn't make sense to start with a clean
                        // log file, but old backups
                        for (let i = 1; i <= this.#maxBackupCount; i++) {
                            if (await exists_ts_1.exists(this._filename + "." + i)) {
                                await Deno.remove(this._filename + "." + i);
                            }
                        }
                    }
                    else if (this._mode === "x") {
                        // Throw if any backups also exist
                        for (let i = 1; i <= this.#maxBackupCount; i++) {
                            if (await exists_ts_1.exists(this._filename + "." + i)) {
                                this.destroy();
                                throw new Deno.errors.AlreadyExists("Backup log file " + this._filename + "." + i + " already exists");
                            }
                        }
                    }
                    else {
                        this.#currentFileSize = (await Deno.stat(this._filename)).size;
                    }
                }
                log(msg) {
                    const msgByteLength = this._encoder.encode(msg).byteLength + 1;
                    if (this.#currentFileSize + msgByteLength > this.#maxBytes) {
                        this.rotateLogFiles();
                        this.#currentFileSize = 0;
                    }
                    this._buf.writeSync(this._encoder.encode(msg + "\n"));
                    this.#currentFileSize += msgByteLength;
                }
                rotateLogFiles() {
                    this._buf.flush();
                    Deno.close(this._file.rid);
                    for (let i = this.#maxBackupCount - 1; i >= 0; i--) {
                        const source = this._filename + (i === 0 ? "" : "." + i);
                        const dest = this._filename + "." + (i + 1);
                        if (exists_ts_1.existsSync(source)) {
                            Deno.renameSync(source, dest);
                        }
                    }
                    this._file = Deno.openSync(this._filename, this._openOptions);
                    this._writer = this._file;
                    this._buf = new bufio_ts_1.BufWriterSync(this._file);
                }
            };
            exports_7("RotatingFileHandler", RotatingFileHandler);
        }
    };
});
System.register("https://deno.land/std/log/logger", ["https://deno.land/std/log/levels"], function (exports_8, context_8) {
    "use strict";
    var levels_ts_2, LogRecord, Logger;
    var __moduleName = context_8 && context_8.id;
    return {
        setters: [
            function (levels_ts_2_1) {
                levels_ts_2 = levels_ts_2_1;
            }
        ],
        execute: function () {
            LogRecord = class LogRecord {
                constructor(options) {
                    this.msg = options.msg;
                    this.#args = [...options.args];
                    this.level = options.level;
                    this.loggerName = options.loggerName;
                    this.#datetime = new Date();
                    this.levelName = levels_ts_2.getLevelName(options.level);
                }
                #args;
                #datetime;
                get args() {
                    return [...this.#args];
                }
                get datetime() {
                    return new Date(this.#datetime.getTime());
                }
            };
            exports_8("LogRecord", LogRecord);
            Logger = class Logger {
                constructor(loggerName, levelName, options = {}) {
                    this.loggerName = loggerName;
                    this.level = levels_ts_2.getLevelByName(levelName);
                    this.levelName = levelName;
                    this.handlers = options.handlers || [];
                }
                /** If the level of the logger is greater than the level to log, then nothing
                 * is logged, otherwise a log record is passed to each log handler.  `msg` data
                 * passed in is returned.  If a function is passed in, it is only evaluated
                 * if the msg will be logged and the return value will be the result of the
                 * function, not the function itself, unless the function isn't called, in which
                 * case undefined is returned.  All types are coerced to strings for logging.
                 */
                _log(level, msg, ...args) {
                    if (this.level > level) {
                        return msg instanceof Function ? undefined : msg;
                    }
                    let fnResult;
                    let logMessage;
                    if (msg instanceof Function) {
                        fnResult = msg();
                        logMessage = this.asString(fnResult);
                    }
                    else {
                        logMessage = this.asString(msg);
                    }
                    const record = new LogRecord({
                        msg: logMessage,
                        args: args,
                        level: level,
                        loggerName: this.loggerName,
                    });
                    this.handlers.forEach((handler) => {
                        handler.handle(record);
                    });
                    return msg instanceof Function ? fnResult : msg;
                }
                asString(data) {
                    if (typeof data === "string") {
                        return data;
                    }
                    else if (data === null ||
                        typeof data === "number" ||
                        typeof data === "bigint" ||
                        typeof data === "boolean" ||
                        typeof data === "undefined" ||
                        typeof data === "symbol") {
                        return String(data);
                    }
                    else if (typeof data === "object") {
                        return JSON.stringify(data);
                    }
                    return "undefined";
                }
                debug(msg, ...args) {
                    return this._log(levels_ts_2.LogLevels.DEBUG, msg, ...args);
                }
                info(msg, ...args) {
                    return this._log(levels_ts_2.LogLevels.INFO, msg, ...args);
                }
                warning(msg, ...args) {
                    return this._log(levels_ts_2.LogLevels.WARNING, msg, ...args);
                }
                error(msg, ...args) {
                    return this._log(levels_ts_2.LogLevels.ERROR, msg, ...args);
                }
                critical(msg, ...args) {
                    return this._log(levels_ts_2.LogLevels.CRITICAL, msg, ...args);
                }
            };
            exports_8("Logger", Logger);
        }
    };
});
System.register("https://deno.land/std/log/mod", ["https://deno.land/std/log/logger", "https://deno.land/std/log/handlers", "https://deno.land/std/_util/assert", "https://deno.land/std/log/levels"], function (exports_9, context_9) {
    "use strict";
    var logger_ts_1, handlers_ts_1, assert_ts_2, LoggerConfig, DEFAULT_LEVEL, DEFAULT_CONFIG, state, handlers;
    var __moduleName = context_9 && context_9.id;
    function getLogger(name) {
        if (!name) {
            const d = state.loggers.get("default");
            assert_ts_2.assert(d != null, `"default" logger must be set for getting logger without name`);
            return d;
        }
        const result = state.loggers.get(name);
        if (!result) {
            const logger = new logger_ts_1.Logger(name, "NOTSET", { handlers: [] });
            state.loggers.set(name, logger);
            return logger;
        }
        return result;
    }
    exports_9("getLogger", getLogger);
    function debug(msg, ...args) {
        // Assist TS compiler with pass-through generic type
        if (msg instanceof Function) {
            return getLogger("default").debug(msg, ...args);
        }
        return getLogger("default").debug(msg, ...args);
    }
    exports_9("debug", debug);
    function info(msg, ...args) {
        // Assist TS compiler with pass-through generic type
        if (msg instanceof Function) {
            return getLogger("default").info(msg, ...args);
        }
        return getLogger("default").info(msg, ...args);
    }
    exports_9("info", info);
    function warning(msg, ...args) {
        // Assist TS compiler with pass-through generic type
        if (msg instanceof Function) {
            return getLogger("default").warning(msg, ...args);
        }
        return getLogger("default").warning(msg, ...args);
    }
    exports_9("warning", warning);
    function error(msg, ...args) {
        // Assist TS compiler with pass-through generic type
        if (msg instanceof Function) {
            return getLogger("default").error(msg, ...args);
        }
        return getLogger("default").error(msg, ...args);
    }
    exports_9("error", error);
    function critical(msg, ...args) {
        // Assist TS compiler with pass-through generic type
        if (msg instanceof Function) {
            return getLogger("default").critical(msg, ...args);
        }
        return getLogger("default").critical(msg, ...args);
    }
    exports_9("critical", critical);
    async function setup(config) {
        state.config = {
            handlers: { ...DEFAULT_CONFIG.handlers, ...config.handlers },
            loggers: { ...DEFAULT_CONFIG.loggers, ...config.loggers },
        };
        // tear down existing handlers
        state.handlers.forEach((handler) => {
            handler.destroy();
        });
        state.handlers.clear();
        // setup handlers
        const handlers = state.config.handlers || {};
        for (const handlerName in handlers) {
            const handler = handlers[handlerName];
            await handler.setup();
            state.handlers.set(handlerName, handler);
        }
        // remove existing loggers
        state.loggers.clear();
        // setup loggers
        const loggers = state.config.loggers || {};
        for (const loggerName in loggers) {
            const loggerConfig = loggers[loggerName];
            const handlerNames = loggerConfig.handlers || [];
            const handlers = [];
            handlerNames.forEach((handlerName) => {
                const handler = state.handlers.get(handlerName);
                if (handler) {
                    handlers.push(handler);
                }
            });
            const levelName = loggerConfig.level || DEFAULT_LEVEL;
            const logger = new logger_ts_1.Logger(loggerName, levelName, { handlers: handlers });
            state.loggers.set(loggerName, logger);
        }
    }
    exports_9("setup", setup);
    return {
        setters: [
            function (logger_ts_1_1) {
                logger_ts_1 = logger_ts_1_1;
            },
            function (handlers_ts_1_1) {
                handlers_ts_1 = handlers_ts_1_1;
            },
            function (assert_ts_2_1) {
                assert_ts_2 = assert_ts_2_1;
            },
            function (levels_ts_3_1) {
                exports_9({
                    "LogLevels": levels_ts_3_1["LogLevels"]
                });
            }
        ],
        execute: async function () {
            LoggerConfig = class LoggerConfig {
            };
            exports_9("LoggerConfig", LoggerConfig);
            DEFAULT_LEVEL = "INFO";
            DEFAULT_CONFIG = {
                handlers: {
                    default: new handlers_ts_1.ConsoleHandler(DEFAULT_LEVEL),
                },
                loggers: {
                    default: {
                        level: DEFAULT_LEVEL,
                        handlers: ["default"],
                    },
                },
            };
            state = {
                handlers: new Map(),
                loggers: new Map(),
                config: DEFAULT_CONFIG,
            };
            exports_9("handlers", handlers = {
                BaseHandler: handlers_ts_1.BaseHandler,
                ConsoleHandler: handlers_ts_1.ConsoleHandler,
                WriterHandler: handlers_ts_1.WriterHandler,
                FileHandler: handlers_ts_1.FileHandler,
                RotatingFileHandler: handlers_ts_1.RotatingFileHandler,
            });
            await setup(DEFAULT_CONFIG);
        }
    };
});
System.register("https://deno.land/x/lodash/.internal/getTag", [], function (exports_10, context_10) {
    "use strict";
    var toString;
    var __moduleName = context_10 && context_10.id;
    /**
     * Gets the `toStringTag` of `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    function getTag(value) {
        if (value == null) {
            return value === undefined ? '[object Undefined]' : '[object Null]';
        }
        return toString.call(value);
    }
    return {
        setters: [],
        execute: function () {
            toString = Object.prototype.toString;
            exports_10("default", getTag);
        }
    };
});
System.register("https://deno.land/x/lodash/isObjectLike", [], function (exports_11, context_11) {
    "use strict";
    var __moduleName = context_11 && context_11.id;
    /**
     * Checks if `value` is object-like. A value is object-like if it's not `null`
     * and has a `typeof` result of "object".
     *
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
     * @example
     *
     * isObjectLike({})
     * // => true
     *
     * isObjectLike([1, 2, 3])
     * // => true
     *
     * isObjectLike(Function)
     * // => false
     *
     * isObjectLike(null)
     * // => false
     */
    function isObjectLike(value) {
        return typeof value === 'object' && value !== null;
    }
    return {
        setters: [],
        execute: function () {
            exports_11("default", isObjectLike);
        }
    };
});
System.register("https://deno.land/x/lodash/isArguments", ["https://deno.land/x/lodash/.internal/getTag", "https://deno.land/x/lodash/isObjectLike"], function (exports_12, context_12) {
    "use strict";
    var getTag_js_1, isObjectLike_js_1;
    var __moduleName = context_12 && context_12.id;
    /**
     * Checks if `value` is likely an `arguments` object.
     *
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an `arguments` object, else `false`.
     * @example
     *
     * isArguments(function() { return arguments }())
     * // => true
     *
     * isArguments([1, 2, 3])
     * // => false
     */
    function isArguments(value) {
        return isObjectLike_js_1.default(value) && getTag_js_1.default(value) == '[object Arguments]';
    }
    return {
        setters: [
            function (getTag_js_1_1) {
                getTag_js_1 = getTag_js_1_1;
            },
            function (isObjectLike_js_1_1) {
                isObjectLike_js_1 = isObjectLike_js_1_1;
            }
        ],
        execute: function () {
            exports_12("default", isArguments);
        }
    };
});
System.register("https://deno.land/x/lodash/isLength", [], function (exports_13, context_13) {
    "use strict";
    var MAX_SAFE_INTEGER;
    var __moduleName = context_13 && context_13.id;
    /**
     * Checks if `value` is a valid array-like length.
     *
     * **Note:** This method is loosely based on
     * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
     *
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
     * @example
     *
     * isLength(3)
     * // => true
     *
     * isLength(Number.MIN_VALUE)
     * // => false
     *
     * isLength(Infinity)
     * // => false
     *
     * isLength('3')
     * // => false
     */
    function isLength(value) {
        return typeof value === 'number' &&
            value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }
    return {
        setters: [],
        execute: function () {
            /** Used as references for various `Number` constants. */
            MAX_SAFE_INTEGER = 9007199254740991;
            exports_13("default", isLength);
        }
    };
});
System.register("https://deno.land/x/lodash/isArrayLike", ["https://deno.land/x/lodash/isLength"], function (exports_14, context_14) {
    "use strict";
    var isLength_js_1;
    var __moduleName = context_14 && context_14.id;
    /**
     * Checks if `value` is array-like. A value is considered array-like if it's
     * not a function and has a `value.length` that's an integer greater than or
     * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
     *
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
     * @example
     *
     * isArrayLike([1, 2, 3])
     * // => true
     *
     * isArrayLike(document.body.children)
     * // => true
     *
     * isArrayLike('abc')
     * // => true
     *
     * isArrayLike(Function)
     * // => false
     */
    function isArrayLike(value) {
        return value != null && typeof value !== 'function' && isLength_js_1.default(value.length);
    }
    return {
        setters: [
            function (isLength_js_1_1) {
                isLength_js_1 = isLength_js_1_1;
            }
        ],
        execute: function () {
            exports_14("default", isArrayLike);
        }
    };
});
System.register("https://deno.land/x/lodash/.internal/freeGlobal", [], function (exports_15, context_15) {
    "use strict";
    var freeGlobal;
    var __moduleName = context_15 && context_15.id;
    return {
        setters: [],
        execute: function () {
            /** Detect free variable `global` from Node.js. */
            freeGlobal = typeof global === 'object' && global !== null && global.Object === Object && global;
            exports_15("default", freeGlobal);
        }
    };
});
System.register("https://deno.land/x/lodash/.internal/root", ["https://deno.land/x/lodash/.internal/freeGlobal"], function (exports_16, context_16) {
    "use strict";
    var freeGlobal_js_1, freeGlobalThis, freeSelf, root;
    var __moduleName = context_16 && context_16.id;
    return {
        setters: [
            function (freeGlobal_js_1_1) {
                freeGlobal_js_1 = freeGlobal_js_1_1;
            }
        ],
        execute: function () {
            /** Detect free variable `globalThis` */
            freeGlobalThis = typeof globalThis === 'object' && globalThis !== null && globalThis.Object == Object && globalThis;
            /** Detect free variable `self`. */
            freeSelf = typeof self === 'object' && self !== null && self.Object === Object && self;
            /** Used as a reference to the global object. */
            root = freeGlobalThis || freeGlobal_js_1.default || freeSelf || Function('return this')();
            exports_16("default", root);
        }
    };
});
System.register("https://deno.land/x/lodash/isBuffer", ["https://deno.land/x/lodash/.internal/root"], function (exports_17, context_17) {
    "use strict";
    var root_js_1, freeExports, freeModule, moduleExports, Buffer, nativeIsBuffer, isBuffer;
    var __moduleName = context_17 && context_17.id;
    return {
        setters: [
            function (root_js_1_1) {
                root_js_1 = root_js_1_1;
            }
        ],
        execute: function () {
            /** Detect free variable `exports`. */
            freeExports = typeof exports === 'object' && exports !== null && !exports.nodeType && exports;
            /** Detect free variable `module`. */
            freeModule = freeExports && typeof module === 'object' && module !== null && !module.nodeType && module;
            /** Detect the popular CommonJS extension `module.exports`. */
            moduleExports = freeModule && freeModule.exports === freeExports;
            /** Built-in value references. */
            Buffer = moduleExports ? root_js_1.default.Buffer : undefined;
            /* Built-in method references for those with the same name as other `lodash` methods. */
            nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;
            /**
             * Checks if `value` is a buffer.
             *
             * @since 4.3.0
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
             * @example
             *
             * isBuffer(new Buffer(2))
             * // => true
             *
             * isBuffer(new Uint8Array(2))
             * // => false
             */
            isBuffer = nativeIsBuffer || (() => false);
            exports_17("default", isBuffer);
        }
    };
});
System.register("https://deno.land/x/lodash/.internal/isPrototype", [], function (exports_18, context_18) {
    "use strict";
    var objectProto;
    var __moduleName = context_18 && context_18.id;
    /**
     * Checks if `value` is likely a prototype object.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
     */
    function isPrototype(value) {
        const Ctor = value && value.constructor;
        const proto = (typeof Ctor === 'function' && Ctor.prototype) || objectProto;
        return value === proto;
    }
    return {
        setters: [],
        execute: function () {
            /** Used for built-in method references. */
            objectProto = Object.prototype;
            exports_18("default", isPrototype);
        }
    };
});
System.register("https://deno.land/x/lodash/.internal/nodeTypes", ["https://deno.land/x/lodash/.internal/freeGlobal"], function (exports_19, context_19) {
    "use strict";
    var freeGlobal_js_2, freeExports, freeModule, moduleExports, freeProcess, nodeTypes;
    var __moduleName = context_19 && context_19.id;
    return {
        setters: [
            function (freeGlobal_js_2_1) {
                freeGlobal_js_2 = freeGlobal_js_2_1;
            }
        ],
        execute: function () {
            /** Detect free variable `exports`. */
            freeExports = typeof exports === 'object' && exports !== null && !exports.nodeType && exports;
            /** Detect free variable `module`. */
            freeModule = freeExports && typeof module === 'object' && module !== null && !module.nodeType && module;
            /** Detect the popular CommonJS extension `module.exports`. */
            moduleExports = freeModule && freeModule.exports === freeExports;
            /** Detect free variable `process` from Node.js. */
            freeProcess = moduleExports && freeGlobal_js_2.default.process;
            /** Used to access faster Node.js helpers. */
            nodeTypes = ((() => {
                try {
                    /* Detect public `util.types` helpers for Node.js v10+. */
                    /* Node.js deprecation code: DEP0103. */
                    const typesHelper = freeModule && freeModule.require && freeModule.require('util').types;
                    return typesHelper
                        ? typesHelper
                        /* Legacy process.binding('util') for Node.js earlier than v10. */
                        : freeProcess && freeProcess.binding && freeProcess.binding('util');
                }
                catch (e) { }
            })());
            exports_19("default", nodeTypes);
        }
    };
});
System.register("https://deno.land/x/lodash/isTypedArray", ["https://deno.land/x/lodash/.internal/getTag", "https://deno.land/x/lodash/.internal/nodeTypes", "https://deno.land/x/lodash/isObjectLike"], function (exports_20, context_20) {
    "use strict";
    var getTag_js_2, nodeTypes_js_1, isObjectLike_js_2, reTypedTag, nodeIsTypedArray, isTypedArray;
    var __moduleName = context_20 && context_20.id;
    return {
        setters: [
            function (getTag_js_2_1) {
                getTag_js_2 = getTag_js_2_1;
            },
            function (nodeTypes_js_1_1) {
                nodeTypes_js_1 = nodeTypes_js_1_1;
            },
            function (isObjectLike_js_2_1) {
                isObjectLike_js_2 = isObjectLike_js_2_1;
            }
        ],
        execute: function () {
            /** Used to match `toStringTag` values of typed arrays. */
            reTypedTag = /^\[object (?:Float(?:32|64)|(?:Int|Uint)(?:8|16|32)|Uint8Clamped)Array\]$/;
            /* Node.js helper references. */
            nodeIsTypedArray = nodeTypes_js_1.default && nodeTypes_js_1.default.isTypedArray;
            /**
             * Checks if `value` is classified as a typed array.
             *
             * @since 3.0.0
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
             * @example
             *
             * isTypedArray(new Uint8Array)
             * // => true
             *
             * isTypedArray([])
             * // => false
             */
            isTypedArray = nodeIsTypedArray
                ? (value) => nodeIsTypedArray(value)
                : (value) => isObjectLike_js_2.default(value) && reTypedTag.test(getTag_js_2.default(value));
            exports_20("default", isTypedArray);
        }
    };
});
System.register("https://deno.land/x/lodash/isEmpty", ["https://deno.land/x/lodash/.internal/getTag", "https://deno.land/x/lodash/isArguments", "https://deno.land/x/lodash/isArrayLike", "https://deno.land/x/lodash/isBuffer", "https://deno.land/x/lodash/.internal/isPrototype", "https://deno.land/x/lodash/isTypedArray"], function (exports_21, context_21) {
    "use strict";
    var getTag_js_3, isArguments_js_1, isArrayLike_js_1, isBuffer_js_1, isPrototype_js_1, isTypedArray_js_1, hasOwnProperty;
    var __moduleName = context_21 && context_21.id;
    /**
     * Checks if `value` is an empty object, collection, map, or set.
     *
     * Objects are considered empty if they have no own enumerable string keyed
     * properties.
     *
     * Array-like values such as `arguments` objects, arrays, buffers, strings, or
     * jQuery-like collections are considered empty if they have a `length` of `0`.
     * Similarly, maps and sets are considered empty if they have a `size` of `0`.
     *
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is empty, else `false`.
     * @example
     *
     * isEmpty(null)
     * // => true
     *
     * isEmpty(true)
     * // => true
     *
     * isEmpty(1)
     * // => true
     *
     * isEmpty([1, 2, 3])
     * // => false
     *
     * isEmpty('abc')
     * // => false
     *
     * isEmpty({ 'a': 1 })
     * // => false
     */
    function isEmpty(value) {
        if (value == null) {
            return true;
        }
        if (isArrayLike_js_1.default(value) &&
            (Array.isArray(value) || typeof value === 'string' || typeof value.splice === 'function' ||
                isBuffer_js_1.default(value) || isTypedArray_js_1.default(value) || isArguments_js_1.default(value))) {
            return !value.length;
        }
        const tag = getTag_js_3.default(value);
        if (tag == '[object Map]' || tag == '[object Set]') {
            return !value.size;
        }
        if (isPrototype_js_1.default(value)) {
            return !Object.keys(value).length;
        }
        for (const key in value) {
            if (hasOwnProperty.call(value, key)) {
                return false;
            }
        }
        return true;
    }
    return {
        setters: [
            function (getTag_js_3_1) {
                getTag_js_3 = getTag_js_3_1;
            },
            function (isArguments_js_1_1) {
                isArguments_js_1 = isArguments_js_1_1;
            },
            function (isArrayLike_js_1_1) {
                isArrayLike_js_1 = isArrayLike_js_1_1;
            },
            function (isBuffer_js_1_1) {
                isBuffer_js_1 = isBuffer_js_1_1;
            },
            function (isPrototype_js_1_1) {
                isPrototype_js_1 = isPrototype_js_1_1;
            },
            function (isTypedArray_js_1_1) {
                isTypedArray_js_1 = isTypedArray_js_1_1;
            }
        ],
        execute: function () {
            /** Used to check objects for own properties. */
            hasOwnProperty = Object.prototype.hasOwnProperty;
            exports_21("default", isEmpty);
        }
    };
});
System.register("file:///home/dev/project/node/deno_package/user.class", [], function (exports_22, context_22) {
    "use strict";
    var name;
    var __moduleName = context_22 && context_22.id;
    return {
        setters: [],
        execute: function () {
            exports_22("name", name = 'reza');
        }
    };
});
System.register("https://deno.land/x/url_join/mod", [], function (exports_23, context_23) {
    "use strict";
    var urlJoin, normalize;
    var __moduleName = context_23 && context_23.id;
    return {
        setters: [],
        execute: function () {
            exports_23("urlJoin", urlJoin = function (...args) {
                let input;
                if (typeof args[0] === 'object') {
                    input = args[0];
                }
                else {
                    input = [].slice.call(args);
                }
                return normalize(input);
            });
            normalize = (strArray) => {
                const resultArray = [];
                if (strArray.length === 0) {
                    return '';
                }
                if (typeof strArray[0] !== 'string') {
                    throw new TypeError('Url must be a string. Received ' + strArray[0]);
                }
                // If the first part is a plain protocol, we combine it with the next part.
                if (strArray[0].match(/^[^/:]+:\/*$/) && strArray.length > 1) {
                    const first = strArray.shift();
                    strArray[0] = first + strArray[0];
                }
                // There must be two or three slashes in the file protocol, two slashes in anything else.
                if (strArray[0].match(/^file:\/\/\//)) {
                    strArray[0] = strArray[0].replace(/^([^/:]+):\/*/, '$1:///');
                }
                else {
                    strArray[0] = strArray[0].replace(/^([^/:]+):\/*/, '$1://');
                }
                for (let i = 0; i < strArray.length; i++) {
                    let component = strArray[i];
                    if (typeof component !== 'string') {
                        throw new TypeError('Url must be a string. Received ' + component);
                    }
                    if (component === '') {
                        continue;
                    }
                    if (i > 0) {
                        // Removing the starting slashes for each component but the first.
                        component = component.replace(/^[\/]+/, '');
                    }
                    if (i < strArray.length - 1) {
                        // Removing the ending slashes for each component but the last.
                        component = component.replace(/[\/]+$/, '');
                    }
                    else {
                        // For the last component we will combine multiple slashes to a single one.
                        component = component.replace(/[\/]+$/, '/');
                    }
                    resultArray.push(component);
                }
                let str = resultArray.join('/');
                // Each input component is now separated by a single slash except the possible first plain protocol part.
                // remove trailing slash before parameters or hash
                str = str.replace(/\/(\?|&|#[^!])/g, '$1');
                // replace ? in parameters with &
                let parts = str.split('?');
                str = parts.shift() + (parts.length > 0 ? '?' : '') + parts.join('&');
                return str;
            };
        }
    };
});
System.register("https://deno.land/x/axiod/interfaces", [], function (exports_24, context_24) {
    "use strict";
    var __moduleName = context_24 && context_24.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("https://deno.land/x/axiod/helpers", [], function (exports_25, context_25) {
    "use strict";
    var methods;
    var __moduleName = context_25 && context_25.id;
    return {
        setters: [],
        execute: function () {
            exports_25("methods", methods = [
                "get",
                "post",
                "put",
                "delete",
                "options",
                "head",
                "connect",
                "trace",
                "patch",
            ]);
        }
    };
});
System.register("https://deno.land/x/axiod/mod", ["https://deno.land/x/url_join/mod", "https://deno.land/x/axiod/helpers"], function (exports_26, context_26) {
    "use strict";
    var mod_ts_2, helpers_ts_1;
    var __moduleName = context_26 && context_26.id;
    function axiod(url, config) {
        if (typeof url === "string") {
            return axiod.request(Object.assign({}, axiod.defaults, { url }, config));
        }
        return axiod.request(Object.assign({}, axiod.defaults, url));
    }
    return {
        setters: [
            function (mod_ts_2_1) {
                mod_ts_2 = mod_ts_2_1;
            },
            function (helpers_ts_1_1) {
                helpers_ts_1 = helpers_ts_1_1;
            }
        ],
        execute: function () {
            axiod.defaults = {
                url: "/",
                method: "get",
                timeout: 0,
                withCredentials: false,
                validateStatus: (status) => {
                    return status >= 200 && status < 300;
                },
            };
            axiod.create = (config) => {
                const instance = Object.assign({}, axiod);
                instance.defaults = Object.assign({}, axiod.defaults, config);
                instance.defaults.timeout = 1000;
                return instance;
            };
            axiod.request = ({ url = "/", baseURL, method, headers, params, data, timeout, withCredentials, auth, validateStatus, paramsSerializer, transformRequest, transformResponse, }) => {
                // Url and Base url
                if (baseURL) {
                    url = mod_ts_2.urlJoin(baseURL, url);
                }
                // Method
                if (method) {
                    if (helpers_ts_1.methods.indexOf(method.toLowerCase().trim()) === -1) {
                        throw new Error(`Method ${method} is not supported`);
                    }
                    else {
                        method = method.toLowerCase().trim();
                    }
                }
                else {
                    method = "get";
                }
                // Params
                let _params = "";
                if (params) {
                    if (paramsSerializer) {
                        _params = paramsSerializer(params);
                    }
                    else {
                        _params = Object.keys(params)
                            .map((key) => {
                            return (encodeURIComponent(key) + "=" + encodeURIComponent(params[key]));
                        })
                            .join("&");
                    }
                }
                // Add credentials to header
                if (withCredentials) {
                    if (auth?.username && auth?.password) {
                        if (!headers) {
                            headers = {};
                        }
                        headers["Authorization"] = "Basic " +
                            btoa(unescape(encodeURIComponent(`${auth.username}:${auth.password}`)));
                    }
                }
                // Create fetch Request Config
                const fetchRequestObject = {};
                // Add method to Request Config
                if (method !== "get") {
                    fetchRequestObject.method = method.toUpperCase();
                }
                // Add params to Request Config Url
                if (_params) {
                    url = mod_ts_2.urlJoin(url, `?${params}`);
                }
                // Add body to Request Config
                if (data && method !== "get") {
                    // transformRequest
                    if (transformRequest &&
                        Array.isArray(transformRequest) &&
                        transformRequest.length > 0) {
                        for (var i = 0; i < (transformRequest || []).length; i++) {
                            if (transformRequest && transformRequest[i]) {
                                data = transformRequest[i](data, headers);
                            }
                        }
                    }
                    if (typeof data === "string" || data instanceof FormData) {
                        fetchRequestObject.body = data;
                    }
                    else {
                        try {
                            fetchRequestObject.body = JSON.stringify(data);
                            if (!headers) {
                                headers = {};
                            }
                            headers["Accept"] = "application/json";
                            headers["Content-Type"] = "application/json";
                        }
                        catch (ex) { }
                    }
                }
                // Add headers to Request Config
                if (headers) {
                    const _headers = new Headers();
                    Object.keys(headers).forEach((header) => {
                        if (headers && headers[header]) {
                            _headers.set(header, headers[header]);
                        }
                    });
                    fetchRequestObject.headers = _headers;
                }
                // [TODO] Mouadh HSOUMI
                // Remove commented test when Abort is supported by Deno
                // https://github.com/denoland/deno/issues/5471
                // https://github.com/Code-Hex/deno-context/issues/8
                // Timeout
                // const controller = new AbortController();
                // fetchRequestObject.signal = controller.signal;
                // let timeoutVar: number = 0;
                // console.log("timeout", timeout);
                // if ((timeout || 0) > 0) {
                //   timeoutVar = setTimeout(() => {
                //     timeoutVar = 0;
                //     console.log("Cancecled controller.abort()");
                //     controller.abort();
                //   }, timeout);
                // }
                // Start request
                return fetch(url, fetchRequestObject).then(async (x) => {
                    // // Clear timeout
                    // if (timeoutVar) {
                    //   clearTimeout(timeoutVar);
                    // }
                    const _status = x.status;
                    const _statusText = x.statusText;
                    // Data
                    let _data = null;
                    // Check content type and then do the needed transformations
                    const contentType = x.headers.get("content-type") || "";
                    if (contentType.toLowerCase().indexOf("json") === -1) {
                        // Try to convert to json
                        try {
                            _data = await x.json();
                        }
                        catch (ex) {
                            _data = await x.text();
                        }
                    }
                    else {
                        _data = await x.json();
                    }
                    // transformResponse
                    if (transformResponse) {
                        if (transformResponse &&
                            Array.isArray(transformResponse) &&
                            transformResponse.length > 0) {
                            for (var i = 0; i < (transformResponse || []).length; i++) {
                                if (transformResponse && transformResponse[i]) {
                                    _data = transformResponse[i](_data);
                                }
                            }
                        }
                    }
                    const _headers = x.headers;
                    const _config = {
                        url,
                        baseURL,
                        method,
                        headers,
                        params,
                        data,
                        timeout,
                        withCredentials,
                        auth,
                        paramsSerializer,
                    };
                    // Validate the status code
                    let isValidStatus = true;
                    if (validateStatus) {
                        isValidStatus = validateStatus(_status);
                    }
                    else {
                        isValidStatus = _status >= 200 && _status < 300;
                    }
                    if (isValidStatus) {
                        return Promise.resolve({
                            status: _status,
                            statusText: _statusText,
                            data: _data,
                            headers: _headers,
                            config: _config,
                        });
                    }
                    else {
                        const error = {
                            response: {
                                status: _status,
                                statusText: _statusText,
                                data: _data,
                                headers: _headers,
                            },
                            config: _config,
                        };
                        return Promise.reject(error);
                    }
                });
            };
            axiod.get = (url, config) => {
                return axiod.request(Object.assign({}, { url }, config, { method: "get" }));
            };
            axiod.post = (url, data, config) => {
                return axiod.request(Object.assign({}, { url }, config, { method: "post", data }));
            };
            axiod.put = (url, data, config) => {
                return axiod.request(Object.assign({}, { url }, config, { method: "put", data }));
            };
            axiod.delete = (url, data, config) => {
                return axiod.request(Object.assign({}, { url }, config, { method: "delete", data }));
            };
            axiod.options = (url, data, config) => {
                return axiod.request(Object.assign({}, { url }, config, { method: "options", data }));
            };
            axiod.head = (url, data, config) => {
                return axiod.request(Object.assign({}, { url }, config, { method: "head", data }));
            };
            axiod.connect = (url, data, config) => {
                return axiod.request(Object.assign({}, { url }, config, { method: "connect", data }));
            };
            axiod.trace = (url, data, config) => {
                return axiod.request(Object.assign({}, { url }, config, { method: "trace", data }));
            };
            axiod.patch = (url, data, config) => {
                return axiod.request(Object.assign({}, { url }, config, { method: "patch", data }));
            };
            exports_26("default", axiod);
        }
    };
});
System.register("file:///home/dev/project/node/deno_package/data.service", ["https://deno.land/x/axiod/mod", "https://deno.land/std/log/mod"], function (exports_27, context_27) {
    "use strict";
    var mod_ts_3, log;
    var __moduleName = context_27 && context_27.id;
    function getData() {
        mod_ts_3.default.get("https://jsonplaceholder.typicode.com/todos/1").then((response) => {
            log.info(response);
        });
    }
    exports_27("getData", getData);
    return {
        setters: [
            function (mod_ts_3_1) {
                mod_ts_3 = mod_ts_3_1;
            },
            function (log_1) {
                log = log_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("file:///home/dev/project/node/deno_package/index", ["https://deno.land/std/log/mod", "https://deno.land/x/lodash/isEmpty", "file:///home/dev/project/node/deno_package/data.service"], function (exports_28, context_28) {
    "use strict";
    var log, isEmpty_js_1, data_service_ts_1;
    var __moduleName = context_28 && context_28.id;
    return {
        setters: [
            function (log_2) {
                log = log_2;
            },
            function (isEmpty_js_1_1) {
                isEmpty_js_1 = isEmpty_js_1_1;
            },
            function (data_service_ts_1_1) {
                data_service_ts_1 = data_service_ts_1_1;
            }
        ],
        execute: function () {
            // console.log(bgBlue(red(bold(`Hello ${name}!`))));
            log.debug("Hello world");
            log.info("Hello world");
            log.info(isEmpty_js_1.default(null));
            data_service_ts_1.getData();
        }
    };
});

await __instantiate("file:///home/dev/project/node/deno_package/index", true);

