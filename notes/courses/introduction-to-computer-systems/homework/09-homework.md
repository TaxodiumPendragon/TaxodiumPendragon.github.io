---
title: 第 9 讲作业
description: void bubblea(long data,long count){
course: introduction-to-computer-systems
category: homework
order: 3
source_file: ICS/作业/HW9.md
tags:
  - introduction-to-computer-systems
  - homework
sidebar:
  order: 3
prev:
  link: /courses/introduction-to-computer-systems/homework/05-07-homework/
  label: 第 5—7 讲作业
next:
  link: /courses/introduction-to-computer-systems/homework/10-12-homework/
  label: 第 10—12 讲作业
---
## P327 4.47

```cpp
void bubble_a(long *data,long count){
    long i,last;
    for(last=count-1;last>0;last--){
        for(i=0;i<last;i++)
            if(data[i+1]<data[i]){
                long t=data[i+1];
                data[i+1]=data[i];
                data[i]=t;
        }
    }
}
```

### A.书写并测试，使用指针而不是索引

```cpp
#include <stdio.h>
long a[11] = {1, 3, 7, 9, 2, 8, 6, 4, 5, 0};
void bubble_aa(long *data, long count)
{
    long i, last;
    long *p;
    long *p1;
    for (last = count - 1; last > 0; last--)
    {
        p = data;
        p1 = data + 1; // data[i+1]
        for (i = 0; i < last; i++)
        {
            if (*p1 < *p)
            {
                long t = *p1;
                *p1 = *p;
                *p = t;
            }
            ++p;
            ++p1;
        }
    }
}
int main()
{
    for (int i = 0; i < 10; ++i)
        printf("%ld ", a[i]);
    printf("\n");
    bubble_aa(a, 10);
    for (int i = 0; i < 10; ++i)
        printf("%ld ", a[i]);
    return 0;
}
```

### B.书写并测试一个由这个函数和测试代码组成的Y86-64程序

>> 可以使用有符号算术运算

x86_64汇编代码

```asm
	.file	"test.c"
	.text
	.globl	a
	.data
	.align 32
a:
	.long	1
	.long	3
	.long	7
	.long	9
	.long	2
	.long	8
	.long	6
	.long	4
	.long	5
	.long	0
	.space 4
	.text
	.globl	bubble_aa
	.def	bubble_aa;	.scl	2;	.type	32;	.endef
	.seh_proc	bubble_aa
bubble_aa:
	pushq	%rbp
	.seh_pushreg	%rbp
	movq	%rsp, %rbp
	.seh_setframe	%rbp, 0
	subq	$32, %rsp
	.seh_stackalloc	32
	.seh_endprologue
	movq	%rcx, 16(%rbp)
	movl	%edx, 24(%rbp)
	movl	24(%rbp), %eax
	subl	$1, %eax
	movl	%eax, -8(%rbp)
	jmp	.L2
.L6:
	movq	16(%rbp), %rax
	movq	%rax, -16(%rbp)
	movq	16(%rbp), %rax
	addq	$4, %rax
	movq	%rax, -24(%rbp)
	movl	$0, -4(%rbp)
	jmp	.L3
.L5:
	movq	-24(%rbp), %rax
	movl	(%rax), %edx
	movq	-16(%rbp), %rax
	movl	(%rax), %eax
	cmpl	%eax, %edx
	jge	.L4
	movq	-24(%rbp), %rax
	movl	(%rax), %eax
	movl	%eax, -28(%rbp)
	movq	-16(%rbp), %rax
	movl	(%rax), %edx
	movq	-24(%rbp), %rax
	movl	%edx, (%rax)
	movq	-16(%rbp), %rax
	movl	-28(%rbp), %edx
	movl	%edx, (%rax)
.L4:
	addq	$4, -16(%rbp)
	addq	$4, -24(%rbp)
	addl	$1, -4(%rbp)
.L3:
	movl	-4(%rbp), %eax
	cmpl	-8(%rbp), %eax
	jl	.L5
	subl	$1, -8(%rbp)
.L2:
	cmpl	$0, -8(%rbp)
	jg	.L6
	nop
	nop
	addq	$32, %rsp
	popq	%rbp
	ret
	.seh_endproc
	.def	__main;	.scl	2;	.type	32;	.endef
	.section .rdata,"dr"
.LC0:
	.ascii "%ld \0"
	.text
	.globl	main
	.def	main;	.scl	2;	.type	32;	.endef
	.seh_proc	main
main:
	pushq	%rbp
	.seh_pushreg	%rbp
	movq	%rsp, %rbp
	.seh_setframe	%rbp, 0
	subq	$48, %rsp
	.seh_stackalloc	48
	.seh_endprologue
	call	__main
	movl	$0, -4(%rbp)
	jmp	.L8
.L9:
	movl	-4(%rbp), %eax
	cltq
	leaq	0(,%rax,4), %rdx
	leaq	a(%rip), %rax
	movl	(%rdx,%rax), %eax
	movl	%eax, %edx
	leaq	.LC0(%rip), %rax
	movq	%rax, %rcx
	call	printf
	addl	$1, -4(%rbp)
.L8:
	cmpl	$9, -4(%rbp)
	jle	.L9
	movl	$10, %ecx
	call	putchar
	movl	$10, %edx
	leaq	a(%rip), %rax
	movq	%rax, %rcx
	call	bubble_aa
	movl	$0, -8(%rbp)
	jmp	.L10
.L11:
	movl	-8(%rbp), %eax
	cltq
	leaq	0(,%rax,4), %rdx
	leaq	a(%rip), %rax
	movl	(%rdx,%rax), %eax
	movl	%eax, %edx
	leaq	.LC0(%rip), %rax
	movq	%rax, %rcx
	call	printf
	addl	$1, -8(%rbp)
.L10:
	cmpl	$9, -8(%rbp)
	jle	.L11
	movl	$0, %eax
	addq	$48, %rsp
	popq	%rbp
	ret
	.seh_endproc
	.ident	"GCC: (x86_64-posix-seh-rev1, Built by MinGW-Builds project) 13.2.0"
	.def	printf;	.scl	2;	.type	32;	.endef
	.def	putchar;	.scl	2;	.type	32;	.endef

```
Y86-64  

```asm
# Y86-64 汇编代码
.pos 0
init:
    irmovq stack, %rsp    
    call main             
    halt                 

.pos 0x100
a:
    .quad 1
    .quad 3
    .quad 7
    .quad 9
    .quad 2
    .quad 8
    .quad 6
    .quad 4
    .quad 5
    .quad 0
    .quad 0


.pos 0x200
bubble_aa:
    pushq %rbp
    rrmovq %rsp, %rbp
    subq $32, %rsp
    rmmovq %rcx, 16(%rbp)
    rmmovq %rdx, 24(%rbp)
    mrmovq 24(%rbp), %rax
    irmovq $1, %r10
    subq %r10, %rax
    rmmovq %rax, -8(%rbp)
    jmp .L2

.L6:
    mrmovq 16(%rbp), %rax
    rmmovq %rax, -16(%rbp)
    mrmovq 16(%rbp), %rax
    irmovq $8, %r10
    addq %r10, %rax
    rmmovq %rax, -24(%rbp)
    irmovq $0, %r11
    rmmovq %r11, -4(%rbp)
    jmp .L3

.L5:
    mrmovq -24(%rbp), %rax
    mrmovq (%rax), %rdx
    mrmovq -16(%rbp), %rax
    mrmovq (%rax), %rcx
    subq %rcx, %rdx
    jge .L4
    mrmovq -24(%rbp), %rax
    mrmovq (%rax), %rcx
    rmmovq %rcx, -28(%rbp)
    mrmovq -16(%rbp), %rax
    mrmovq (%rax), %rdx
    mrmovq -24(%rbp), %rax
    rmmovq %rdx, (%rax)
    mrmovq -16(%rbp), %rax
    mrmovq -28(%rbp), %rdx
    rmmovq %rdx, (%rax)

.L4:
    irmovq $8, %r10
    mrmovq -16(%rbp), %rax
    addq %r10, %rax
    rmmovq %rax, -16(%rbp)
    mrmovq -24(%rbp), %rax
    addq %r10, %rax
    rmmovq %rax, -24(%rbp)
    irmovq $1, %r11
    mrmovq -4(%rbp), %rax
    addq %r11, %rax
    rmmovq %rax, -4(%rbp)

.L3:
    mrmovq -4(%rbp), %rax
    mrmovq -8(%rbp), %rcx
    subq %rcx, %rax
    jl .L5
    irmovq $1, %r10
    mrmovq -8(%rbp), %rax
    subq %r10, %rax
    rmmovq %rax, -8(%rbp)

.L2:
    mrmovq -8(%rbp), %rax
    irmovq $0, %r10
    subq %r10, %rax
    jg .L6
    addq $32, %rsp
    popq %rbp
    ret

.pos 0x300
main:
    pushq %rbp
    rrmovq %rsp, %rbp
    subq $48, %rsp
    irmovq $0, %r10
    rmmovq %r10, -4(%rbp)
    jmp .L8

.L9:
    mrmovq -4(%rbp), %rax
    irmovq $8, %r10
    mulq %r10, %rax
    irmovq a, %r11
    addq %r11, %rax
    mrmovq (%rax), %rdx
    irmovq .LC0, %rcx
    call printf
    irmovq $1, %r10
    mrmovq -4(%rbp), %rax
    addq %r10, %rax
    rmmovq %rax, -4(%rbp)

.L8:
    mrmovq -4(%rbp), %rax
    irmovq $9, %r10
    subq %r10, %rax
    jle .L9
    irmovq $10, %rcx
    call putchar
    irmovq $10, %rdx
    irmovq a, %rax
    rrmovq %rax, %rcx
    irmovq $10, %rdx
    call bubble_aa
    irmovq $0, %r10
    rmmovq %r10, -8(%rbp)
    jmp .L10

.L11:
    mrmovq -8(%rbp), %rax
    irmovq $8, %r10
    mulq %r10, %rax
    irmovq a, %r11
    addq %r11, %rax
    mrmovq (%rax), %rdx
    irmovq .LC0, %rcx
    call printf
    irmovq $1, %r10
    mrmovq -8(%rbp), %rax
    addq %r10, %rax
    rmmovq %rax, -8(%rbp)

.L10:
    mrmovq -8(%rbp), %rax
    irmovq $9, %r10
    subq %r10, %rax
    jle .L11
    irmovq $0, %rax
    addq $48, %rsp
    popq %rbp
    ret

.pos 0x400
.LC0:
    .string "%ld "

.pos 0x800
stack:
    .quad 0
    .quad 0
    .quad 0
    .quad 0
    .quad 0
    .quad 0
    .quad 0
    .quad 0
    .quad 0
    .quad 0
```

## 4.48和4.49

```asm
# Y86-64 汇编代码
.pos 0
init:
    irmovq stack, %rsp    # 初始化栈指针
    call main             # 调用main函数
    halt                  # 停止

.pos 0x100
a:
    .quad 1
    .quad 3
    .quad 7
    .quad 9
    .quad 2
    .quad 8
    .quad 6
    .quad 4
    .quad 5
    .quad 0
    .quad 0

.pos 0x200
bubble_aa:
    pushq %rbp
    rrmovq %rsp, %rbp
    subq $32, %rsp
    rmmovq %rcx, 16(%rbp)
    rmmovq %rdx, 24(%rbp)
    mrmovq 24(%rbp), %rax
    irmovq $1, %r10
    subq %r10, %rax
    rmmovq %rax, -8(%rbp)
    jmp .L2

.L6:
    mrmovq 16(%rbp), %rax
    rmmovq %rax, -16(%rbp)
    mrmovq 16(%rbp), %rax
    irmovq $8, %r10
    addq %r10, %rax
    rmmovq %rax, -24(%rbp)
    irmovq $0, %r11
    rmmovq %r11, -4(%rbp)
    jmp .L3

.L5:
    mrmovq -24(%rbp), %rax
    mrmovq (%rax), %rdx
    mrmovq -16(%rbp), %rax
    mrmovq (%rax), %rcx
    subq %rcx, %rdx
    jge .L4
    mrmovq -24(%rbp), %rax
    mrmovq (%rax), %rcx
    rmmovq %rcx, -28(%rbp)
    mrmovq -16(%rbp), %rax
    mrmovq (%rax), %rdx
    mrmovq -24(%rbp), %rax
    rmmovq %rdx, (%rax)
    mrmovq -16(%rbp), %rax
    mrmovq -28(%rbp), %rdx
    rmmovq %rdx, (%rax)

.L4:
    irmovq $8, %r10
    mrmovq -16(%rbp), %rax
    addq %r10, %rax
    rmmovq %rax, -16(%rbp)
    mrmovq -24(%rbp), %rax
    addq %r10, %rax
    rmmovq %rax, -24(%rbp)
    irmovq $1, %r11
    mrmovq -4(%rbp), %rax
    addq %r11, %rax
    rmmovq %rax, -4(%rbp)

.L3:
    mrmovq -4(%rbp), %rax
    mrmovq -8(%rbp), %rcx
    subq %rcx, %rax
    jl .L5
    irmovq $1, %r10
    mrmovq -8(%rbp), %rax
    subq %r10, %rax
    rmmovq %rax, -8(%rbp)

.L2:
    mrmovq -8(%rbp), %rax
    irmovq $0, %r10
    subq %r10, %rax
    jg .L6
    addq $32, %rsp
    popq %rbp
    ret

.pos 0x300
main:
    pushq %rbp
    rrmovq %rsp, %rbp
    subq $48, %rsp
    irmovq $0, %r10
    rmmovq %r10, -4(%rbp)
    jmp .L8

.L9:
    mrmovq -4(%rbp), %rax
    irmovq $8, %r10
    mulq %r10, %rax
    irmovq a, %r11
    addq %r11, %rax
    mrmovq (%rax), %rdx
    irmovq .LC0, %rcx
    call printf
    irmovq $1, %r10
    mrmovq -4(%rbp), %rax
    addq %r10, %rax
    rmmovq %rax, -4(%rbp)

.L8:
    mrmovq -4(%rbp), %rax
    irmovq $9, %r10
    subq %r10, %rax
    jle .L9
    irmovq $10, %rcx
    call putchar
    irmovq $10, %rdx
    irmovq a, %rax
    rrmovq %rax, %rcx
    irmovq $10, %rdx
    call bubble_aa
    irmovq $0, %r10
    rmmovq %r10, -8(%rbp)
    jmp .L10

.L11:
    mrmovq -8(%rbp), %rax
    irmovq $8, %r10
    mulq %r10, %rax
    irmovq a, %r11
    addq %r11, %rax
    mrmovq (%rax), %rdx
    irmovq .LC0, %rcx
    call printf
    irmovq $1, %r10
    mrmovq -8(%rbp), %rax
    addq %r10, %rax
    rmmovq %rax, -8(%rbp)

.L10:
    mrmovq -8(%rbp), %rax
    irmovq $9, %r10
    subq %r10, %rax
    jle .L11
    irmovq $0, %rax
    addq $48, %rsp
    popq %rbp
    ret

.pos 0x400
.LC0:
    .string "%ld "

.pos 0x800
stack:
    .quad 0
    .quad 0
    .quad 0
    .quad 0
    .quad 0
    .quad 0
    .quad 0
    .quad 0
    .quad 0
    .quad 0
```