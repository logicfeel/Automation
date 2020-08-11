## AutoBind 의 사용버


```javascript
// BindCommond 의 오버라이딩
Bind.read.valid = function() {
    ...오버라이딩
};

// 엔티티에서 아이템을 불러오는 방식
var i = entityProcedure;    // 엔티티프로시저 객체에서 가져옴
var i = entityModel;        // 엔티티모델 객체에서 가져옴
var i = entityModule;       // 엔티티모듈 객체에서 가져옴
EntityBind.add(i);

// 엔티티에서 가져와 바인드모델에 적용
this.read.bind = EntityBind.getItem("MEB_Meber_R");             // valid에 지정하여 등록
this.read.valid = EntityBind.getItem("MEB_Meber_R", "NOTNULL"); // 필수값만 가져오기
this.read.view = EntityBind.getItem("MEB_Meber_R", "OUTPUT");   // 출력레코드에서 가져오기

this.read = EntityBind.getItem("MEB_Meber_R");  // valid, bind, view에 같이 적용
this.read = EntityBind.getItem();   // XX(불가) => read에 전체를 등록하는건 맞지 않음 (! 단 한개일 경우는 가능)
// 한번에 설정할 방법은 어떻까? 필요한가? 유효한가? => 일단은 혼란과 가중함
// 설정하면 내부 _items에 추가됨


// 아이템 사용자화
this.read.valid.add("adm_id");      // 추가
this.read.valid.remove("adm_id");   // 삭제
this.read.valid.removeAll();        // 전체 삭제


````