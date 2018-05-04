/// <reference types="node" />
/// <reference path="./var" />

import  * as CCC  from "./var";

declare namespace AAA {
    class GreeterS {
        /**
         * 생성자
         * @param greeting A folder path or a function that receives in a file and returns a folder path.
         */
        constructor(greeting: number);

        /**
         * 속성 입니다.
         * @param greeting A folder path or a function that receives in a file and returns a folder path.
         */
        greeting: string;

        /**
         *  node 속성 입니다.
         * @param c  A folder path or a function that receives in a file and returns a folder path.
         */
        c: ErrorConstructor;

        /**
         * 도움말 입니다.
         * @param abc A folder path or a function that receives in a file and returns a folder path.
         */
        showGreeting(abc: number): void;

        /**
         * template 도움말 입니다.
         * @param ttt A folder path or a function that receives in a file and returns a folder path.
         */
        template(ttt: MyClassMethodOptions): MyClassMethodOptions2;

        template2(tt: CCC.CCC_Type): MyClassMethodOptions2;
    }


    interface MyClassMethodOptions {
        width?: number;
        height?: number;
    }

    interface MyClassMethodOptions2 {
        width?: number;
        height?: number;
    }
    
}
export = AAA.GreeterS;
