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

0.9 的协议太过简单了，只能获取（GET），如果我们要提交（POST）内容该怎么办呢？而且只规定了一种文档格式，如果要返回图片该怎么办呢？

HTTP 1.0 引入了更多的请求方法（method）和头（header）。

让我们来看看 HTTP 1.0 的请求如何发送

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

```javascript
var header = response.split("\r\n\r\n")[0]
```

## 构造一个 POST 请求

`POST` 方法使得客户端可以向服务端提交数据。所以现在请求不但包含了 `header` 同时也要包含 `body` (内容)。

```javascript

// 打开 Socket 链接
client.connect({host: 'httpbin.org', port: 80});

var post_body = "hello=world";

client.write("POST /post HTTP/1.1\r\n");
client.write("Host: httpbin.org\r\n");
client.write("Accept: */*\r\n");
client.write("Content-Type: application/x-www-form-urlencoded\r\n");
client.write("Content-Length: " + post_body.length + "\r\n");
client.write("\r\n"); // 用空行分隔请求头部(header)和提交的内容(body);
client.write(post_body);

```

顺便说一下，我们在这里使用了`HTTP/1.1`，没错，就是 `HTTP 1.1` 版本的协议。对于`1.1`版本的请求，一定要牢记在 `header` 必须加上

```
Host: exmaple.com
```

对于 `POST` 请求，我们还必须在 `header` 中加上 `Content-Type` 和 `Content-Length` 这两个属性，前者定义提交内容的格式，这里为 `application/x-www-form-urlencoded` ，关于 `POST` 请求格式，后续章节再细聊；后者表示提交内容的文本长度。

好吧，喝杯奶茶，让程序跑起来再说

```
$ node client/http_post.js
```

## HTTP 2.0

一个连接，多个并发请求

### 搭建 HTTP 2.0 测试服务器的环境

[nghttp2](https://github.com/tatsuhiro-t/nghttp2) 是一个 HTTP 2.0 服务器和客户端的实现，在 OSX 系统下，我采用 `brew` 工具进行安装

```
$ brew install nghttp2
```

安装成功后，让 HTTP 2.0 服务器运行起来

```
$ mkdir http2-server
$ cd http2-server
$ echo "hello world" >> index.html
$ nghttpd -v --no-tls 8080
```

最后一行运行 HTTP 2.0 服务器，试着发出来第一个 HTTP 2.0 请求吧

```
$ nghttp http://localhost:8080/index.html
hello world
```

到目前为止，一切都相当顺利。

### 万能的 telnet 神器

```
$ telnet localhost 8080
Trying ::1...
Connected to localhost.
Escape character is '^]'.
dd
Connection closed by foreign host.
```

telnet 顺利地连接上了服务器，紧接着服务器马上返回了字母`d`，我什么都没做干嘛给我返回文本，是不是服务器出啥错了？难道也要我回个`d`，试试吧，输入字母`d`，连接立马断开，试了几次结果都这样。我们在`0.9`到`1.1`学到的所有知识在`2.0`中都派不上用场了？！看来 `telnet` 也并不是万能的。


## Server-sent Events

基于文本协议的服务器发送事件

## WebSocket
