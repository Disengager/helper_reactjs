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
    console.log('Server running on 8080...');
});

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
    console.log((new Date()) + ' Server is listening on port 8080');
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
        bbb1 = newhomepage.split(bbegin[0]),
        bbb2 = bbb1[ searhid > 0? searhid : 1 ].split(bbegin[1]);
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

            if( message.utf8Data == "viewer" ) {
                db.serialize(function() {

                  var sql = 'SELECT * FROM helper_main WHERE ID_user = 1 ORDER BY Number_in_group';

                  db.each(sql, function(err, row) {
                    connection.sendUTF( JSON.stringify(row) );
                  });

                });


            }
            else if( message.utf8Data == "refresher" ) {
            	var arr = JSON.parse(fs.readFileSync('split_templates.json', 'utf8'));
            	arr = arr['data']
                db.serialize(function() {
                  var sql = 'SELECT * FROM helper_main WHERE ID_user = 1 ORDER BY Number_in_group';

                  db.each(sql, function(err, row) {

                    htmlParcerVar({ uri:row['Link'], headers: { 'User-Agent': 'request' } }, function (error, response, body) {
                        arr.forEach(function(item, i, arr) {
                          if( row['ID_tamplate'] == item['ID_template'] ) {
                            var tempnew = SplitS(body, item['Now_str_in_out'], item['Search_id']);
                            row['New_str'] = tempnew? tempnew : row['New_str'];

                            var stmt = db.prepare("UPDATE helper_main SET New_str = ? WHERE ID_main =" + row['ID_main']);
                            stmt.run( Base64.encode(row['New_str']) );

                            if(row['New_str'] != row['Now_str'])
                              connection.sendUTF( JSON.stringify(row) );
                          }
                        });

                    });

                  });

                });
            }
            if(message.utf8Data.split(':')[0] == "checker" ) {
                db.serialize(function() {

                  var sql = 'UPDATE helper_main SET Now_str = New_str WHERE ID_user = 1 AND ID_main = ' + message.utf8Data.split(':')[1];

                  db.run(sql);

                });
            }
            if(message.utf8Data.split('::')[0] == "ed" ) {
                db.serialize(function() {

                  var sql = 'UPDATE helper_main SET ' + message.utf8Data.split('::')[2]  + ' WHERE ID_user = 1 AND ID_main = ' + message.utf8Data.split('::')[1];

                  db.run(sql);

                });
            }
            if(message.utf8Data.split('::')[0] == "add" ) {
              db.serialize(function() {

                var sql = 'INSERT INTO helper_main ' + message.utf8Data.split('::')[1] ;
                console.log(sql);
                db.run(sql);

              });
            }
            if(message.utf8Data.split('::')[0] == "img" ) {


              download(message.utf8Data.split('::')[2], 'img/' + message.utf8Data.split('::')[1] + '.jpg', function(){

                  db.serialize(function() {

                    var sql = 'SELECT * FROM helper_main WHERE ID_user = 1 AND Now_str <> New_str ORDER BY Number_in_group';

                    db.each(sql, function(err, row) {
                      connection.sendUTF( JSON.stringify(row) );
                    });

                  });

              });

            }
            if(message.utf8Data.split('::')[0] == "delete") {
                db.serialize(function() {

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
