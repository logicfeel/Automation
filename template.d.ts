declare class GreeterS {
    constructor(greeting: string);

    greeting: string;
    showGreeting(abc: string): void;
    template(ttt: MyClassMethodOptions): MyClassMethodOptions2;
}


declare interface MyClassMethodOptions {
    width?: number;
    height?: number;
}

declare interface MyClassMethodOptions2 {
    width?: number;
    height?: number;
}