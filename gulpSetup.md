# gulpSetup.js 설정

```json
{
    "database": "TODO",
    "options": {
        "last_go": true,
        "comment": true,
        "log": true,
        "map": "dist/map/",
        "scalar_rename": false
    },
    "clear": {
        "use": false,
        "ddl_dbname": false,
        "set_ansi_null": false,
        "set_quoted": false
    },
    "replace": [
        {
            "src": "",
            "string": "",
            "replacement": ""
        }
    ],
    "task": "default",
    "_replace": [
        {
            "src": "파일경로",
            "string": "DB.스칼라함수명",
            "replacement": ""
        }
    ]
}

```

## 설명

 - options.scalar_rename : false >> 스칼라 함수의 DB 명 변경 안함
 