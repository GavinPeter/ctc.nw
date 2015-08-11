//jquery indexeddb plugin wiht indexeddbshim crosss platform

//initial DB necessary 
function initDB(){

       	$.indexedDB("jqm-fav", {
                		"schema": {
                			"6": function(versionTransaction){
                				var favlist = versionTransaction.createObjectStore("fav", 
                					{"keyPath": "name"}
						);
                				favlist.createIndex("name");
						//console.info("Created new object store");
						
						
						
						 var loglist = versionTransaction.createObjectStore("log", 
							{"keyPath": "timeStamp"}
						);
		    				loglist.createIndex("timeStamp");
                			}
                		}
                	}).then(function(){
                		// do something once the DB is opened with the object stores set up
                		
                	}, function(){
                		console.log("Looks like an error occured " + JSON.stringify(arguments))
                	});
}


// Read an item from catalog and add it to wishlist
function addlog( RetlName, Group, ZipCode, Addr, GMCC, TCC, RsCnt ){

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

	$.indexedDB("jqm-fav").objectStore("log").count().done(function(val){
			if ( val > 19 ){
				$.indexedDB("jqm-fav").objectStore("log").each(function( result ){
					 result["delete"]();
					 return false;
        			}).then(function(){});
			}
			
			$.indexedDB("jqm-fav").objectStore("log").add(data).done(function(val){});
     });
		
	

}

// add to fav table
function addfav(  name, cat, phone, addr ){
	var data = {
      "name": name,
	  "cat": cat,
	  "phone": phone,
	  "addr": addr
        };

	$.indexedDB("jqm-fav").objectStore("fav").add(data).done(function(val){
			messagebox("已新增至最愛!!");
         });

}

//share function 
function deleteitem( table, id ){
	
	$.indexedDB("jqm-fav").objectStore( table )["delete"]( id ).done(function(){
    
	      $( "#resList" ).listview( "refresh" );
		  
     });

}

//only for delete log
function deletelog(id){
	  $( "#" + id ).remove();
	  
	  deleteitem( "log", id );
}

function getAllLogs(){

	
	var count = 0;

	$.mobile.changePage( $("#list"), { transition: "slide"} );

	$("#listheader").text("查詢紀錄");		

	$('#resList').empty();

	
	
	$.indexedDB("jqm-fav").objectStore("log").each(function(row){
                
				count++;
				 //row["delete"]();
				renderLog(row.value);
				
            }).then(function(){
				
				//show messagebox if count zero
				if (count !=0){
					$('#resList').listview({
					autodividers: true,
					autodividersSelector: function (li) {
					return li.attr('cat');
					}
					});
		
					$('#resList').listview('refresh');		
				}
				else{
					messagebox("沒有紀錄!!");
				}
    }); 	

	
}

//call by getAllLogs
function renderLog(row) {
 
		var cityidx = jQuery.inArray( row.Group, CityCode );
		var ZipCodeidx =  jQuery.inArray( row.ZipCode, ZipCode[cityidx]);
		var GMccidx = jQuery.inArray( row.GMCC, GMccCode );
		var TccCodeidx =  jQuery.inArray( row.TCC, TccCode[GMccidx]);

		//show list log reversely
		if ( cityidx!=-1 && ZipCodeidx !=-1&& GMccidx !=-1 && TccCodeidx !=-1 ){
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
			+ timeConverter( row.timeStamp/1000 ) +'</strong></p>'
			+ '<span class="ui-li-count">' + row.RsCnt +'</span></div></a>'	
			+ '<a href="#" onclick="deletelog('+ row.timeStamp +')">刪除</a></li>');
		}
		else{
			
			console.log("Check cityidx:" + cityidx + " ZipCodeidx:" +ZipCodeidx +  " GMccidx:" +GMccidx  +" TccCodeidx:" +TccCodeidx );
			
			messagebox("縣市名、鄉鎮名、行業別或行業分類無法解析！！");
		}
      }

//get favorite list page 
function getAllfavItems(){
	
	var count= 0;
	
	$.mobile.changePage( $("#list"), { transition: "slide"} );

	$("#listheader").text("最愛商店");		

	$('#resList').empty();
	
	$.indexedDB("jqm-fav").objectStore("fav").each(function( result ){
			
			count++;
		
			console.log(result);
		
           $('#resList').append(  '<li  cat="'+  result.value.cat + '" phone="' + result.value.phone +
				 '" addr="' + result.value.addr 
				+'"><a class="clk" href="#"><h2>' + result.value.name + '</h2><p>' +result.value.addr
				+'</p></a> <a href="#" class="delete">刪除</a></li>');
        }).then(function(){
			
			if (count !=0){
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
					var listitem = $(this).closest( "li" );
						confirmAndDelete( listitem );
				});

				$('#resList').listview('refresh');		
			}
			else{
				messagebox("沒有最愛商店!!");
			}
	});

}

//for test purpose
function deleteobject(){

	$.indexedDB("jqm-fav").deleteDatabase();
	
	alert("刪除資料庫");
}

//for test purpose
function countlog(){
	
	$.indexedDB("jqm-fav").objectStore("log").count().done(function(val){
			//console.log(val);
			alert(val);
         });
	
	
}
 

   
