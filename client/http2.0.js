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

	console.log(data.toString("hex") + " length: " + data.length);

  // var settings = new Buffer("0000060401000000000003000064", 'hex');
  // client.write(settings);

	console.log('============= response end   =============\n');
})


// 打开 Socket 链接
client.connect({host: 'localhost', port: 8080});

var pri = new Buffer("PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n");
console.log(pri.toString());
client.write(pri);

var settings = new Buffer("000000040000000001", 'hex');
client.write(settings);


// 00 06     04     00
// | length| type | flag|
// 00 00 00 00

// 00 03 00
// 00 00 64
