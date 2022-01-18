'use strict';

var socket = new WebSocket('ws://localhost:8091/', 'echo-protocol'),
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
          local.list = [];
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
          local.list = [];
          console.log('add::' + sqlF + ') VALUES ' + sqlS + ')' );
          socket.send('add::' + sqlF + ') VALUES ' + sqlS + ')' );
          socket.send('img::[last]' + '::' + element['Picture'] );

        }

      }



    }

   this.setState({ data: local.list });

  }
});

  return splicet;
}
var Select = React.createClass({
  displayName: 'options',
  componentWillMount: function componentWillMount() {
    socket.send('template_list');
  },
  render: function render() {
    try {
      var options = this.props.options_data.map(function(option){
        return React.createElement('option', { className: 'option', 
                                               value: option.value }, option.name);
      });
    } catch(err) {
      //
    } 
    return React.createElement(
      'select',
      { className: 'module__input', 
        value: this.props.value, 
        name : this.props.name,
        onChange: function onChange(e) { searchVal( e.target.name,  e.target.value, 'ID_tamplate'); }
      },
      options
    );
  }
});
window.get_templates_select = function( name, value, options_data) {
  return React.createElement('div', { className: 'module_select' },
      React.createElement(Select,  { value: value, id: 'elements-edit-form-tamplate', name : name, 
                                     options_data: options_data }),
    )
}

window.create_from_element = function( label, element ) {
  return React.createElement( 'div', { className: 'module__item' },
            React.createElement( 'div', { className: 'module__label' }, label ),
            element
         )
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

		return React.createElement('div', {}, iframe);
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
    options_data = this.props.template_option,
    prefix = this.props.type == 1? 'New: ' : '';


    if (this.props.data.length != 0) var items = this.props.data.map(function (item) {

      var hidepanel = !item['editable'] ? React.createElement( 'div', { className: 'elements-hide module__edit' } ) : React.createElement( 'div', { className: 'elements-edit module__edit' } ,

            React.createElement( 'div', { className: 'module__top' },
              window.create_from_element(
                'Ссылка',
                React.createElement( 'input', { className: 'module__input', 
                                                type: 'text', 
                                                value: item['Link'], 
                                                id: 'elements-edit-form-link', 
                                                name : item['ID_main'], 
                                                onChange: function onChange(e) { searchVal( e.target.name,  e.target.value, 'Link'); } } )
              ),
              window.create_from_element(
                'Номер',
                React.createElement( 'input', { className: 'module__input', 
                                                type: 'text', 
                                                value: item['Number_in_group'], 
                                                id: 'elements-edit-form-number', 
                                                name : item['ID_main'], 
                                                onChange: function onChange(e) { searchVal( e.target.name,  
                                                  e.target.value, 'Number_in_group'); } } )
              ),
              window.create_from_element(
                'Название',
                React.createElement( 'input', { className: 'module__input', 
                                                type: 'text', 
                                                value: item['Name'], 
                                                id: 'elements-edit-form-name', 
                                                name : item['ID_main'], 
                                                onChange: function onChange(e) { searchVal( e.target.name,  e.target.value, 'Name'); } } )
              ),
              window.create_from_element(
                'Картинка',
                React.createElement( 'input', { className: 'module__input', 
                                                type: 'text', 
                                                value: '',
                                                id: 'elements-edit-form-picture', 
                                                name : item['ID_main'], 
                                                onChange: function onChange(e) { searchVal( e.target.name,  e.target.value, 'Picture'); } } )
              ),
              window.create_from_element(
                'Шаблон',
                window.get_templates_select(item['ID_main'], item['ID_tamplate'], options_data)
              ),  
              window.create_from_element(
                'Дополнительная ссылка',
                React.createElement( 'input', { className: 'module__input', 
                                                type: 'text', 
                                                value: item['Link_aditional'], 
                                                id: 'elements-edit-form-addictionallink', 
                                                name : item['ID_main'], 
                                                onChange: function onChange(e) { searchVal( e.target.name,  
                                                  e.target.value, 'Link_aditional'); } } )
              ),
              window.create_from_element(
                'Сейчас',
                React.createElement( 'input', { className: 'module__input', 
                                                type: 'text', 
                                                value: item['Now_str'], 
                                                id: 'elements-edit-form-now', 
                                                name : item['ID_main'], 
                                                onChange: function onChange(e) { searchVal( e.target.name,  e.target.value, 'Now_str'); } } )
              ),
              window.create_from_element(
                'Новое',
                React.createElement( 'input', { className: 'module__input', 
                                                type: 'text', 
                                                value: item['New_str'], 
                                                id: 'elements-edit-form-new', 
                                                name : item['ID_main'], 
                                                onChange: function onChange(e) { searchVal( e.target.name,  e.target.value, 'New_str'); } } )
              ),
           ),
            React.createElement( 'div', { className: 'module__bottom', onClick: function onClick() {
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
                'img', { id: item['ID_main'], src: "img/" + (item['Link'] != 'noindex' ? item['ID_main'] : '-2') + ".jpg" }
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
              ),
              React.createElement(
                'div',
                { className: 'element-poster-btns-edit element-poster-btn', onClick: function onClick() {
                    return magicFunc(item['ID_main']);
                }},
                'm'
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
    var random = Math.floor(Math.random() * 25) + 1;
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
      if(temp1['head'] == 'tempplate_list') {
        this.setState({ template_option: temp1['data'] });
        return false
      }

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
    var nodes = [];
    this.state.data.forEach(function (element, index, array) { //выделение заметок
      if(element['Link'] == 'noindex') // если Noindex то нету ссылки
        nodes[index] = element;
    });
    return React.createElement(
      'div',
      { className: 'wrap'},
      React.createElement(
        'div',
        { className: 'main' },
        React.createElement(TopNav, { refreshAction: this.refresh, changeBgAction: this.changeBg, addItemAction: this.addItem, animateClass: this.state.refreshAnimate, consoleAction: this.console }),
        React.createElement(LeftNav, { data: this.state.data }),
        React.createElement( 'div', { className: 'caption-all' }, 'Notes' ),
        React.createElement(Content, { data: nodes, checkAction: this.check, magicAction: this.magic, deleteElemAction: this.deleteElem, editElemAction: this.editElem, saveElemAction: this.saveElem, type: 3, template_option: this.state.template_option }),
        React.createElement( 'div', { className: 'caption-all' }, 'New' ),
        React.createElement(Content, { data: this.state.data, checkAction: this.check, magicAction: this.magic, deleteElemAction: this.deleteElem, editElemAction: this.editElem, saveElemAction: this.saveElem, type: 1, template_option: this.state.template_option }),
        React.createElement( 'div', { className: 'caption-all' }, 'All' ),
        React.createElement(Content, { data: this.state.addictdata, checkAction: this.check, magicAction: this.magic, deleteElemAction: this.deleteElem, editElemAction: this.editElem, saveElemAction: this.saveElem, type: 2 }),
        React.createElement(Popup, { popup: this.state.popup, closeConsole: this.closeConsole })
      )
    );
  }
});

function start_render() {
  ReactDOM.render(React.createElement(Wrapper, { url: 'page/viewer.php' }), document.body);  
}
start_render();
// setInterval(start_render, 10); 

