
/****** Object:  Table [MnAuth_Account]    Script Date: 01/17/2018 14:47:07 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

SET ANSI_PADDING ON
GO

CREATE TABLE [MnAuth_Account](
	[account_bt] [char](10) NOT NULL,
	[auth_ac_idx] [int] IDENTITY(1,1) NOT NULL,
	[auth_idx] [int] NOT NULL,
	[account_id] [varchar](20) NULL,
	[accountType_cd] [char](1) NOT NULL,
	[account_idx] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[auth_ac_idx] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

SET ANSI_PADDING OFF
GO

ALTER TABLE [MnAuth_Account]  WITH CHECK ADD FOREIGN KEY([auth_idx])
REFERENCES [sstory40].[MnAuth_Base] ([auth_idx])
GO

ALTER TABLE [MnAuth_Account] ADD  DEFAULT ('0000000000') FOR [account_bt]
GO

