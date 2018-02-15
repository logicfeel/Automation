...module_m...
My First Blog Post!

<!doctype html>
<html>
  <head>
    <title>
        Page One
    </title>
    <link rel="stylesheet" href="main.css">
  </head>
  <body>
    
    <div class="hero">
      <img src="img/hero-1.png" alt="Hero 1 alt title"/>
    </div>
    <footer>
        
        <p>기본 footer.</p>    </footer>

  </body>
</html>](1) NOT NULL,
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

