declare class GreeterS {
    /**
     * 생성자
     * @param greeting A folder path or a function that receives in a file and returns a folder path.
     */
    constructor(greeting: string);

    /**
     * 속성 입니다.
     * @param greeting A folder path or a function that receives in a file and returns a folder path.
     */
    greeting: string;

    /**
     * 도움말 입니다.
     * @param abc A folder path or a function that receives in a file and returns a folder path.
     */
    showGreeting(abc: string): void;

    /**
     * template 도움말 입니다.
     * @param ttt A folder path or a function that receives in a file and returns a folder path.
     */
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

export = GreeterS;