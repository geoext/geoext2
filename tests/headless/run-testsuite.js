
var fs = require('fs'),
    host = casper.cli.has('host') ? casper.cli.get('host') : 'http://localhost:8080/',
    testsPath = host + 'tests/',
    tawListOfTestsFile = testsPath + 'list-tests.html',
    modulesPath = fs.workingDirectory + '/tests/headless/modules/';

var strUtil = require(modulesPath + 'strUtil'),
    padLeft = strUtil.padLeft,
    padRight = strUtil.padRight;

var tawWrapper = require(modulesPath + 'tawWrapper'),
    getTestFiles = tawWrapper.getTestFiles,
    getTestFunctions = tawWrapper.getTestFunctions,
    runOneTestFunc = tawWrapper.runOneTestFunc;

// the variables we'll fill during the first phase and iterate over in the
// second phase
var links = [],
    funcCnt = 0,
    results = [],
    total = 0;

// Open the TAW-list of urls
casper.start(tawListOfTestsFile);

casper.then(function() {
    // get all testfiles
    links = this.evaluate(getTestFiles);
});

casper.then(function() {
    links.forEach(function(link) {
        var funcs;
        casper.thenOpen(testsPath + link, function(){
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
                    padRight(link, 30) + " " + oneFuncLen +
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
                    var message = padLeft((++cnt), 4) + ") " + result.msg;
                    if (result.skip) {
                        test.skip(1, message);
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
