---
title: 后端技术与架构概览
description: 课程项目的后端技术选型、目录结构与架构策略。
course: software-engineering
order: 4
source_file: 后端技术选型.md
sidebar:
  order: 4
prev:
  link: /courses/software-engineering/03-homework-2/
  label: 第二次作业：面向对象建模
next:
  link: /courses/software-engineering/05-sequence-diagram/
  label: 课程项目顺序图
---

文件结构
```
backend/
├─ app.py, config.py, models.py
├─ routes/ (auth, blog, profile, discussion, qa, search)
├─ instance/uploads/ (avatars, attachments)
├─ run.py, requirements.txt
```

## 技术选型

- 框架：Flask（蓝图分层、应用工厂模式）+ Flask-CORS，主要是用python语言写的
- 数据：SQLAlchemy（默认 SQLite）
- 鉴权：JWT（Bearer Token），一种基于令牌的无状态认证方式，登录后会发送令牌
- 配置管理：python-dotenv，集中于 `config.py`，包含上传大小与白名单
- 文件服务：安全文件名、受控目录（instance/uploads）、可访问下载端点

## 架构策略
- 应用工厂（`create_app`）统一初始化扩展/蓝图，支持 dev/prod 与前端构建回退
- 按域拆分路由：`auth.py`（登录/注册/当前用户）、`blog.py`（博客/评论/附件）、`profile.py`（资料/头像）、`discussion.py` 等
- 统一错误与健康检查：标准化 JSON 错误响应，`/api/health` 提供就绪探针

## 主要功能
- 用户：注册/登录、个人资料维护，头像上传（返回可访问 URL）
- 博客：创建/更新/分页搜索；评论；附件上传/列出/下载/删除（作者权限）
- 讨论/QA/Search：主题帖与聚合查询接口（扩展域能力）

## 安全与治理
- 上传控制：`MAX_CONTENT_LENGTH` + 扩展名白名单（图片/文档/压缩/数据）
- 路径安全：`secure_filename` 与受控目录；URL 级下载端点
- 权限边界：JWT 校验与作者操作限制；一致的 4xx/5xx 响应策略
