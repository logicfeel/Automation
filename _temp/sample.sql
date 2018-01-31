-- DDL U

CREATE TABLE [sstory40].[MnAcct_Group](
	[group_ac_idx] [int] IDENTITY(1,1) NOT NULL,
	[groupName] [varchar](50) NOT NULL,
	[memo] [varchar](200) NULL,
	[create_dt] [datetime] NOT NULL,
	[del_yn] [char](1) NOT NULL,
	[using_yn] [char](1) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[group_ac_idx] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

SET ANSI_PADDING OFF
GO

ALTER TABLE [sstory40].[MnAcct_Group] ADD  DEFAULT (getdate()) FOR [create_dt]
GO

ALTER TABLE [sstory40].[MnAcct_Group] ADD  DEFAULT ('N') FOR [del_yn]
GO

ALTER TABLE [sstory40].[MnAcct_Group] ADD  DEFAULT ('Y') FOR [using_yn]
GO

-- DDL SP
ALTER PROC [MnAcct_Account_SP_C]
	@sto_idx				int,
	@account_id				varchar(20),
AS

ALTER PROC abc.[MnAcct_Account_SP_C]
	@sto_idx				int,
	@account_id				varchar(20),
AS

-- DDL FN
ALTER FUNCTION abc.[_MnAuth_FN_AuthChk](@bt varchar(10))
	RETURNS char(10)
AS

create FUNCTION abc.[_MnAuth_FN_AuthChk] (@bt varchar(10))
	RETURNS char(10)
AS

-- DDL U
CREATE TABLE abc.[MnAcct_Account](
	[account_idx] [int] IDENTITY(1,1) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[account_idx] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

-- DML SP
exec abc.[MnAcct_Account_SP_C] 1, 'admin', 'admin', '관리자'

excute abc.[MnAcct_Account_SP_C] 1, 'admin', 'admin', '관리자'

exec  @abc =  abc.[MnAcct_Account_SP_C]
exec @abc=abc.[MnAcct_Account_SP_C]

-- DML FN
	SELECT sstory40.MnAuth_FN_AuthChk('1')
	SELECT sstory40.MnAuth_FN_AuthChk('777')

-- DDL TF
	SELECT a.parent_idx, a.rank_it, a.menuName, a.auth_idx, b.*
	FROM abb.MnMeuA_Common_TF(@menu_idx) a, MnMeuA_Info b
	abb.MnMeuA_Common_TF(@menu_idx) a, MnMeuA_Info b
	WHERE 1=1
		AND a.menu_idx = b.menu_idx
		AND b.onwerType_cd = 'C'	
	

		SELECT 
			@auth_bt = result,
			@isMembers = 1 
		FROM MnAuth_TF_OR(@auth_bt, @onwer_bt)