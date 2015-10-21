var net = require('net');

var client = new net.Socket();

client.on('connect', function(){
	console.log('*************** Socket open ********************');
})

client.on('end', function(){
	console.log('*************** Socket close *******************');
})

// 服务器的响应数据
client.on('data', function(data){
	console.log('============= response begin =============\n');

	console.log(data.toString());

	console.log('============= response end   =============\n');
})


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
