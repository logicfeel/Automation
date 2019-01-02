# Auto 의 특정 분류
> Best(가장) & Possibility(가능성)
> 범용성 : 넓은 분야에 응할수 있는 성질

## 가장 쉬운 편이성
    - AutoClass의 프로퍼티 설정 방식 (winform 디자인 방식)
    - 모듈 관리 : 명령어(gulp)로 모듈의 추가/제거/업데이트
    - /external 외부 종속모듈의 수입 (>gulp external)
    - VS.CODE 의 개발툴 제공
        + typescript : 타입검사
    - 편리한 스토리지 : GitHub (*NPM 규칙)
    - 테스크 명령 : gulp relation | external | install | publish 
    - T/SQL | PL/SQL 구문의 스토리지에 관리 (create | alter)

## 가장 높은 생산성/신속성
    - 한줄 명령 설치 : ()>gulp install)
    - 제품의 패키징(묶음) : 다양한 형태로 묶음 제공 (설치)
        + "하나로 묶거나 vs 모듈로 쪼개서 묶거나"
    - Template 영역을 통한 코드 자동 생성 (타입만 매칭)
    - 클립 모듈 
        + 주요 구문/문법/함수 제공
        + 패턴, 프레임웍 등
    - 자동 코드 생성 : Meta영역과 결합
    - Template namespace : 코드 조각의 다양성 제공
    - handlebars의 : part, data, deco, help 의 모듈화
    - 컴포넌트 모델 제공
        + 개념적 MVC 제공 (Model, View, Control 의 교체 지원)
        + 컴포넌트별 독립적 사용 제공
    - 컴포넌트 조립으로 다양한 비즈니스 로직 구현
        + DB(4~) * 언어(8) * 컴포넌트(12~) * 모듈수(4~) : 1,536가지 ~

| 컴포넌트(뷰) | 컴포넌트(컨트롤) | 메타 | 컴포넌트(모델) |
|:------------------:|:---------------:|:-------:|:-----------:|
| List.asp, View.asp | Cb.asp, Frm.asp | 메타종류 | STO, MEB... |
| html, css | asp, js, php, winform | - | MSSQL, Oracle |

## 가장 넓은 범용성/이식성

    - 모든 파일
        + 개발 언어 : cpp, asp, cs, java, pas, js ...
        + 구조 : xml, html, css ...
        + 미디어 : jpg, gif, png, fla, wma...
        + 문서 : xls, ppt, doc, hwp, md ...
        + 기타 : txt
    - 개발환경 : win, osx, linux 외 (npm 지원 플랫폼) & VS.CODE
    - 기존 파일(코드)의 모듈화 : 모든 프로젝트/기능/파일들 가능
        + API, Page, 함수, 클래스, 페이지, 파일, 패턴
    - 스타일 : 웹, 네이티브(cpp/pas), java, .Net, iOS, 안드로이드, 플러그인(크롬, VS, starUML ...) ...
    - AutoTask (*GDL 표기법)
        + 파일 확장자별 Task 관리
        + 그룹별 Task 관리


## 가장 많이 사용하는 표준성
    - 폴더규칙 : /src /dist 의 GitHub(jqery/angular..)의 슈퍼셋(포함)
    - 많이사용 : 
        + 제어 : javscript, handlebars
        + 저장소 : GitHub(git)
        + 설치 : NPM(node), gulp
        + 타입 : typescript
        + 버전 : semver
    - 정규표현식 : Auto 파일들 제어


## 가장 확장성/다양성

    - 모델(DB)의 Meta 관리
        + 아이템 : 뷰기준의 항목
        + 코드명령규칙 : 컬럼의 코드와 의미를 매핑
        + 모델(DB)의 규칙 : CRUDL, SP, FN, TF, VW, U(CRUDL 규칙)
    - semver규칙 주.부.수 버전체계로 다양성 관리
    - typescript 을 활용한 타입 관리 (auto, template)    
    - 컴포넌트(모델)의 메타(인터페이스/상위)를 활용하여 다양성 제공
    - AutoTask
        + 사용자용 확장 : 특별한 파일 형식
    - Template namespace 확장: 오버라이딩, ns (private/local/public)
    - 동적 vs 정적  
        + 정적 : install 시점
        + 동적 : html 동적 바인딩 (json/xml 인터페이스 활용)

-----------------------------------------------------------------------

## 가장 뛰어난 안정성
    - /external로 개별 개발 환경 구성
    - /tests 를 통해서 별도 테스트 영역 구축 (가까이)

## 가장 강력한 보안성
> 코드 유출 및 피해 관련

    - 코드 컴파일 : 실행코드의 암호화
    - 저장소 보안 : GitHub(private유료), 로컬 파일 관리