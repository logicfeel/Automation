USE [sstory40]
GO

/****** Object:  StoredProcedure [sstory40].[MnAcct_Account_SP_C]    Script Date: 01/03/2018 06:12:51 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO




-- ============================================= 
-- Author		: 김영호
-- Create date	: 2017-08-26
-- Update date	: 
-- Description	: 관리자계정 등록  * id 중복감사
/*

*/
-- =============================================
ALTER PROC [sstory40].[MnAcct_Account_SP_C]
	@sto_idx				int,
	@account_id				varchar(20),
	@passwd					varchar(20),
	@admName				varchar(50),
	@memo					varchar(200)	= ''
	
AS

BEGIN
	
	DECLARE @result			int

	BEGIN TRY

		-- 1-1) 필수값 검사
		IF LEN(@account_id) <= 0 OR LEN(@passwd) <= 0
		BEGIN
			RAISERROR ('[오류] 필수값 없음 : @account_id, @passwd ', 16, 1);
		END
		
		-- 1-2) 상점 유무 검사
		IF NOT EXISTS(SELECT * FROM MnStor_Base WHERE sto_idx = @sto_idx)
		BEGIN
			RAISERROR ('[오류] 상점 없음 : @sto_idx ', 16, 1);
		END		

		-- 1-3) 중복 검사
		IF EXISTS(SELECT * FROM MnAcct_Account WHERE account_id = @account_id)
		BEGIN
			RAISERROR ('[오류] 중복 : @account_id ', 16, 1);
		END				


		-- 3) 처리 : 등록
		INSERT INTO MnAcct_Account
			(sto_idx, account_id, passwd, admName, memo)
		VALUES
			(@sto_idx, @account_id, @passwd, @admName, @memo)
		
		
		-- 4) 조회
		SELECT @result = MAX(account_idx) FROM MnAcct_Account
		
		-- 5) 리턴
		RETURN @result
		
	END TRY
	BEGIN CATCH
		EXEC [MnGSys_ErrLog_SP_Base] 'MnAcct', 'Y', 'Y'
		RETURN -1
	END CATCH

END

-- ###################################################
-- ## 테스트 코드
/*
	exec [MnAcct_Account_SP_C] 1, 'admin', 'admin', '관리자'
	exec [MnAcct_Account_SP_C] 1, 'logicfeel', '1111', '김영호'
	
	exec [MnAcct_Account_SP_C] 99, 'admin', 'admin', '관리자'	-- 오류: 상점없음
	exec [MnAcct_Account_SP_C] 1, '', '', ''					-- 오류: 필수값 없음
	
	select * from MnAcct_Account
*/

/*
	SELECT sstory40.MnAuth_FN_AuthChk3('1')
	SELECT sstory40.MnAuth_FN_AuthChk3('777')
*/

-- DML SP
/*
exec abc.[MnAcct_Account_SP_C] 1, 'admin', 'admin', '관리자'

excute [abc].[MnAcct_Account_SP_C] 1, 'admin', 'admin', '관리자'

exec  @abc =  abc.[MnAcct_Account_SP_C]
exec @abc=abc.[MnAcct_Account_SP_C]
*/

GO


