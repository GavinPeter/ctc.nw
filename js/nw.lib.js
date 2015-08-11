$(function() {
  function Menu(cutLabel, copyLabel, pasteLabel) {
    var gui = require('nw.gui')
      , menu = new gui.Menu()

      , cut = new gui.MenuItem({
        label: cutLabel || "剪下 (Ctrl+X)"
        , click: function() {
          document.execCommand("cut");
          console.log('Menu:', 'cutted to clipboard');
        }
      })

      , copy = new gui.MenuItem({
        label: copyLabel || "複製 (Ctrl+C)"
        , click: function() {
          document.execCommand("copy");
          console.log('Menu:', 'copied to clipboard');
        }
      })

      , paste = new gui.MenuItem({
        label: pasteLabel || "貼上 (Ctrl+V)"
        , click: function() {
          document.execCommand("paste");
          console.log('Menu:', 'pasted to textarea');
        }
      })
    ;

    menu.append(cut);
    menu.append(copy);
    menu.append(paste);

    return menu;
  }

  var menu = new Menu(/* pass cut, copy, paste labels if you need i18n*/);
  $(document).on("contextmenu", function(e) {
    e.preventDefault();
    menu.popup(e.originalEvent.x, e.originalEvent.y);
  });


});

var  preurlget= function( prefixurl, RetlName, Group, ZipCode, Addr, GMCC, TCC , pageNum , queriesNum, callback){

	var request = require("request");

	var iconv = require('iconv-lite');
	
	function big5_encode(chr) {
	 var rtn = "";
	 var buf = iconv.encode(chr, "big5");
	 for(var i=0;i<buf.length;i++) {
	   rtn += '%' + buf[i].toString(16).toUpperCase();
	 }
	 return rtn;
	}

	

	 RetlName = big5_encode( RetlName );

	//console.log( RetlName);
	 Addr = big5_encode( Addr );

//weburl = prefixUrl +'WebMode=text&RetlName='+ RetlName +'&Group=' + Group + '&ZipCode=' + ZipCode + '&Addr=' +  Addr + '&GMCC=' + GMCC + '&TCC=' + TCC+ '&RequestType=0';

	if (pageNum ==1){

	request({
	    url:  prefixurl + '&WebMode=text&RetlName='
		  + RetlName +'&Group=' + Group 
		  + '&ZipCode=' + ZipCode + '&Addr=' 
		  +  Addr + '&GMCC=' + GMCC + '&TCC=' 
		  + TCC+ '&RequestType=0' ,
	    encoding: null
	}, function (error, response, body) {

	    if (!error && response.statusCode === 200) {
		//var data = iconv.decode(new Buffer(body), "big5");
	   	
		//console.log(data);

		 callback(iconv.decode(new Buffer(body), "big5"));

		//console.log(body) // Print the json response
	    }
	});

		//urlget(  prefixurl + 'WebMode=text&RetlName='+ RetlName +'&Group=' + Group + '&ZipCode=' + ZipCode + '&Addr=' +  Addr + '&GMCC=' + GMCC + '&TCC=' + TCC+ '&RequestType=0'  );
	}
	else{

		request({
		    url:   prefixUrl + '&Request=NULL_NULL_' 
			   + (RetlName == "" ? "NULL" : RetlName) 
			   + '_' +   (Group == "" ? "NULL" : Group) 
			   + '_' + (ZipCode == "" ? "NULL" : ZipCode)
 			   + '_' + (Addr == "" ? "NULL" : Addr) 
			   + '_' + (GMCC == "" ? "NULL" : GMCC) 
			   + '_' + (TCC == "" ? "NULL" : TCC)  
			   +'_NULL_0_'+ pageNum + '_20_' +  queriesNum  ,
		    encoding: null
		}, function (error, response, body) {

		    if (!error && response.statusCode === 200) {
			// var data = iconv.decode(new Buffer(body), "big5");
		   	

			 callback(iconv.decode(new Buffer(body), "big5"));


		    }
		});

		//urlget(  prefixUrl + '&Request=NULL_NULL_' + (RetlName == "" ? "NULL" : RetlName) + '_' +   (Group == "" ? "NULL" : Group) + '_' + (ZipCode == "" ? "NULL" : ZipCode)+ '_' + (Addr == "" ? "NULL" : Addr) + '_' + (GMCC == "" ? "NULL" : GMCC) + '_' + (TCC == "" ? "NULL" : TCC)  +'_NULL_0_'+ pageNum + '_20_' +  queriesNum  );
	}

}

/*function openinbrowser(url){
	var gui = require('nw.gui');

	gui.Shell.openExternal(url);

}*/
