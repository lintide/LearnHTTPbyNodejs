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
	console.log('============= Header begin =============\n');

	var response = data.toString();
	var header = response.split(/\r\n\r\n/)[0];
	console.log(header);

	console.log('============= Header end   =============\n');
})


// 打开 Socket 链接
client.connect({host: 'httpbin.org', port: 80});

// 发送 HTTP GET 请求，在 0.9 协议中，也只有 GET 请求
client.write("GET /ip HTTP/1.0\n");
client.write("Accept: */*\n");
client.write("\r\n");
