# Automation

## 구성
- gulp 를 활용


## TODO
- Model : 모델 모듈
- Control : 컨트롤 모듈
- View : 뷰 모듈



### Model : 모델 모듈 요구사항 및 구조

1. 소스 파일 구성
    - .sql 파일 FN, SP, Table 폴더별 분리 저장 (*ALTER 문)
    - 각 폴더별 정리 (관리에 편함) FN, SP ..
    - Table : 테이블스크립팅 > CREATE
    - SP, FN : 스크립팅 > ALTER

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


## Module_M 기능 목록
 - 공통
    - gulpSetup.json : 전체 설정 파일
        + V, C 에서도 사용가능하며 확장 가능하게
    - ALTER => CREATE 변경 여부 => 무조건 변경해야함

 - 컨텐츠 제어 : FN, SP, TF, U, VW, TR
    + ALL : USE [DB명 삭제]
    + SP | FN, TF : FUNCTION | FUNC [DB명] : 변경 또는 삭제
    + ALL : $GO : 없을시 추가
    + ALL : /** Object 주석의 처리 **/
    + FN 사용 : 관련 DB 명 매칭 => task 로 사전에 뺌
    + 기본 문구 들의 표시 선택
        * SET ANSI_NULLS ON
        * QUOTED_IDENTIFIER ON
    + 이슈
        * 소문자의 경우 
        * 함축예약어의 구분
    
 - 파일 구성
    - 병합
        + FN 그룹
        + TF 그룹
        + U 그룹
        + 전체 

 - 파일명 + 경로
    - src/FN | SP | ..  => dist/  (폴더명 기준으로 파일명 만듬)
        + 모듈명.SP.sql
        + 모듈명.FN.sql (확장시...)
        + 모듈명.sql
    - dist/모듈명.json.map

- 이슈
    + FN 의 사용시 DB 표기 여부 : => 변경 해야함 => OK 사전 task 처리
    + 전체 공통 바꾸기의 기능 : FN, SP, TF => OK
    + [DB].  또는 db. 두가지 모두 가능하게 => 개발시 고려함
    + 합치기의 파일 순서

- 작업 분리
    + 기본문구 제거 여부

> AFTER:
    - node_module/../dist/maps/*.map 파일 복사

> TODO:
    - handlebars 와의 연동
    - 템플릿 형태의 제공 (공통기능의 빠른 제작)
    - 이후에 VW, TR 도 추가해함
    - DB 플렛폼 변경에 대한 검토
    - table 의 변경  (현재는 확장만 가능하게)
    - sp 등의 이름 변경 (* 불가능 할듯)  인터페이스 역활 이므로..