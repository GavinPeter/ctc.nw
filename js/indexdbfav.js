
"use strict";
    var dbName = "jqm-fav";
      var dbVersion =6;
      var favDB = {};
      var indexedDB = window.indexedDB;

      if ('webkitIndexedDB' in window) {
        //   window.IDBTransaction = window.webkitIDBTransaction;
        window.IDBKeyRange = window.webkitIDBKeyRange;
      }

      favDB.indexedDB = {};
      favDB.indexedDB.db = null;


      favDB.indexedDB.onerror = function(e) {
        console.log(e);
      };

      favDB.indexedDB.open = function() {
        var request = indexedDB.open(dbName, dbVersion);
	
        request.onsuccess = function(e) {
          console.log ("success our DB: " + dbName + " is open and ready for work");
          favDB.indexedDB.db = e.target.result;
	}


        
        request.onupgradeneeded = function(e) {
          favDB.indexedDB.db = e.target.result;
          var db = favDB.indexedDB.db;
          console.log ("Going to upgrade our DB from version: "+ e.oldVersion + " to " + e.newVersion);

            try {
              if (db.objectStoreNames && db.objectStoreNames.contains("fav")) {
                db.deleteObjectStore("fav");
              }
		//add log object store
	     if (db.objectStoreNames && db.objectStoreNames.contains("log")) {
              	         db.deleteObjectStore("log");
            	}
	}
            catch (err) {
              console.log("got err in objectStoreNames:" + err);
            }
            var store = db.createObjectStore("fav",
                {keyPath: "name"});
            console.log("-- onupgradeneeded store:"+ JSON.stringify(store));

		//add log object store
	   var logstore = db.createObjectStore( "log",
                	{keyPath: "timeStamp"});
            	console.log("-- onupgradeneeded store:"+ JSON.stringify(logstore));
          }
        	
        
       
        request.onfailure = function(e) {
          console.error("could not open our DB! Err:"+e);  
        }
        
        request.onerror = function(e) {
          console.error("Well... How should I put it? We have some issues with our DB! Err:"+e);
        }
      };

	favDB.indexedDB.addlog = function( RetlName,  Group, ZipCode, Addr, GMCC, TCC, RsCnt ) {
        var db = favDB.indexedDB.db;
        var trans = db.transaction("log", "readwrite");
        var store = trans.objectStore("log");

        var data = {
          "RetlName": RetlName,
	  "Group": Group,
	  "ZipCode": ZipCode,
	  "Addr": Addr,
	  "GMCC": GMCC,
	  "TCC": TCC,
	  "RsCnt": RsCnt,
	  "timeStamp": new Date().getTime()
        };



        var request = store.put(data);


        request.onsuccess = function(e) {

		var count = store.count();
        	
		count.onsuccess = function() {
	    		if ( count.result > 10 ){
			// Get everything in the store;
	       	 	var keyRange = IDBKeyRange.lowerBound(0);
		 	var cursorRequest = store.openCursor(keyRange);

		 	cursorRequest.onsuccess = function(e) {
		   	var result = e.target.result;
		 
		    	if(!!result == false){ 	
		    	return;
		 	}	
			var request = store.delete(result.value.timeStamp);

			request.onsuccess = function(e) {
				// console.log("Successful deleteing: ", e);
			};

			request.onerror = function(e) {
			  	console.error("Error deleteing: ", e);
			};

			};

			cursorRequest.onerror = favDB.indexedDB.onerror;	
		
			}
		}


        }

        request.onerror = function(e) {
          console.error("Error Adding a log: ", e);
        }


      };


      favDB.indexedDB.addfav = function(  name, cat, phone, addr ) {
        var db = favDB.indexedDB.db;
        var trans = db.transaction("fav", "readwrite");
        var store = trans.objectStore("fav");

        var data = {
          "name": name,
	  "cat": cat,
	  "phone": phone,
	  "addr": addr
        };

        var request = store.put(data);

        request.onsuccess = function(e) {
		
		var count = store.count();
        	
		count.onsuccess = function() {
				
		if ( count.result >20){

			// Get everything in the store;
			var keyRange = IDBKeyRange.lowerBound(0);
			var cursorRequest = store.openCursor(keyRange);

			cursorRequest.onsuccess = function(e) {
			  var result = e.target.result;
			  if(!!result == false){
			    return;
			 }	
			
				var request = store.delete(result.value.name);

				request.onsuccess = function(e) {
				//	console.log("Successful deleteing: ", e);
				};

				request.onerror = function(e) {
				  console.error("Error deleteing: ", e);
				};

			};

			cursorRequest.onerror = favDB.indexedDB.onerror;
					
			}
			messagebox("已新增至最愛!!");
        	}
        };

        request.onerror = function(e) {
          console.error("Error Adding an item: ", e);
        };
      };
	

	favDB.indexedDB.deletelog = function(id) {
        var db = favDB.indexedDB.db;
        var trans = db.transaction("log", "readwrite");
        var store = trans.objectStore("log");

        var request = store.delete(id);

        request.onsuccess = function(e) {
	
	      $( "#" + id ).remove();
	
	      $( "#resList" ).listview( "refresh" );
        };

        request.onerror = function(e) {
          console.error("Error deleteing: ", e);
        };
      };

      favDB.indexedDB.deletefav = function(id) {
        var db = favDB.indexedDB.db;
        var trans = db.transaction("fav", "readwrite");
        var store = trans.objectStore("fav");

        var request = store.delete(id);

        request.onsuccess = function(e) {
          //console.log("successful deleted")
        };

        request.onerror = function(e) {
          console.error("Error deleteing: ", e);
        };
      };

     favDB.indexedDB.getAllLogs = function() {


        var db = favDB.indexedDB.db;
        var trans = db.transaction("log", "readonly");
        var store = trans.objectStore("log");

        // Get everything in the store;
        var keyRange = IDBKeyRange.lowerBound(0);
        var cursorRequest = store.openCursor(keyRange);

        cursorRequest.onsuccess = function(e) {
          var result = e.target.result;
         
	    if(!!result == false){ 	
		$('#resList').listview({
		autodividers: true,
		autodividersSelector: function (li) {
		return li.attr('cat');
		}
		});
	
	 	$('#resList').listview('refresh');
            return;
	 }	

          renderLog(result.value);
          result.continue();
        };

        cursorRequest.onerror = favDB.indexedDB.onerror;
      };

	function renderLog(row) {
 
		var cityidx = jQuery.inArray( row.Group, CityCode );
		var ZipCodeidx =  jQuery.inArray( row.ZipCode, ZipCode[cityidx]);
		var GMccidx = jQuery.inArray( row.GMCC, GMccCode );
		var TccCodeidx =  jQuery.inArray( row.TCC, TccCode[GMccidx]);

		//show list log reversely
      		$('#resList').prepend( '<li  id="'+ row.timeStamp + '" cat="'+  GMccList[GMccidx] 
		+ '"><a onclick="queryctc(\''+row.RetlName +'\',\''
		+ row.Group+'\',\''+row.ZipCode+'\',\''+row.Addr+'\',\''
		+ row.GMCC+'\',\''+row.TCC+'\')"  href="#">' 
		+ '<div class="ui-grid-a"><div class="ui-block-a">'
		+ '<p>名稱：'+ row.RetlName +'</p><p>行業別：'+ ( GMccidx == 0 ? "" : GMccList[GMccidx] )+ '</p><p>行業分類：'
		+ ( TccCodeidx == 0 ? "" : TccList[GMccidx][TccCodeidx] )   + '</p></div>' 
		+ '<div class="ui-block-b"><p>縣市：' 
		+ ( cityidx == 0 ? "" : CityList[cityidx]) +'</p><p>鄉鎮：'
		+ ( ZipCodeidx == 0 ? "" : ZipList[cityidx][ZipCodeidx]  ) + '</p><p>路名：' + row.Addr +'</p></div>'
		+ '<p class="ui-li-aside"><strong>'
		+ timeConverter(row.timeStamp/1000) +'</strong></p>'
		+ '<span class="ui-li-count">' + row.RsCnt +'</span></div></a>'	
		+ '<a href="#" onclick="favDB.indexedDB.deletelog('+ row.timeStamp + ')">刪除</a></li>');
      }


      favDB.indexedDB.getAllfavItems = function() {


        var db = favDB.indexedDB.db;
        var trans = db.transaction("fav", "readonly");
        var store = trans.objectStore("fav");

        // Get everything in the store;
        var keyRange = IDBKeyRange.lowerBound(0);
        var cursorRequest = store.openCursor(keyRange);

        cursorRequest.onsuccess = function(e) {
          var result = e.target.result;
          if(!!result == false){
		
		$('#resList').listview({
		autodividers: true,
		autodividersSelector: function (li) {
		return li.attr('cat');
		}
		});	

		//listen list click event in store detail page
		$("#resList .clk").click(function() {

			showstore($(this).closest( "li" ));

		})

		// Click delete split-button to remove list item
		$( ".delete" ).on( "click", function() {
			var listitem = $(this).closest( "li" );// $( this ).parent( "li.ui-li" );
				confirmAndDelete( listitem );
		});

		$('#resList').listview('refresh');
            return;
	 }	

          //renderfav(result.value);
	 $('#resList').append(  '<li  cat="'+  result.value.cat + '" phone="' + result.value.phone +
				 '" addr="' + result.value.addr 
				+'"><a class="clk" href="#"><h2>' + result.value.name + '</h2><p>' +result.value.addr
				+'</p></a> <a href="#" class="delete">刪除</a></li>');
          result.continue();
        };



        cursorRequest.onerror = favDB.indexedDB.onerror;
      };

    	//chagne to my favorite page
	function logpage(){	

	$.mobile.changePage( $("#list"), { transition: "slide"} );

	$("#listheader").text("查詢紀錄(最多10筆)");		

	$('#resList').empty();

	favDB.indexedDB.getAllLogs();
	
	}


	//chagne to my favorite page
	function favpage(){	

	$.mobile.changePage( $("#list"), { transition: "slide"} );

	$("#listheader").text("最愛商店(最多20筆)");		

	$('#resList').empty();

	 favDB.indexedDB.getAllfavItems();	
	}


	//indexdb initialize
	$(document).on('pageinit','#splash',function(){ 
	
	favDB.indexedDB.open();

	//bueatify select menu
	CityList[0]="縣市名稱";

	$.each(ZipList , function( idx, value ) {
  		ZipList[idx][0] = "鄉鎮名稱"; 
	});

	GMccList[0] = "行業別";

	$.each(TccList , function( idx, value ) {
  		TccList[idx][0] = "行業分類"; 
	});

	    setTimeout(function(){
		$.mobile.changePage("#home", "fade");
	    }, 2000);
	});
