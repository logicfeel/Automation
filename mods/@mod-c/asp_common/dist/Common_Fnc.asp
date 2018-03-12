 <%
	' ===================================================================
	' 함    수    명 : 
	' 기          능 : 
	' 전    달    값 : 
	' Return    형식 : 
	' 작    성    자 : 
	' 작    성    일 : 
	' 변경일 및 변경사유 :
	' ===================================================================
	
	Function AspErrorMsg(Err)

		if Err.number <> 0 then
			
	        'Response.Clear
			
			Dim ASPError, ASPError_yn
	    ASPError_yn = "Y"
	    If ASPError_yn = "Y" then
	    	Set ASPError = Server.GetLastError 
			  Dim Msg
			  Msg = " 오류 코드 : "& ASPError.ASPCode &"<br />"
			  Msg = Msg & " 표준 COM 오류 코드 : "& ASPError.Number  &"<br />"
			  Msg = Msg & " 원본 코드 : "& ASPError.Source  &"<br />"
			  Msg = Msg & " 오류 원인 : "& ASPError.Category  &"<br />"
			  Msg = Msg & " 파일 이름 : "& ASPError.File  &"<br />"
			  Msg = Msg & " 코드 줄 : "& ASPError.Line  &"<br />"
			  Msg = Msg & " 오류열 위치 : "& ASPError.Column  &"<br />"
			  Msg = Msg & " 오류설명1 : "& ASPError.Description  &"<br />"
			  Msg = Msg & " 오류설명2 : "& ASPError.ASPDescription  &"<br />"
			  Response.Write Msg 
			  Set ASPError = Nothing
	    end if
	
			Response.Write Err.number & "- :: 에러번호<br />"
			Response.Write Err.Description & "- :: 에러메세지<br />"
			Response.Write Err.Source & "- :: 에러 출처<br />"
			Response.Write Err.NativeError & "- :: DB 에러번호<br />"
			Response.Write Err.HelpFile & "- :: 에러 파일<br />"
			Response.Write Err.HelpContext & "-:: 에러 내용<br />"
			Response.Write asp_err_obj.File & "-:: 에러 <br />"
		
		end if
	

	End Function
%>
