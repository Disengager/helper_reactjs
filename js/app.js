'use strict';

var socket = new WebSocket('ws://192.168.0.27:8091/', 'echo-protocol'),
    local = {};

local.list = [];
local.addictlist = [];

window.checkerFunc = function( val ) {
  var splicet = -1;
  local.list.forEach(function (element, index, array) {
    if (element['ID_main'] == val) splicet = index;
  });

  return splicet;
}
window.deleteFunc = function( val ) {
  var splicet = -1;
  local.addictlist.forEach(function (element, index, array) {
    if (element['ID_main'] == val) splicet = index;
  });

  return splicet;
}

window.searchVal = function( val, val2, number ) {
  var splicet = -1;
  local.list.forEach(function (element, index, array) {
  if (element['ID_main'] == val) {
   splicet = 1;
   element[number] = val2;
   if( element['NewEditable'] ) {
     if( element['NewEditable'].length > -1 ) {

       var listen = 0;
       element['NewEditable'].forEach( function( elementNumber, indexNumber, arrNumber ) {
         if( elementNumber == number )
          listen = 1;
       });
       if( listen == 0 )
        element['NewEditable'].push( number );
     }
   }
   else {
     element['NewEditable'] = [];
     element['NewEditable'].push( number );
   }
  //  console.log( element );
   this.setState({ data: local.list });
  }
});



  return splicet;
}

window.searchTo = function( val ) {
  var splicet = -1;
  local.list.forEach(function (element, index, array) {
  if (element['ID_main'] == val) {

   splicet = 1;

   //код на составление эдит запроса
   console.log( element );
   if( element['NewEditable'] )
    if( element['NewEditable'].length > -1  ) {
      var sql = '',
          sqlF = '(',
          sqlS = '(',
          localIndex = 0,
          notimg = true;

      element['NewEditable'].map(function( elementSecond ) {
        if(element['ID_main'] != -1 ) {
          if(elementSecond == 'Picture' )
            notimg = false;
          else {
            if(localIndex != 0 )
              sql += ', ';
            sql +=  elementSecond + ' = ' + '\'' + element[elementSecond] + '\'' ;
            localIndex++;
          }
        }
        else {

          if(elementSecond == 'Picture' )
            notimg = false;
          else {
            if(localIndex != 0 ) {
              sqlF += ', ';
              sqlS += ', ';
            }
            sqlF += elementSecond;
            sqlS +=  '\'' + element[elementSecond] + '\'' ;
            localIndex++;
          }


        }

      });

      if( notimg ) {
        if( element['ID_main'] != -1 ) {

          console.log( 'ed::' + element['ID_main']  + '::' + sql );
          socket.send('ed::' + element['ID_main']  + '::' + sql );

        }
        else {

          console.log('add::'  + sqlF + ', ID_user) VALUES ' + sqlS + ', \'1\')' );
          socket.send('add::'  + sqlF + ', ID_user) VALUES ' + sqlS + ', \'1\')' );

        }


      }
      else {

        if( element['ID_main'] != -1 ) {

          console.log( 'ed::' + element['ID_main']  + '::' + sql );
          socket.send('ed::' + element['ID_main']  + '::' + sql );
          socket.send('img::' + element['ID_main']  + '::' + element['Picture'] );

        }
        else  {
          local.list[index]['ID_main'] = local.list[index]['ID_main'] - 1;
          // console.log(local.list[index]['ID_main']);
          console.log('add::' + sqlF + ') VALUES ' + sqlS + ')' );
          socket.send('add::' + sqlF + ') VALUES ' + sqlS + ')' );
          socket.send('img::' + element['ID_main']  + '::' + element['Picture'] );

        }

      }



    }

   this.setState({ data: local.list });

  }
});

  return splicet;
}

var Popup = React.createClass({
	displayName: 'Popup',

  	render: function render() {

  		var iframe = null;
  		var func = this.props.closeConsole;

  		if( this.props.popup != undefined )
  			iframe = React.createElement('div', { className: 'magic-console' },

  				React.createElement('div', { className: 'magic-console-head' },

  					React.createElement('div', {className: 'magic-console-head-close', onClick: function onClick() { return func(); } }, 'закрыть' )
  				),
  				React.createElement('iframe', { 'src': this.props.popup }, 'Тестовая кнопочка')

  			);

		return React.createElement('div', {},

			iframe

		);
	}
});

var Content = React.createClass({
  displayName: 'Content',

  render: function render() {
    var func =  this.props.type == 1? this.props.checkAction : function( temp ) {},
    magicFunc = this.props.magicAction,
    deleteFunc = this.props.deleteElemAction,
    editFunc = this.props.editElemAction,
    saveFunc = this.props.saveElemAction,
    prefix = this.props.type == 1? 'New: ' : '';


    if (this.props.data.length != 0) var items = this.props.data.map(function (item) {

      var hidepanel = !item['editable'] ? React.createElement( 'div', { className: 'elements-hide' } ) : React.createElement( 'div', { className: 'elements-edit' } ,

            React.createElement( 'div', { className: 'elements-edit-top' },
              React.createElement( 'div', { className: 'elements-edit-form-item' },
                React.createElement( 'div', { className: 'elements-edit-form-label' }, 'Ссылка' ),
                React.createElement( 'input', { className: 'elements-edit-form-input', type: 'text', value: item['Link'], id: 'elements-edit-form-link', name : item['ID_main'], onChange: function onChange(e) { searchVal( e.target.name,  e.target.value, 'Link'); } } )
              ),
              React.createElement( 'div', { className: 'elements-edit-form-item' },
                React.createElement( 'div', { className: 'elements-edit-form-label' }, 'Номер' ),
                React.createElement( 'input', { className: 'elements-edit-form-input', type: 'text', value: item['Number_in_group'], id: 'elements-edit-form-number', name : item['ID_main'], onChange: function onChange(e) { searchVal( e.target.name,  e.target.value, 'Number_in_group'); } } )
              ),
              React.createElement( 'div', { className: 'elements-edit-form-item' },
              React.createElement( 'div', { className: 'elements-edit-form-label' }, 'Название' ),
              React.createElement( 'input', { className: 'elements-edit-form-input', type: 'text', value: item['Name'], id: 'elements-edit-form-name', name : item['ID_main'], onChange: function onChange(e) { searchVal( e.target.name,  e.target.value, 'Name'); } } )
              ),
              React.createElement( 'div', { className: 'elements-edit-form-item' },
                React.createElement( 'div', { className: 'elements-edit-form-label' }, 'Картинка' ),
                React.createElement( 'input', { className: 'elements-edit-form-input', type: 'text', value: '',id: 'elements-edit-form-picture', name : item['ID_main'], onChange: function onChange(e) { searchVal( e.target.name,  e.target.value, 'Picture'); } } )
              ),
              React.createElement( 'div', { className: 'elements-edit-form-item' },
                React.createElement( 'div', { className: 'elements-edit-form-label' }, 'Шаблон' ),
                React.createElement( 'input', { className: 'elements-edit-form-input', type: 'text', value: item['ID_tamplate'], id: 'elements-edit-form-tamplate', name : item['ID_main'], onChange: function onChange(e) { searchVal( e.target.name,  e.target.value, 'ID_tamplate'); } } ),
                React.createElement( 'div', { className: 'elements-edit-form-help' },
                  React.createElement( 'div', { className: 'element-edit-form-help-text' }, '1-tr.anidub.com'),
                  React.createElement( 'div', { className: 'element-edit-form-help-text' }, '2-animevost'),
                  React.createElement( 'div', { className: 'element-edit-form-help-text' }, '3-online.anidub'),
                  React.createElement( 'div', { className: 'element-edit-form-help-text' }, '4-vk.com/video'),
                  React.createElement( 'div', { className: 'element-edit-form-help-text' }, '5-anistar.ru'),
                  React.createElement( 'div', { className: 'element-edit-form-help-text' }, '6-aniplay'),
                  React.createElement( 'div', { className: 'element-edit-form-help-text' }, '7-mintmanga'),
                  React.createElement( 'div', { className: 'element-edit-form-help-text' }, '8-readmanga'),
                  React.createElement( 'div', { className: 'element-edit-form-help-text' }, '16-lostfilm'),
                  React.createElement( 'div', { className: 'element-edit-form-help-text' }, '17-youtube'),
                  React.createElement( 'div', { className: 'element-edit-form-help-text' }, '18-anilibria'),
                  React.createElement( 'div', { className: 'element-edit-form-help-text' }, '20-newstudio'),
                  React.createElement( 'div', { className: 'element-edit-form-help-text' }, '24-readcomics.me'),
                  React.createElement( 'div', { className: 'element-edit-form-help-text' }, '31-casstudio' )
                )
              ),
              React.createElement( 'div', { className: 'elements-edit-form-item' },
                React.createElement( 'div', { className: 'elements-edit-form-label' }, 'Дополнительная ссылка' ),
                React.createElement( 'input', { className: 'elements-edit-form-input', type: 'text', value: item['Link_aditional'], id: 'elements-edit-form-addictionallink', name : item['ID_main'], onChange: function onChange(e) { searchVal( e.target.name,  e.target.value, 'Link_aditional'); } } )
              ),
              React.createElement( 'div', { className: 'elements-edit-form-item' },
                React.createElement( 'div', { className: 'elements-edit-form-label' }, 'Сейчас' ),
                React.createElement( 'input', { className: 'elements-edit-form-input', type: 'text', value: item['Now_str'], id: 'elements-edit-form-now', name : item['ID_main'], onChange: function onChange(e) { searchVal( e.target.name,  e.target.value, 'Now_str'); } } )
              ),
              React.createElement( 'div', { className: 'elements-edit-form-item' },
                React.createElement( 'div', { className: 'elements-edit-form-label' }, 'Новое' ),
                React.createElement( 'input', { className: 'elements-edit-form-input', type: 'text', value: item['New_str'], id: 'elements-edit-form-new', name : item['ID_main'], onChange: function onChange(e) { searchVal( e.target.name,  e.target.value, 'New_str'); } } )
              ),
           ),
            React.createElement( 'div', { className: 'elements-edit-bottom', onClick: function onClick() {
              return saveFunc( item['ID_main'] );
            } }, 'Сохранить' )

          ),
          elementsName = !item['editable'] ? 'elements' : 'elements elements-editable';

      return React.createElement(
        'div',
        { className: elementsName },
        React.createElement(
          'div',
          { className: 'elements-main' },
          React.createElement(
            'div',
            { className: 'element-poster' },
            React.createElement(
              'a',
              { href: item['Link'], target: '_blank' },
              React.createElement(
                'img', { id: item['ID_main'], src: "img/" + item['ID_main'] + ".jpg" }
              )
            ),
            React.createElement(
              'div',
              { className: 'element-poster-btns' },
              React.createElement(
                'div',
                { className: 'element-poster-btns-cls element-poster-btn', onClick: function onClick() {
                  return deleteFunc( item['ID_main'] );
                }},
                'x'
              ),
              React.createElement(
                'div',
                { className: 'element-poster-btn' },
                'g'
              ),
              React.createElement(
                'div',
                { className: 'element-poster-btns-edit element-poster-btn', onClick: function onClick() {
                    return editFunc( item['ID_main'] );
                }},
                'e'
              )

            )
          ),

          React.createElement(
              'a',
              { className: 'button text-overflow', onClick: function onClick() {
                  return func(item['ID_main']);
                }, title: "Now: " + item['Now_str']},
              prefix + item['New_str']
            ),
            React.createElement(
              'div',
              { className: 'button', onClick: function onClick() {
                  return magicFunc(item['ID_main']);
                } },
              '\u041C\u0430\u0433\u0438\u044F'
            )
        ),
        hidepanel


      );
    });else var items = null;
    return React.createElement(
      'div',
      { className: 'poster-block' },
      items
    );
  }
});

var LeftNav = React.createClass({
  displayName: 'LeftNav',

  render: function render() {
    var classes = "";
    if (this.props.data.length != 0) var items = this.props.data.map(function (item) {
      if (item['New_str'].indexOf('Error in refresh function: ') != -1) classes = 'left-nav-item error-line';else classes = "left-nav-item";
      return React.createElement(
        'div',
        { className: classes },
        React.createElement(
          'a',
          { href: "#" + item['ID_main'] },
          item['Name']
        )
      );
    });else var items = null;
    return React.createElement(
      'div',
      { className: 'left-nav' },
      items
    );
  }
});

var TopNav = React.createClass({
  displayName: 'TopNav',

  render: function render() {
    return React.createElement(
      'div',
      { className: 'top-nav' },
      React.createElement(
        'div',
        { className: 'top-nav-item' },
        React.createElement(
          'a',
          { className: "refresh-btn " + this.props.animateClass, onClick: this.props.refreshAction },
          '\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C'
        )
      ),
      React.createElement(
        'div',
        { className: 'top-nav-item' },
        React.createElement(
          'a',
          { className: "change-bg", onClick: this.props.changeBgAction },
          'Сменить фон'
        )
      ),
      React.createElement(
        'div',
        { className: 'top-nav-item' },
        React.createElement(
          'a',
          { className: "new-item", onClick: this.props.addItemAction },
          'Добавить'
        )
      ),
      React.createElement(
        'div',
        { className: 'top-nav-item' },
        React.createElement(
          'a',
          { className: "new-item", onClick: this.props.consoleAction },
          'Консоль'
        )
      ),
      React.createElement(
        'div',
        { className: 'top-nav-item' },
        React.createElement(
          'a',
          { className: "new-item", href: "http://localhost:8090/assets/youtube-videos.html", target: "_blank" },
          'Видео'
        )
      )
    );
  }
});

var Wrapper = React.createClass({
  displayName: 'Wrapper',

  refresh: function refresh() {
    socket.send('refresher');
    local.list = [];
    this.setState({ refreshAnimate: 'refresh-btn-animate' });
  },
  changeBg: function changeBg() {
    var random = Math.floor(Math.random() * 77) + 1;
    this.setState({ bg: 'bg/' + random + '.jpg' });
  },
  console: function console() {
    this.setState({ popup: 'http://localhost:8090/assets/console.html' });
  },
  addItem: function addItem() {

      var newElement = {

        "ID_group": "",
        "ID_main": "-1",
        "ID_tamplate": "",
        "ID_user": "1",
        "Link": "",
        "Link_aditional": "",
        "Name": "",
        "New_str": "",
        "Now_str": "",
        "Number_in_group": "",
        "editable" : true

      };

      local.list.unshift( newElement );
      this.setState({ list: local.list });


      console.log( local.list );

  },
  check: function check(val) {
    socket.send('checker:' + val);

    local.list.splice( checkerFunc( val ) , 1);
    this.setState({ data: local.list });
  },
  magic: function magic(val) {

    // $.ajax({
    // 	data: { type: "react" },
    // 	url: "http://localhost:8090/js/test.html",
    //   	cache: false,
    //   	success: function(data) {

	   //  	this.setState({ popup: data });

	   //  }.bind(this),
	   //    error: function(xhr, status, err) {
	   //      console.error(this.props.url, status, err.toString());
	   //  }.bind(this)
    // });


    var person = prompt("Тут вы можете творить магию\nИд итема: " + val + "\n\n\nСменить метод вывода(number - число 1 - 3, 1 - новое, 2 - остальное, 3 - ве): \nviewe::number\n\nЗадать картинки для фона: \nbglist::1-link1,2-link2,n-linkn\n\nСменить стили(number - число 1-2): \nstyle::number\n\nДобавить итему постер: \nimg::id::link\n\nДобавить итем: \nadd::lblb\n\nРедактировать итем: \nedit::id::name::link::position\n\nУдалить итем: \ndelete::id", "img::" + val + "::");



    if (person != null) {
      socket.send(person);
      local.list = [];
    }
  },
  editElem: function editElem(val) {

    var listIndex = checkerFunc( val ),
        addictlistIndex = deleteFunc( val );



    if( listIndex != -1 ) {
      if( local.list[listIndex]['editable'] ) {
          delete local.list[listIndex]['editable'];
      }
      else {
          local.list[listIndex]['editable'] = true;

      }
      this.setState({ data: local.list });
    }
    else if( addictlistIndex != -1 ) {
        if( local.addictlist[addictlistIndex]['editable'] ) {
            delete local.addictlist[addictlistIndex]['editable'];
        }
        else {
            local.addictlist[addictlistIndex]['editable'] = true;
        }
        this.setState({ addictdata: local.addictlist });
    }


    // if( addictlistIndex != -1 ) {
    //   if( local.addictlist[addictlistIndex]['editable'] ) {
    //       delete local.addictlist[addictlistIndex]['editable'];
    //   }
    //   else {
    //       local.addictlist[addictlistIndex]['editable'] = true;
    //   }
    //   this.setState({ addictdata: local.addictlist });
    // }


  },
  saveElem: function saveElem( val ) {


    var listIndex = checkerFunc( val ),
        addictlistIndex = deleteFunc( val );

    if( listIndex != -1 ) {
        if( local.list[listIndex]['editable'] ) {
          delete local.list[listIndex]['editable'];
        }
        else {
          local.list[listIndex]['editable'] = true;
        }
      this.setState({ data: local.list });
    }
    else if( addictlistIndex != -1 ) {
        if( local.addictlist[addictlistIndex]['editable'] ) {
          delete local.addictlist[addictlistIndex]['editable'];
        }
        else {
          local.addictlist[addictlistIndex]['editable'] = true;
        }
        this.setState({ addictdata: local.addictlist });
      }

      window.searchTo( val );
  },
  deleteElem: function deleteElem(val) {

    socket.send( "delete::" + val );

    var checkerFuncVal = checkerFunc( val ),
        deleteFuncVal = deleteFunc( val );

    if( checkerFuncVal != -1 ) {
      local.list.splice( checkerFuncVal , 1);
      this.setState({ data: local.list });
    }

    if( deleteFuncVal != -1 ) {
      local.addictlist.splice( deleteFuncVal, 1);
      this.setState({ addictdata: local.addictlist });
    }

  },
  closeConsole: function closeConsole() {
  	this.setState({ popup: undefined });
  },
  setStatFunction: function setStatFunction(e) {
    try {
      var temp1 = JSON.parse(e.data);
      var temp2 = '' + temp1['ID_main'];
      if( temp1['New_str'] != temp1['Now_str']) {
        local.list[temp2] = temp1;
        local.addictlist[temp2] = temp1;
        this.setState({ data: local.list });
        this.setState({ addictdata: local.addictlist });
      }
      else {
        local.addictlist[temp2] = temp1;
        this.setState({ addictdata: local.addictlist });
      }

    } catch (err) {
      this.setState({ data: {} });
    }
  },
  setMessageFunction: function setMessageFunction() {
    socket.send('viewer');
  },
  loadCommentsFromServer: function loadCommentsFromServer() {
    // new
    socket.onopen = this.setMessageFunction;
    socket.onmessage = this.setStatFunction;
  }, // new
  getInitialState: function getInitialState() {
    var random = Math.floor(Math.random() * 77) + 1;
    return { data: [], addictdata: [], bg: 'bg/' + random + '.jpg', refreshAnimate: '' };
  },
  componentDidMount: function componentDidMount() {
    this.loadCommentsFromServer();

    // load();
    // load = function() {};
  },
  render: function render() {
    return React.createElement(
      'div',
      { className: 'wrap', style: { background: "url(" + this.state.bg + ") 0% 0% / cover", backgroundSize: "cover" } },
      React.createElement(
        'div',
        { className: 'main' },
        React.createElement(TopNav, { refreshAction: this.refresh, changeBgAction: this.changeBg, addItemAction: this.addItem, animateClass: this.state.refreshAnimate, consoleAction: this.console }),
        React.createElement(LeftNav, { data: this.state.data }),
        React.createElement( 'div', { className: 'caption-all' }, 'New' ),
        React.createElement(Content, { data: this.state.data, checkAction: this.check, magicAction: this.magic, deleteElemAction: this.deleteElem, editElemAction: this.editElem, saveElemAction: this.saveElem, type: 1 }),
        React.createElement( 'div', { className: 'caption-all' }, 'All' ),
        React.createElement(Content, { data: this.state.addictdata, checkAction: this.check, magicAction: this.magic, deleteElemAction: this.deleteElem, editElemAction: this.editElem, saveElemAction: this.saveElem, type: 2 }),
        React.createElement(Popup, { popup: this.state.popup, closeConsole: this.closeConsole })
      )
    );
  }
});

ReactDOM.render(React.createElement(Wrapper, { url: 'page/viewer.php' }), document.body);
