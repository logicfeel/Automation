

namespace Validation {
    class Greeter {
        greeting: string;
        constructor(message: string) {
            this.greeting = message;
        }
        greet() {
            let a = new GreeterS('abc');
            a.greeting = '3';
            let v = 'aaa';
            
            //var c = a.template()


            return "Hello, " + this.greeting;
            
        }
    }
}

