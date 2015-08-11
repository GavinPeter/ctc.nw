//cordova.define("com.ncc.ctcplugin", function(require, exports, module) {

 var preurlget = function( PreUrl, RetlName, Group, ZipCode, Addr, GMCC, TCC, pageNum, queriesNum, callback){
    		cordova.exec(   callback,
                    function(err){ callback(err); } ,
                    "CTCPlugin", "Urlget",
                    [ PreUrl, RetlName,  Group, ZipCode,
                      Addr,   GMCC, TCC ,  pageNum ,  queriesNum]);
		}
//});

