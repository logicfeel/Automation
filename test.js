

var obj = {
    aaa: "abc",
    bbb: {
        kkk: "ddd",
        ddd: 22,
        aad: "c",
    }
};


function objSearch(obj, name, value){
    for (prop in obj){
        if (typeof obj[prop] === 'object'){
            objSearch(obj[prop], name, value);
        } else {
            if (prop.indexOf(name) > -1 && name.length > 0 ) {
                console.log('name:' + prop);
                console.log('value:' + obj[prop]);
            }
            if (String(obj[prop]).indexOf(value) > -1 && value.length > 0 ) {
                console.log('name:' + prop);
                console.log('value:' + obj[prop]);
            }
        }
    }
}

// objSearch(obj, "aa");
objSearch(obj, "", "c");

console.log('module name ?');
process.stdin.resume();

process.stdin.on('data', function(data) {
    console.log(String(data));
});
