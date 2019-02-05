const { exec } = require('child_process');
const testscript = exec('sh myscript.sh');

testscript.stdout.on('data', function(data){
    console.log(data);
    // sendBackInfo();
});

testscript.stderr.on('data', function(data){
    console.log(data);
    // triggerErrorStuff();
});