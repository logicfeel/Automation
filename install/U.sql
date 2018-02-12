/****** Object:  Table [sstory40].[MnAcct_Group]    Script Date: 01/03/2018 06:08:40 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

SET ANSI_PADDING ON
GO

CREATE TABLE [MnAcct_Group](
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

ALTER TABLE [MnAcct_Group] ADD  DEFAULT (getdate()) FOR [create_dt]
GO

ALTER TABLE [MnAcct_Group] ADD  DEFAULT ('N') FOR [del_yn]
GO

ALTER TABLE [MnAcct_Group] ADD  DEFAULT ('Y') FOR [using_yn]
GO--End

/****** Object:  Table [sstory40].[MnAcct_Account]    Script Date: 01/03/2018 06:04:54 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

SET ANSI_PADDING ON
GO

CREATE TABLE [MnAcct_Account](
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

ALTER TABLE [MnAcct_Account] ADD  DEFAULT (getdate()) FOR [create_dt]
GO

ALTER TABLE [MnAcct_Account] ADD  DEFAULT ('N') FOR [del_yn]
GO

ALTER TABLE [MnAcct_Account] ADD  DEFAULT ('Y') FOR [using_yn]
GO--End

/****** Object:  Table [MnAuth_Base]    Script Date: 01/17/2018 14:47:52 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

SET ANSI_PADDING ON
GO

CREATE TABLE [MnAuth_Base](
	[auth_idx] [int] IDENTITY(1,1) NOT NULL,
	[onwer_bt] [char](10) NOT NULL,
	[etc_bt] [char](10) NOT NULL,
	[create_dt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[auth_idx] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

SET ANSI_PADDING OFF
GO

ALTER TABLE [MnAuth_Base] ADD  DEFAULT ('0000000000') FOR [onwer_bt]
GO

ALTER TABLE [MnAuth_Base] ADD  DEFAULT ('0000000000') FOR [etc_bt]
GO

ALTER TABLE [MnAuth_Base] ADD  DEFAULT (getdate()) FOR [create_dt]
GO--End

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
REFERENCES [MnAuth_Base] ([auth_idx])
GO

ALTER TABLE [MnAuth_Account] ADD  DEFAULT ('0000000000') FOR [account_bt]
GO--End

