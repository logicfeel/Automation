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

*브런치 이름 변경하기

git branch -m 현재브런치명 변경할 브런치명

_1.x.x


출처: http://dolfalf.tistory.com/73 [악당잰의 연구실]
