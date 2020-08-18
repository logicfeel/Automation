## AutoBind 의 사용법


```javascript
// BindCommond 의 오버라이딩
Bind.read.valid = function() {
    ...오버라이딩
};

// 엔티티에서 아이템을 불러오는 방식
var i = entityProcedure;    // 엔티티 프로시저 객체에서 가져옴
var i = entityModel;        // 엔티티 모델 객체에서 가져옴
var i = entityModule;       // 엔티티 모듈 객체에서 가져옴
EntityBind.add(i);

// 엔티티에서 가져와 바인드모델에 적용
this.read.bind = BindManager.getItem("MEB_Meber_R");             // bind에 SP전체를 가져옴
this.read.valid = BindManager.getItem("MEB_Meber_R", "PK");      // PK를 아이템 가져옴
this.read.valid = BindManager.getItem("MEB_Meber_R", "NOTNULL"); // 필수값 아이템을 가져옴
this.read.view = BindManager.getItem("MEB_Meber_R", "OUTPUT");   // 출력레코드를 가져옴

this.read = BindManager.getItem("MEB_Meber_R");  // valid, bind, view에 같이 적용
this.read = BindManager.getItem();               // XXX(불가) => read에 전체를 등록하는건 맞지 않음 (! 단 한개일 경우는 가능)
// 한번에 설정할 방법은 어떻까? 필요한가? 유효한가? => 일단은 혼란과 가중함
// 설정하면 내부 _items에 추가됨


// 아이템 사용자화
this.read.valid.add("adm_id");      // 추가
this.read.valid.remove("adm_id");   // 삭제
this.read.valid.removeAll();        // 전체 삭제


// 템플릿에서 사용방법
for (var i = 0 ; this.read.valid.length > i; i++) {
    this.read.valid[i].name;
    this.read.valid[i].type;
}

```

## 시나리오

```javascript


// 바인드 모델(조회 + 삭제)
function BindModel() {

}

// 객체 생성 (모듈로딩후)
var m = new BindModel();

////////////////////////////////////
// 이벤트 등록 : 초기화
$(document).ready(function () { // 페이지를 다 읽은 후 처리
    m.init(); 
    // 로딩시 자동으로 m.read.execute(); 호출
});
// 목록 버튼 클릭
$("#btn_List").click(function () {
    location.href = "ListURL...";
});
// 삭제 버튼 클릭
$("#btn_Delete").click(function () {
    m.delete.execute();
});

////////////////////////////////////
// 아이템 등록
m.read.valid.add("adm_id");      // 추가
m.read.valid.remove("adm_id");   // 삭제
m.read.valid.removeAll();        // 전체 삭제

m.read.valid.add("acc_idx");     // 추가 acc_idx
m.read.valid.add("admName");

// 아이템 타입이 들어가야함?
// - 기본값(타입)형식을 사용해 맞는지?
var i = new Item("acc_idx", "string");
m.items.add(i, aaa);
// 1. cmd 를 통해서 입력하는 방법
// 2. items 를 토앻서 입력하는 방법

// TODO:: 코드테이블 컬렉션 사용
// * 코드테이블을 사용하는 이유는 동적으로 값을 제어하기 위해서 사용함
//   정적(html고정) 할 경우에는 필요 없음
var c = new CodeTable("??");
c.add("\s?");

var c1 = new CodeValue("G", "게스트");


// ----------------
// @@ 아이템 타입 정의
// ItemCode 로 컴포지트 패턴 적용후
// 1> 단독 타입을 사용할 경우
var c = new CodeValue("G", "방문자");
// 2> 컬렉션 타입을 사용할 경우
var t = new CodeTable();
t.add(new CodeValue("G", "방문자"));
t.add(new CodeValue("A", "관리자"));

// ----------------
// @@ 아이템 등록
// 마스터 아이템 추가
m.items.add(new Item("acc_idx"));               // 아이템명
m.items.add(new Item("accName", "관리자명"));     // 아이템명 [,타이틀명] 
m.items.add(new Item("acc_type", null, t));     // 아이템명 [,타이틀] [,타입] 
m.items.add(new Item("acc_type", "회원종류", t));  // 아이템명 [,타이틀] [,타입] 

// ----------------
// @@ 마스터아이템과 바인드명령아이템과 매핑
m.read.valid.add(m.items["acc_type"]);  // 조회 & 검사
m.delete.add(m.items["acc_idx"]);       // 조회 & 검사 + 바인드


/*
acc_idx 를 가져오는 방법
 - 1안> 쿠키를 통해서 : JS를 통해서 가져옴
 - 2안> 파라메터를 통해서 : 추출을 통해 가져옴
 - 3안> 정적 : ASP 전처리를 통해서 가져옴
*/
// 아이템값 설정
m.items["acc_idx"].value = ""; // 1,2,3안 중 사용
OR
m.items["acc_idx"] = ""; // 축약식


```

### 사용사레 셈플

- 최소 사용 방식
    - 조회, 삭제
      - [ ] 수동 아이템 방식
      - [ ] 수동 아이템 방식 + 코드테이블 사용
      - [ ] 자동 아이템 방식 
      - [ ] 자동 아이템 방식 + 오버라이딩
- 주 사용 방식
  - [ ] Lst.asp(.html) : 목록
  - [ ] Frm.asp(.html) : 폼, 읽기, 수정, 삭제, (목록 이동)
- 확장 사용 방식
  - [ ] Edit_List.asp : 목록, 선택삭제