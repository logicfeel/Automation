# Automation 인스턴스 모듈

### 인스턴스 모듈 요구사항

1. 독립적 실행

2. 인스턴스 모듈 하위에 인스턴스 모듈 추가 가능하게
    - 하위에 인스턴스를 포함 : 오버라이딩 방식으로 교체

3. 설치 폴더 구조 및 파일명은 자유롭게 변경 가능하게

4. 고정 상수 필요
    - ${modulename} : 모듈명

5. 작업단계
    - 사전(pre) 인스톨 : package 기준으로 설정파일(json) 구성
    - 인스톨 : 실제 설치

6. 핸들바 연동 지원

7. 중복의 처리
    - 모듈과 모듈의 중복 : 설정의 _overlap  표시함

8. 공용 설정의 제공 : public = {} 
    - 모듈 기준의 공용 설정


### 인스턴스 모듈 구조

1. 설정파일
    - 기본(.setup) > 공용설정(public) > 전용설정
    - 템플릿 파일은 


### 기능

- 종속된 모듈과 인스턴스모듈 검색
    + 대상 모듈 검색

- i모듈의 preinstall
    + 모듈 : preinstall 실행후 결과 가져옴
    + i모듈 : 설정파일의 가져옴

- i모듈의 install
    + 설정파일 > 모듈의 install 후킹 처리 : 데이터, 메소드
        * [base 설정 *생략가능] + public 설정 + private 설정 넘김
            - 이미 가져왔으므로..

### 정의

- 모듈명에 "-" 있는 것은 종속 서브 모듈
    + 단독실행 : 문자로 구성 
        * 예> install, init, preinstall
    + 종속실행 : 문자 + "-" + 문자 

- MODULE_SCHEMA : gulp_module.json 구조 버전명

- MODULE_I_SCHEMA : gulp_i_module.json 구조 버전명


### 이슈

1. gulp.run() : 부분은 gulp 3.9 기준이며 제외 가능한 자동화여서 이후 대체 필요성 있음