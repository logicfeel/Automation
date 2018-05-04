// <reference path="@types/template/index.d.ts" />


// const myGreeter = new Greeter("hello, world");
// myGreeter.greeting = "howdy";
// myGreeter.showGreeting();

// class SpecialGreeter extends Greeter {
//     constructor() {
//         super("Very special greetings");
//     }
//     showGreeting(abc) {

//     }

// }

'use strict';

function GreeterS(greeting) {


    this.greeting = greeting;
    this.c = null;
}
// GreeterS.prototype.greeting = function() {};
GreeterS.prototype.showGreeting = function(abc) {};
GreeterS.prototype.template = function(ttt) {
   console.log('-template-');
   return null;
};

var NS = {};
NS.GreeterS = GreeterS;

module.exports = NS.GreeterS;
