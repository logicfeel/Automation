
declare namespace NS {

    class TemplateClass2 {
        /**
         * 생성자
         * @param greeting A folder path or a function that receives in a file and returns a folder path.
         */
        constructor(greeting: number);

        /**
         * layout_base 속성2 입니다.
         */
        layout_base: MyPage;

        /**
         * footer 속성2 입니다.
         */
        footer: Page.MyClassMethodOptions;

        hero: TypeB;

    }

    class TypeB {
        uid: string;
    }

    interface MyPage {
        id_ns_MyPage2: boolean;  // 키
        width: number;
    }
    
    namespace Page {
        interface MyClassMethodOptions {
            width: number;
            height: number;
        }
    }
}

export = NS.TemplateClass2;
