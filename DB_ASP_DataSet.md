## DataSet, ASP, XML, DB

###  DB.XML

DB XML 의 구조






스토어프로시저
```sql
select * from TBa
where asdsf


```

ASP ADODB 
```vb
dim a

```

XML (ASP)
```xml
<!-- 단일 select 경우(표준) -->
<DataSet return="0">
    <table rowCount="99">
        <row>...</row>
    </table>
</DataSet>

<!-- 단일 select 경우(요약) -->
<DataSet return="0" rowCount="99">
    <row>...</row>
</DataSet>

<!-- 복합 select 경우 (sp내부의 여러 select) -->
<DataSet return="0">
    <table rowCount="99">...</table>
    <table rowCount="99">...</table>
</DataSet>

<!-- 복합 select 경우 (여러 sp를 호출)-->
<DataSet return="0">
    <table return="0" rowCount="99">
        <row>...</row>
    </table>
    <table return="0" rowCount="99">
        <row>...</row>
    </table>
</DataSet>


```


CallBack.asp
```vb
'--------------------------------------------------------------------------------
' insert, update, delete
Set rs = DBCls.ExecSPReturnRS("MnAcct_Account_SP_D", paramInfo_D, Nothing)
result = DBCls.GetValue(paramInfo_D, "RETURN_VALUE") 

Response.Write "<DataSet return='" & result & "'/>"


'--------------------------------------------------------------------------------
' select
Set rs = DBCls.ExecSPReturnRS("MnAcct_Account_SP_D", paramInfo_D, Nothing)
result = DBCls.GetValue(paramInfo_D, "RETURN_VALUE") 
rowCount  = DBCls.GetValue(paramInfo_S, "@rowCount")    ' OUTPUT SP 파라메터

If result = 0 Then
    xmlRow = rs(0)
End if

Response.Write "<DataSet return='" & result & "'><table rowCount='" & rowCount & "'> "
Response.Write  xmlData
Response.Write "</table></DataSet>"

```

**" asp  HDBHelper 에서 NextRecordSet 을 사용하여 `다중Select` 처리 "**
https://m.blog.naver.com/PostView.nhn?blogId=logix21c&logNo=10177292237&proxyReferer=https%3A%2F%2Fwww.google.com%2F