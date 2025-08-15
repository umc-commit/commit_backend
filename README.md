<img width="1424" height="797" alt="Image" src="https://github.com/user-attachments/assets/d09cdfd9-6c53-4474-a2ca-8dfa1d81a160" />

<br/>
<br/>

> 코밋은 사용자(의뢰인)와 작가(아티스트)를 연결하여 커미션을 의뢰·진행할 수 있는 플랫폼 애플리케이션입니다. </br>
> 작품 등록, 채팅, 결제, 후기, 알림, 북마크 등 커미션 거래 전 과정을 지원합니다.

<br/>
<br/>

# Tech Stack
<div align=center>
<div align=center>
<img src="https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"> 
<img src="https://img.shields.io/badge/node.js-339933?style=for-the-badge&logo=node.js&logoColor=white"> 
<img src="https://img.shields.io/badge/express-000000?style=for-the-badge&logo=express&logoColor=white"> 
<img src="https://img.shields.io/badge/mysql-4479A1?style=for-the-badge&logo=mysql&logoColor=white"> 
<br>
<img src="https://img.shields.io/badge/nginx-009639?style=for-the-badge&logo=nginx&logoColor=white">
<img src="https://img.shields.io/badge/socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white">
<img src="https://img.shields.io/badge/AWS%20EC2-FF9900?style=for-the-badge&logo=amazonec2&logoColor=white">
<img src="https://img.shields.io/badge/AWS%20S3-569A31?style=for-the-badge&logo=amazons3&logoColor=white">
<img src="https://img.shields.io/badge/AWS%20RDS-527FFF?style=for-the-badge&logo=amazonrds&logoColor=white">
</div>
    <br>
</div>

<br/>
<br/>
<br/>

# Server architecture 
<img width="873" height="731" alt="Image" src="https://github.com/user-attachments/assets/b261f280-2c4b-4a4f-8348-62954bda313f" />

<br/>
<br/>
<br/>


# Project Structure
```plaintext
├── .github
│ ├── ISSUE_TEMPLATE
│ └── workflows
│ └── pull_request_template.md
├── .idea
├── .vscode
├── config
├── node_modules
├── prisma
├── public
├── src
│ ├── bookmark
│ ├── chat
│ ├── commission
│ ├── common
│ │ ├── errors
│ │ └── swagger
│ ├── home
│ ├── middlewares
│ ├── notification
│ ├── payment
│ ├── point
│ ├── request
│ ├── review
│ ├── search
│ └── user
│ ├── auth.config.js
│ ├── bigintJson.js
│ ├── db.config.js
│ ├── firebase.config.js
│ ├── index.js
│ ├── jwt.config.js
│ ├── routes.js
│ └── s3.upload.js
├── views
├── .gitignore
├── Dockerfile
├── eslint.config.js
├── package-lock.json
└── package.json
```

<br/>
<br/>

# Development Workflow
## Branch Strategy
**🪴 GitHub Flow** 기반

- `main`: 실제 배포용 브랜치, 항상 배포 가능한 상태를 유지
- `develop` : 개발용 브랜치
- `feat/{description}`: 기능 구현용 브랜치

## Commit Convention
| 태그 | 설명 |
| --- | --- |
| `FEAT` | 새로운 기능 추가 |
| `FIX` | 버그 및 오류 수정 |
| `CHORE` | 자잘한 수정 |
| `REFACTOR` | 리팩토링, 코드 구조 개선 |
| `DOCS` | README.md 등 문서 수정 |
| `TEST` | 테스트 코드 작성 |

<br/>
<br/>


# Team Members
| 위지수 | 박지혜 | 배건우 | 서태영 |
|:------:|:------:|:------:|:------:|
| <img src="https://avatars.githubusercontent.com/weejee12" alt="위지수" width="150"> | <img src="https://avatars.githubusercontent.com/modzivv" alt="박지혜" width="150"> | <img src="https://avatars.githubusercontent.com/bkw535" alt="배건우" width="150"> | <img src="https://avatars.githubusercontent.com/taeyoung0524" alt="서태영" width="150"> | 
| BE | BE | BE | BE |
| [GitHub](https://github.com/weejee12) | [GitHub](https://github.com/modzivv) | [GitHub](https://github.com/bkw535) | [GitHub](https://github.com/taeyoung0524) |
|<li>홈/검색 기능<li>커미션 기능<li>신청함 기능 | <li>리뷰 기능<li>알림 기능|<li>서버 배포<li>채팅 기능<li>포인트/결제 기능|<li>로그인/회원가입<li>사용자 기능|<li>홈/검색 기능<li>커미션 기능<li>신청함 기능
