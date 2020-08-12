## AutoBind 의 사용버


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

````