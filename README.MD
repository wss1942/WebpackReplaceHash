## USAGE
html文件中的命名应该跟entry中的key一致，因为entry中的vaule它会有很多依赖，不应该以value的js作为html中的地址。

## log
### 2017年05月15日15:06:21
尝试着在compilation中找出哪些js没有改变，哪些改变了。最后发现，都是直接重新生成，只是文件没变的话hash是不变的。还是要直接比较hash值来判断js文件是否改变。

自己实现本地缓存，将hash存入本地文件，然后下一次打包时与在compilation得到的新hash对比。

## 问题
没有cacheHash.json的话，会报错。
cacheHash.json的作用是缓存打包的hash，来判断哪个js被修改了，需要重新生成。
