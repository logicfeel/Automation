# Automation

## 구성
- gulp 를 활용


## TODO
- Model : 모델 모듈
- Control : 컨트롤 모듈
- View : 뷰 모듈


  
### Model : 모델 모듈 요구사항 및 구조

1. 소스 파일 구성
    - .sql 파일 FN, SP, Table 폴더별 분리 저장 
    - ALTER 문

2. 소스 가공
    - ALTER >> CREATE 문으로 교체
    - FN | SP | Table 별 파일 생성
        + 내부 ALTER >> CREATE 문으로 교체
        + 타입별 파일 합침
        + 폴더 : /dest
        + 파일명 
            * NPM명.FN.sql
            * NPM명.SP.sql
            * NPM명.Table.sql
    - 통합 파일 생성
        + 내부 ALTER >> CREATE 문으로 교체
        + 타입별 파일 합침 
        + 폴더 : /dest           
        + 파일명 : NPM명.sql
    - 템플릿 적용 (handlebars )  .hbs       TODO :
        + 코드의 기본 구성 을 만드는 용도
        + 환경설정 저장 : .json

# Auto 최상위



## 브런치명 변경

## 업무 정의
    - 자동화 모듈은 모두 정적인 구조(파일) 기준임
    - 정적인 구조는 2가지 참조 방식
        + dist/
        + publish/ 
    - 각 모듈별 다양한 구조를 가짐
        + .d.ts 정의 파일로 접근

## 구조
    - default: 정적 파일 구조

        + dist/ : 정적 배치 기본 경로

------------------------------------------------------------    
    - template: 동적 파일 구조
        
        + publish/ : 정적 배치 기본 경로

        + template/*.hbs : 동적 템플릿 소스
            
            * publish/ : 내부 템플릿 배치
            
            * publish/종속모듈명/ : 종속 모듈 템플릿 배치
            
            * publish/종속모듈명/@스코프/ : 종속 모듈 템플릿 배치(스코프/인스턴스)
            
        + src/*.hbs : 내용의 동적 배치 (* 파일명은 정적 배치됨)

## 모듈간 결합 시나리오

    - 외부
        
        + 모델(menu)에서 엔티티 목록을 가져와서 설정
        
        + 템플릿의 내용을 내보내기/가져오기
            
            * 조각 : tempalte/parts/*.hbs
            * 페이지 : tempalte/*.hbs
    
    - 내부

        + parts 파일 조각 가져오기

        + data 내용으로 설정하기


## 이슈 & 조건
    - 이벤트가 필요한지?

## AutoModule 요구사항 정의

> 파일 구조 및 내용을 변경하여 자동화 설치 제공


## AutoModule 기능 명세서

    - 자동 설치를 제공
    - NPM 과 연동하여 종속성 모듈 설치됨
    - 변경 대상 :
        + 설치 파일명
        + 내용 : 종속성 관련 코드 (src, include, db_obj, prefix 등)
        + 내용의 병합 (그룹화)
    - 설치시 중복 모듈 및 파일의 관리
    - 컨텐츠 replace(교체) 지원
    - 모델
        + SP, FN, U 등
        + DDL, DML
        + log, create->update
        + 타입별 명칭 (제거, 교체, 유지)
    - 인스턴스
        + 설치 정보를 관리
        + 공통(public) 설정 제공