---
title: 第 17—18 讲作业
description: waitpid(-1,NULL,0);
course: introduction-to-computer-systems
category: homework
order: 7
source_file: ICS/作业/HW1718.md
tags:
  - introduction-to-computer-systems
  - homework
sidebar:
  order: 7
prev:
  link: /courses/introduction-to-computer-systems/homework/15-16-homework/
  label: 第 15—16 讲作业
next:
  link: /courses/introduction-to-computer-systems/homework/19-20-homework/
  label: 第 19—20 讲作业
---
## 8.21 P554

> 下面的程序可能的输出序列是什么？

```cpp
int main(){
    if(fork()==0){
        printf("a");
        fflush(stdout);
        exit(0);
    }
    else{
    printf(b);
    fflush(stdout);
    waitpid(-1,NULL,0);
    }
    printf("c");
    fflush(stdout);
    exit(0);
}
```

可能输出是```abc```和```bac```

## 8.25 P555

> 编写一个fgets函数的一个版本，叫做tfgets，它五秒钟后会超时。tfgets函数接受和fgets相同的输入。如果用户在5秒内不键入一个输入行，tfgets返回NULL。否则，它返回一个只想输入行的指针。

```cpp
char* tfgets(char* s, int size, FILE* stream) {
  char* result;

  if (!sigsetjmp(buf, 1)) {
    alarm(5);
    if (signal(SIGALRM, handler) == SIG_ERR)
      unix_error("set alarm handler error");
    return fgets(s, size, stream);
  } else {
    return NULL;
  }
}
```

## 10.6

> 程序的输出是什么

```cpp
int main(){
    int fd1,fd2;
    fd1=Open("foo.txt",O_RDONLY,0);
    fd1=Open("bar.txt",O_RDONLY,0);
    Close(fd2);
    fd2=Open("baz.txt",O_RDONLY,0);
    printf("fd2=%d\n",fd2);
    exit(0);
}
```
输出fd=4

## 10.10

> 修改图10-5
git branch --set-upstream-to=origin/your-branch-name
在变量定义完(第七行)之后插入

```cpp
if (argc == 2) {
    int fd = Open(argv[1], O_RDONLY, 0);
    while ((n = Rio_readn(fd, buf, MAXBUF)) != 0)
      Rio_writen(STDOUT_FILENO, buf, n);
    exit(0);
  }
```