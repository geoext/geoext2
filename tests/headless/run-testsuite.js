function getLinks() {
    var links = document.querySelectorAll('li');
    return Array.prototype.map.call(links, function(e) {
        return e.innerHTML;
    });
}

function getTestFunctions() {
    var funcs = [],
        isFunc = function (obj) {
            return Object.prototype.toString.call(obj) === '[object Function]';
        };
    for ( var key in window ) {
        if ( /test_/.test(key) && isFunc(window[key]) ) {
            funcs.push(key);
        }
    }
    return funcs;
}

function runOneTestFunc(name, filename) {
    var results = [
            {info: filename + " " + name + "(t):"}
        ],
        toString = Object.prototype.toString,
        isArr = function(o) {
            return toString.call(o) === '[object Array]';
        },
        isObj = function(o) {
            return toString.call(o) === '[object Object]';
        },
        eqFunc = function(a, b) {
            if (a === null && b === null) {
                return true;
            }
            if (toString.call(a) !== toString.call(b)) {
                return false;
            }
            if (isArr(a)) {
                if (a.length !== b.length) {
                    return false;
                }
                for (var i = 0; i < a.length; i++) {
                    if (!eqFunc(a[i], b[i])) {
                        return false;
                    }
                }
                return true;
            }
            if (isObj(a)) {
                for (var k in a) {
                    if (!eqFunc(a[k], b[k])) {
                        return false;
                    }
                }
                // could be optimized
                for (var kk in b) {
                    if (!eqFunc(a[kk], b[kk])) {
                        return false;
                    }
                }
                return true;
            }
            return a === b;
        },
        debugInfo = function(mockMethod, testName, filename, other) {
            return [
                " [",
                mockMethod + ", ",
                testName + "(t), ",
                filename,
                (other ? other : ''),
                "]"
            ].join("");
        },
        mock = {
            plan: function() {},
            ok: function(cond, msg) {
                if (!cond) {
                    results.push({
                        pass: false,
                        msg: msg + debugInfo("t.ok", name, filename)
                    })
                } else {
                    results.push({pass: true, msg: msg});
                }
            },
            eq: function(got, exp, msg) {
                //if (got !== exp) {
                if(!eqFunc(got, exp)) {
                    results.push({
                        pass: false,
                        msg: msg +
                            debugInfo(
                                "t.eq", name, filename,
                                "exp: " + exp + ", got: " + got
                            )
                    });
                } else {
                    results.push({pass: true, msg: msg});
                }
            },
            fail: function(msg) {
                results.push({
                    pass: false,
                    msg: msg + debugInfo("t.fail", name, filename)
                });
            },
            delay_call : function(s, fn) {
                // TODO
                results.push({
                    skip: true,
                    msg: "not supported" + debugInfo("t.delay_call", name, filename)
                });
            },
            wait_result: function(s) {
                // TODO
                results.push({
                    skip: true,
                    msg: "not supported" + debugInfo("t.wait_result", name, filename)
                });
            }
        };
    if (window[name]) {
        try {
            window[name].call(this, mock);
        } catch (e) {
            results = [{
                pass: false,
                msg: "Caught exception: " + debugInfo("calling method", name, filename, e)
            }];
        }
    }
    return results;
}

function leftPad(s, len) {
    var str = "" + s,
        length = parseInt(len, 10),
        spaces = (new Array(length)).join(" ");
    return (spaces + str).substr(-1*length);
}

function rightPad(s, len) {
    var str = "" + s,
        length = parseInt(len, 10),
        spaces = (new Array(length)).join(" ");
    return (str + spaces).substring(0, length);
}

var baseUrl = 'http://localhost:1234/tests/';
baseUrl= './tests/'
var linksUrl = baseUrl + 'list-tests.html';
var links = [];
var funcCnt = 0;
var results = [];
var total = 0;

// Open the TAW-list of urls
casper.start(linksUrl);

casper.then(function() {
    // get all testfiles
    links = this.evaluate(getLinks);
});

casper.then(function() {
    links.forEach(function(link) {
        var funcs;
        casper.thenOpen(baseUrl + link, function(){
            funcs = this.evaluate(getTestFunctions);
        });
        casper.then(function() {
            funcCnt += funcs.length;
            funcs.forEach(function(func){
                var oneFuncResults = this.evaluate(runOneTestFunc, func, link) || [],
                    oneFuncLen = oneFuncResults.length;
                total += oneFuncLen;
                results.push(oneFuncResults);
                this.echo(
                    rightPad(link, 30) + " " + oneFuncLen +
                    " test" + (oneFuncLen !== 1 ? 's': '') +
                    " in "  + func + "(t)"
                );
            }, this);
        });
        
    });
});

casper.then(function(){
    var realTestNum = total - funcCnt;
    casper.test.begin('Excuting a total of ' + realTestNum + ' Test.Anotherway tests', realTestNum, function(test){
        var cnt = 0;
        results.forEach(function(oneFuncResults) {
            oneFuncResults.forEach(function(result){
                if (result.info) {
                    test.info(result.info);
                } else {
                    var message = leftPad((++cnt), 4) + ") " + result.msg;
                    if (result.skip) {
                        test.skip(1, message)
                    } else {
                        test.assert(result.pass, message);
                    }
                }
            });
        });
        test.done();
    });
    
});

casper.run();