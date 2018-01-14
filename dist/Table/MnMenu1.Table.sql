/****** Object:  Table [sstory40].[MnAcct_Account]    Script Date: 01/03/2018 06:04:54 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

SET ANSI_PADDING ON
GO

CREATE TABLE [sstory40].[MnAcct_Account](
	[account_idx] [int] IDENTITY(1,1) NOT NULL,
	[account_id] [varchar](20) NOT NULL,
	[passwd] [varchar](20) NOT NULL,
	[memo] [varchar](200) NULL,
	[sto_idx] [int] NOT NULL,
	[create_dt] [datetime] NOT NULL,
	[del_yn] [char](1) NOT NULL,
	[using_yn] [char](1) NOT NULL,
	[admName] [varchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[account_idx] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

SET ANSI_PADDING OFF
GO

CREATE TABLE [sstory40].[MnAcct_Account] ADD  DEFAULT (getdate()) FOR [create_dt]
GO

CREATE TABLE [sstory40].[MnAcct_Account] ADD  DEFAULT ('N') FOR [del_yn]
GO

CREATE TABLE [sstory40].[MnAcct_Account] ADD  DEFAULT ('Y') FOR [using_yn]
GO
