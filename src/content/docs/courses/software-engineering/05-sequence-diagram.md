---
title: 课程项目顺序图
description: Student Lab Blog System 主要交互的 PlantUML 源码。
course: software-engineering
order: 5
source_file: 顺序图.md
sidebar:
  order: 5
prev:
  link: /courses/software-engineering/04-backend/
  label: 后端技术与架构概览
next:
  link: /courses/software-engineering/06-testing/
  label: 软件测试：课堂随记
---

```text title="PlantUML · 顺序图源码"
@startuml
skinparam style strictuml
title Student Lab Blog System - Main Interaction Sequence

participant User
participant App
participant AuthService
participant ResourceService
participant AIService
participant Comment
participant Admin

User -> App: Access / Login
activate App

App -> AuthService: << verifyCredentials >>
activate AuthService
AuthService -->> App: AuthSuccess
deactivate AuthService

App -> ResourceService: << fetchRecentBlogs >>
activate ResourceService
ResourceService -->> App: BlogList
deactivate ResourceService

App -> ResourceService: << openBlog >>
activate ResourceService
ResourceService -> AIService: << generateExplanation >>
activate AIService
AIService -->> ResourceService: ExplanationReady
destroy AIService
ResourceService -->> App: Blog + AIExplanation
deactivate ResourceService

App -> Comment: << createComment >>
activate Comment
Comment -->> App: CommentAdded
deactivate Comment

App -> Admin: << reviewSubmission >>
activate Admin
Admin -->> App: Approved
deactivate Admin

App -->> User: Display UpdatedPage
deactivate App

@enduml
```
