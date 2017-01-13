'use strict';

const Crypto = require('crypto');
const Gunzip = require('gunzip-maybe');
const Pump = require('pump');
const Tar = require('tar-fs');


module.exports = compile;


function compile(options, cb) {
    const tgz = new Buffer(options.script, 'base64');
    const hash = Crypto.createHash('md5').update(tgz).digest('hex');
    const path = `/tmp/${hash}/`;
    const untar = Tar.extract(path, { strip: 1 });
    const gunzip = Gunzip();
    
    Pump(gunzip, untar, error => {
        if (error) {
            console.error('Failed to unpack your spa', error);

            return cb(error);
        }
        
        try {
            const entrypoint = require(path);

            return process.nextTick(() => cb(null, entrypoint));
        } catch (e) {
            console.error('Error loading your spa', e);

            return cb(e);
        }
    });
    
    return gunzip.end(tgz);
}