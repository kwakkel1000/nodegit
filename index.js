/*jslint
    node: true
*/
'use strict';

var Promise     = require('promise');
var exec        = require('child_process').exec;

var getVersion = function() {
    var promise = new Promise(function (resolve, reject) {
        exec('git describe --abbrev=4 --dirty --always', function (error, stdout, stderr) {
            if (error !== null) {
                reject (error);
            }
            else {
                resolve(stdout.slice(0, -1));
            }
        });
    });
    return promise;
};

var fetch = function() {
    var promise = new Promise(function (resolve, reject) {
        exec('git fetch', function (error, stdout, stderr) {
            if (error !== null) {
                reject (error);
            }
            else {
                resolve(1);
            }
        });
    });
    return promise;
};

var localHash = function() {
    var promise = new Promise(function (resolve, reject) {
        exec('git rev-parse @', function (error, stdout, stderr) {
            if (error !== null) {
                reject (error);
            }
            else {
                resolve(stdout);
            }
        });
    });
    return promise;
};

var remoteHash = function() {
    var promise = new Promise(function (resolve, reject) {
        exec('git rev-parse @{u}', function (error, stdout, stderr) {
            if (error !== null) {
                reject (error);
            }
            else {
                resolve(stdout);
            }
        });
    });
    return promise;
};

var baseHash = function() {
    var promise = new Promise(function (resolve, reject) {
        exec('git merge-base @ @{u}', function (error, stdout, stderr) {
            if (error !== null) {
                reject (error);
            }
            else {
                resolve(stdout);
            }
        });
    });
    return promise;
};

var pull = function() {
    var promise = new Promise(function (resolve, reject) {
        exec('git pull', function (error, stdout, stderr) {
            if (error !== null) {
                reject (error);
            }
            else {
                resolve(1);
            }
        });
    });
    return promise;
};

var checkUpdate = function() {
    var promise = new Promise(function (resolve, reject) {
        var local,
            remote,
            base;
        fetch()
        .then(function(result) {
            return localHash();
        }).then(function(result) {
            local = result;
            return remoteHash();
        }).then(function(result) {
            remote = result;
            return baseHash();
        }).then(function(result) {
            base = result;
            if (local === remote) {
                resolve(0);
            }
            else if (local === base) {
                resolve(1);
            }
            else {
                resolve(0);
            }
        }, function(reason) {
            reject(0);
        });
    });
    return promise;
};

var update = function() {
    var promise = new Promise(function (resolve, reject) {
        checkUpdate()
        .then(function(result) {
            if (result === 1) {
                pull()
                .then(function(result) {
                    resolve(1);
                }, function(reason) {
                    console.log(reason);
                    reject(0);
                });
            }
            else {
                reject('not updated');
            }
        }, function(reason) {
            reject(reason);
        });
    });
    return promise;
};

module.exports = {
    getVersion:getVersion,
    fetch:fetch,
    localHash:localHash,
    remoteHash:remoteHash,
    baseHash:baseHash,
    pull:pull,
    checkUpdate:checkUpdate,
    update:update
};
