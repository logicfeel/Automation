
declare namespace NS {

    class TemplateClass {
        /**
         * 생성자
         * @param greeting A folder path or a function that receives in a file and returns a folder path.
         */
        constructor(greeting: number);

        /**
         * layout_base 속성 입니다.
         */
        layout_base: MyPage;

        /**
         * footer 속성 입니다.
         */
        footer: Page.MyClassMethodOptions;

        hero: TypeA;


        // 인라인 정의 개념
        web_in: {ns_in: boolean};

        web: MyPage;
        web1: web1;
        web2: web2;
        method: (num: number) => void;
    }

    class TypeA {
        uid: string;
        uid2: string;
    }

    interface MyPage {
        ns_MyPage: boolean;  // 키 !!! 변수 명칭을 키로 사용하는 상위 기법(편법??)
        width: number;
    }
    
    interface web1 extends MyPage {
        _ns_web1: boolean;
    }

    interface web2 extends MyPage {
        _ns_web2: boolean;
    }

    namespace Page {
        interface MyClassMethodOptions {
            width: number;
            height: number;
        }
    }
}

export = NS.TemplateClass;
