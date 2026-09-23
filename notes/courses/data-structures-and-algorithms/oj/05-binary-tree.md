---
title: OJ 题解 5：二叉树
description: 根据中序和后序序列重建二叉树。
course: data-structures-and-algorithms
category: oj
order: 4
source_file: OJ/05二叉树.md
tags:
  - binary-tree
  - OJ
sidebar:
  order: 4
prev:
  link: /courses/data-structures-and-algorithms/oj/04-strings/
  label: OJ 题解 4：字符串
next:
  link: /courses/data-structures-and-algorithms/oj/06-tree/
  label: OJ 题解 6：树
---
## 1由中根序列和后根序列重建二叉树

```cpp
TreeNode* buildTree(vector<int>&inorder,vector<int>& postorder,int inStart,int inEnd,int postStart,int postEnd,unordered_map<int,int>&inMap){
    if(inStart>inEnd||postStart>postEnd){
        return nullptr;
    }
    int rootVal=postorder[postEnd];
    TreeNode* root =new TreeNode(rootVal);
    int inRoot=inMap[rootVal];
    int numsLeft = inRoot-inStart;//非常有道理啊，后根序列中左子树的长度就是中根序列中左子树的长度，也恰好就是前面几个
    root->left=buildTree(inorder,postorder,inStart,inRoot-1,postStart,postStart+numsLeft-1,inMap);
    root->right=buildTree(inorder,postorder,inRoot+1,inEnd,postStart+numsLeft,postEnd-1,inMap);
    return root;
}
```


