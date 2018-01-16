/****** Object:  Table [sstory40].[MnAcct_Group]    Script Date: 01/03/2018 06:08:40 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

SET ANSI_PADDING ON
GO

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