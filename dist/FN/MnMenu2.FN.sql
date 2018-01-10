

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*ㅇㅇㅇㅇ
*/

-- ============================================= 
-- Author		: 김영호
-- Create date	: 2017-08-21
-- Update date	: 
-- Description	: 문자열을 갯수의 문자열로 채움
-- =============================================
ALTER FUNCTION [sstory40].[MnAuth_FN_AuthChk2](@bt varchar(10))
	RETURNS char(10)
AS
BEGIN
	
	DECLARE @maxBit			int		-- 제한갯수
	DECLARE @loopChar		nvarchar(1)
	
	DECLARE @temp			varchar(20)
	DECLARE @return			char(10)
	
	SET @maxBit		= 10
	SET @loopChar	= '0'
	SET @temp		= @bt + REPLICATE(@loopChar, 	@maxBit)
	SET @return		= LEFT(@temp, @maxBit)
	
	RETURN @return
END

-- ###################################################
-- ## 테스트 코드
/*
	SELECT sstory40.MnAuth_FN_AuthChk2('1')
	SELECT sstory40.MnAuth_FN_AuthChk2('777')
*/

GO
