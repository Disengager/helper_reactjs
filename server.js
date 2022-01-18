var http = require('http'),
    url = require('url'),
    fs = require('fs'),
    connect = require('connect'),
    serveStatic = require('serve-static'),
    sys = require('util'),
    sqlite3 = require('sqlite3').verbose(),
    WebSocketServer = require('websocket').server,
    htmlParcerVar = require("request");

connect().use(serveStatic(__dirname)).listen(8090, function(){
    console.log('Server running on 8090...');
});

var files_server = http.createServer(function(req, res) {
  if(url.parse(req.url).pathname == '/bg/getbg') {
    res.writeHead(200, {'content-type': 'image/jpeg'});
    var random = Math.floor(Math.random() * 25) + 1;
    fs.createReadStream('bg/'+random+'.jpg').pipe(res);
  }
});

files_server.listen(8092);

require('bufferjs');

var db = new sqlite3.Database('helper.sqlite');

String.prototype.replaceAll=function(find, replace_to){
    return this.replace(new RegExp(find, "g"), replace_to);
};

var Base64 = {
  encode : function (input) {
      var output = input.toString().substring(0, 1500);
      return output;
  },

  // public method for decoding
  decode : function (input) {


  },

  // private method for UTF-8 encoding
  _utf8_encode : function (string) {

  },

  // private method for UTF-8 decoding
  _utf8_decode : function (utftext) {

  }

}

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

server.listen(8091, function() {
    console.log((new Date()) + ' Server is listening on port 8090');
});

wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  return true;
}

function SplitS(homepage, tegs, searhid) {

  try {
    var bbegin = tegs.split('[=_=]'),
        newhomepage = '' + homepage,
        bbb1 = newhomepage.split(bbegin[0]);
        if(searhid == 'last') searhid = bbb1.length - 1;
        var bbb2 = bbb1[ searhid > 0? searhid : 1 ].split(bbegin[1]);
    return bbb2[0];
  }
  catch(e) {
    return 'Error in refresh function: ' + e;
  }
}

var download = function(uri, filename, callback){
  htmlParcerVar.head(uri, function(err, res, body){
    htmlParcerVar(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
        if (message.type === 'utf8') {

            console.log('Received Message: ' + message.utf8Data);
            if( message.utf8Data == "template_list") {
              var arr = JSON.parse(fs.readFileSync('split_templates.json', 'utf8'));
              arr = arr['data'];
              var data = [];
              for(template in arr) {
                data.push({'name': arr[template]['Name'], 'value':arr[template]['ID_template']});
              }
              var response = {
                'head': 'tempplate_list',
                'data': data,
              }
              connection.sendUTF( JSON.stringify(response) );
            }
            else if( message.utf8Data == "viewer" ) {
                db.serialize(function() {

                  var sql = 'SELECT * FROM helper_main WHERE ID_user = 1 ORDER BY Number_in_group';

                  db.each(sql, function(err, row) {
                    connection.sendUTF( JSON.stringify(row) );
                  });

                });


            }
            else if( message.utf8Data == "refresher" ) {
              // обновление итемов
            	var arr = JSON.parse(fs.readFileSync('split_templates.json', 'utf8'));
            	arr = arr['data']
                db.serialize(function() {
                  var sql = 'SELECT * FROM helper_main WHERE ID_user = 1 ORDER BY Number_in_group';

                  db.each(sql, function(err, row) {
                    // если Noindex в ссылке, то не парсить
                    if(row['Link'] != 'noindex') {

                      arr.forEach(function(item, i, arr) {
                      	if( row['ID_tamplate'] == item['ID_template'] ) {
                      		if(item['Search_engine'] != 'local') {
                      			var link = row['Link'].split(item['Link'])[1];
                      			if (link != undefined) {
	                      			console.log(item['Search_engine']+'?t=' + item['ID_template'] + '&l=' + link);
	                      			htmlParcerVar({ uri:item['Search_engine']+'?t=' + item['ID_template'] + '&l=' + link, headers: { 'User-Agent': 'request' } }, function (error, response, body) {
	                      				console.log(body);
	                      				row['New_str'] = body? body : row['New_str'];

	                      				var stmt = db.prepare("UPDATE helper_main SET New_str = ? WHERE ID_main =" + row['ID_main']);
			                              stmt.run( Base64.encode(row['New_str']) );
			                              // вывод итема если у него отличается новая и текущая строка
			                              if(row['New_str'] != row['Now_str'])
			                                connection.sendUTF( JSON.stringify(row) );
	                      				});
                      			}
                      		} else {
                      			htmlParcerVar({ uri:row['Link'], headers: { 'User-Agent': 'request' } }, function (error, response, body) {
		                          arr.forEach(function(item, i, arr) {
		                            // цикл по шаблонам
		                            if( row['ID_tamplate'] == item['ID_template'] ) {
		                              // сравнение шаблонов
		                              var tempnew = SplitS(body, item['Now_str_in_out'], item['Search_id']);
		                              row['New_str'] = tempnew? tempnew : row['New_str'];

		                              var stmt = db.prepare("UPDATE helper_main SET New_str = ? WHERE ID_main =" + row['ID_main']);
		                              stmt.run( Base64.encode(row['New_str']) );
		                              // вывод итема если у него отличается новая и текущая строка
		                              if(row['New_str'] != row['Now_str'])
		                                connection.sendUTF( JSON.stringify(row) );
		                            }
		                          });
		                      });
                      		}
                      	}
                      });

                      
                    } 
                    else {
                      connection.sendUTF( JSON.stringify(row) ); 
                    }
                  });
                });
            }
            if(message.utf8Data.split(':')[0] == "checker" ) {
                db.serialize(function() {
                  // чек аниме
                  var sql = 'UPDATE helper_main SET Now_str = New_str WHERE ID_user = 1 AND ID_main = ' + message.utf8Data.split(':')[1];

                  db.run(sql);

                });
            }
            if(message.utf8Data.split('::')[0] == "ed" ) {
              // функция на изменение итема
                db.serialize(function() {
                  // запрос на редактирование итемов
                  var sql = 'UPDATE helper_main SET ' + message.utf8Data.split('::')[2]  + ' WHERE ID_user = 1 AND ID_main = ' + message.utf8Data.split('::')[1];

                  db.run(sql);

                });
            }
            if(message.utf8Data.split('::')[0] == "add" ) {
              db.serialize(function() {

                let sql = 'INSERT INTO helper_main ' + message.utf8Data.split('::')[1] ;
                db.run(sql, [], function(err) {
                  if (err) { 
                    // если есть ошибка в sql запросе вернуть ошибку в консоль сервера
                    return console.error(err.message);
                  }
                  
                  // функция после добавления элемента
                  let sql = 'SELECT * FROM helper_main WHERE ID_user = 1 AND ID_main = ' + this.lastID;
                  
                  // цикл по добавленным элементам
                  db.get(sql, function(err, row) {
                    if(row['Link'] != 'noindex') {
                      
                      var arr = JSON.parse(fs.readFileSync('split_templates.json', 'utf8'));
                      arr = arr['data'];
                      
                      htmlParcerVar({ uri:row['Link'], headers: { 'User-Agent': 'request' } }, function (error, response, body) {
                          arr.forEach(function(item, i, arr) {
                            if( row['ID_tamplate'] == item['ID_template'] ) {
                              let tempnew = SplitS(body, item['Now_str_in_out'], item['Search_id']);
                              // добавить новую строку в базу 
                              row['New_str'] = tempnew? tempnew : row['New_str'];
                              // если имя пустое, то его забрать из страницы
                              if(row['Name'] == null) {
                                let name = SplitS(body, item['Title_in_out'], 0);
                                if(name)
                                  row['Name'] = name;
                              }
                              
                              try {
                                // проба загрузки картинки по дефолту
                                let poster = SplitS(body, item['Image_in_out'], 0);
                                if(poster) 
                                  download(poster, 'img/' + row['ID_main'] + '.jpg', function(){});

                              } catch (error) {
                                // если есть оишкби вывести их в консоль сервера
                                // console.log(error);

                              }
                              // обновить данные после добавления
                              let stmt = db.prepare("UPDATE helper_main SET New_str=?, Name=? WHERE ID_main =" + row['ID_main']);
                              stmt.run( Base64.encode(row['New_str']), Base64.encode(row['Name']) ); 
                              // обновление списка новинок
                              db.serialize(function() {
                                var sql = 'SELECT * FROM helper_main WHERE ID_user = 1 AND Now_str <> New_str ORDER BY Number_in_group';
            
                                db.each(sql, function(err, row) {
                                  connection.sendUTF( JSON.stringify(row) );
                                });     
                              });
                            }
                          });
                      });
                    } 
                  });
                  // цикл по добавленным элементам
                });

              });
            }
            if(message.utf8Data.split('::')[0] == "img" ) {
              // загрузка изображений
              let img =  message.utf8Data.split('::')[1];
              if(img == '[last]') {
                // если картинка нужна только что добавленная у неё код [last]
                db.serialize(function() {
                  var sql = 'SELECT * FROM helper_main WHERE ID_user = 1 ORDER BY ID_main desc';
                  // получить последнюю строку из базы
                  db.get(sql, function(err, row) {
                    img = row['ID_main'];
                    download(message.utf8Data.split('::')[2], 'img/' + img + '.jpg', function(){
                      // обновление всех списка новинок
                      db.serialize(function() {
                        var sql = 'SELECT * FROM helper_main WHERE ID_user = 1 AND Now_str <> New_str ORDER BY Number_in_group';
    
                        db.each(sql, function(err, row) {
                          connection.sendUTF( JSON.stringify(row) );
                        });     
                      });

                    });
                  });
                });               
              }

            }
            if(message.utf8Data.split('::')[0] == "delete") {
                db.serialize(function() {
                  // удаление итема
                  var sql = "DELETE FROM helper_main WHERE ID_main = " + message.utf8Data.split('::')[1];

                  db.run(sql);

                });
            }


        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});
