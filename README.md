## 可运行的程序胜过面面俱到的文档

文档更关注于理论总结，而程序关注实践。我以往所受的教育注重于理论的传授，即使是编程这门非常注重实践的课程。

HTTP 协议的重要性就无需赘述了，简单而言，没有 HTTP 协议，你就看不到这篇文章了。

在这个系列里我将通过 coding 的方式来理解 HTTP 协议。HTTP 协义涉及到 client 和 server 两端的实现，为了方便理解，我将从实现 client 端开始，使用 [httpbin](http://httpbin.org) 作为调试服务器 。

## HTTP 0.9

只有一行的协议

在命令行窗口里输入`$ telnet httpbin.org 80`，注：前面加 __>__ 号的行表示我们的输入

```
Trying 54.175.222.246...
Connected to httpbin.org.
Escape character is '^]'.
> GET /ip
>
{
  "origin": "**.**.***.109"
}
Connection closed by foreign host.
```

只有一个请求方法，就是 `GET`，后接一个空格和文件路径，最后以 __CR-LF__ 结束请求，一般在程序里为 `\r\n`。

服务器接收到请求后，返回路径所指向的 HTML 文档，最后关闭 TCP 链接。

类比为函数，我们可以认为 HTTP 0.9 协议只实现了这个函数

```javascript
funcation GET(path){
  return file_content;
}
```

代码在这里，run 起来，看看效果

[client/http0.9.js](client/http0.9.js)

## HTTP 1.0
更多的方法

0.9 的协议太过简单了，只能获取（GET），如果我们要提交（POST）内容该怎么办呢？而且只规则了一种文档格式，如果要返回图片呢？

HTTP 1.0 引入了更多的请求方法（method）和头（header）。

让我们来看看 HTTP 1.0 的请求如果发送

先用 `$ telnet httpbin.org 80` 来看看效果

````
Trying 54.175.222.246...
Connected to httpbin.org.
Escape character is '^]'.
> GET /ip HTTP/1.0
> Accept: */*
>
HTTP/1.1 200 OK
Server: nginx
Date: Mon, 19 Oct 2015 11:09:23 GMT
Content-Type: application/json
Content-Length: 32
Connection: close
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true

{
  "origin": "**.**.***.109"
}
Connection closed by foreign host.

```

从1.0版本开始，每一个请求方法最后必须加上 `HTTP/*.*`，并且包含请求头，请求依旧以一个回车结束（CR-LF）。

[client/http1.0.js](client/http1.0.js)

我们再来看看响应的内容，除了内容的正文：
```
{
  "origin": "**.**.***.109"
}
```

重点增加了下面这部分，也就是响应头（header）

```
HTTP/1.1 200 OK
Server: nginx
Date: Mon, 19 Oct 2015 11:09:23 GMT
Content-Type: application/json
Content-Length: 32
Connection: close
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
```

`header` 就是关于文档的元数据，指示这个文档属于何种类型（Content-Type），大小（Content-Length）等等。

`header` 和文档之间也是以一个回车（CR-LF）为分隔，如果你想用程序来获取 `header` 的内容，也就可以用 `CR-LF` 来截取，类似这样：

```
var header = response.split(`\r\n`)[0]
```
