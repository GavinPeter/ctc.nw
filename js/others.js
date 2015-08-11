var myloc = {};

//dynamic loading
function loadjscssfile(filename){

        var fileref=document.createElement('script')
        fileref.setAttribute("type","text/javascript")
        fileref.setAttribute("src", filename)


    if (typeof fileref!="undefined")
        document.getElementsByTagName("head")[0].appendChild(fileref)
}


/*sort button function*/
function resListSort() {
												
		var moreli = $('.more_li').text();	
							
		$('.more_li').remove();	
							
		$("li[cat]").tsort( {attr:"cat"} ); //.tsort({attr:'cat'});	
							
		if (moreli!==""){							
		$('#resList').append( '<li data-icon="false" class="more_li"><a href="#" id="list_more_btn"><i>'
		+ moreli + '</i></a></li>' );	
		}
						
		$('#resList').listview('refresh');
							
}

//select to my location or self defition
function selArea(value){
	

	if(value=='M'){

		$("#myloc").html("地址擷取中...");
	
		$.get('https://maps.googleapis.com/maps/api/browserlocation/json?browser=chromium&sensor=true', function(data) { 
			
			myloc = { 'lat': data.location.lat, 'lng': data.location.lng };
		
			codeLatLng( new google.maps.LatLng(data.location.lat, data.location.lng) , function(addr) {
				//console.log(addr);
				if (addr==false) return;			

				$("#myloc").html(addr +"<br />精確度：約"+ (data.accuracy/100000).toFixed(2) + "公里" );
					
				addr = addr.replace(/[0-9]/g, '');
	
				addr = addr.replace("台灣", "");
					
				var cityidx = jQuery.inArray( addr.substring(3,0), CityList );			
				
				var Group = CityCode[ cityidx ];
				
				var zipcd = ZipCode[cityidx][jQuery.inArray( addr.substring(6,3), ZipList[cityidx] ) ];
				//var zipcde = addr.substring(0,3);	
				
				 $("#Group").val(Group ).selectmenu('refresh');		
				
				changeCity(inForm.Group, inForm.ZipCode);

				 $("#ZipCode").val(zipcd).selectmenu('refresh');
	
			});
		
		});

	}
	else{

		$("#Group").val("").selectmenu('refresh');	

		$('#ZipCode').val("").selectmenu('refresh');	
		//$('#ZipCode').attr('selectedIndex', -1).selectmenu("refresh");

		$("#myloc").html("");
	}

	
}

//invert to lat lng location
function codeLatLng( latlng, callback ) {

	var geocoder = new google.maps.Geocoder();
  if (geocoder) {
    geocoder.geocode({'latLng': latlng}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          callback(results[1].formatted_address);
        } else {
	  console.log("無法轉換地址");
          callback(false);
        }
      } else {
	console.log("無法轉換地址，錯誤碼: " + status);
        callback(false);
      }
    });
  }
}


//store query data 
//var querydata = {};

var queriesNum;//total query  item number 

var Retnm, Gp, ZipCd, Adr, GC, TC;

var pageNum;

var prefixUrl = 'http://travel.nccc.com.tw/NASApp/NTC/servlet/com.du.mvc.EntryServlet?Action=RetailerList&Type=GetFull';

//query url start 
function queryctc( RetlName, Group, ZipCode, Addr, GMCC, TCC ){

		pageNum = 1;

		queriesNum =0;	

		Retnm = RetlName;
				
		Gp = Group;

		ZipCd =  ZipCode;

		Adr = Addr;

		GC =  GMCC;

		TC = TCC;	
		
		$('#resList').empty();
						
		//listadd( 1 );

		$.mobile.loading( "show", {
			text: "讀取中",
			textVisible: true,
			theme: "a",
			html: ""
		});

		preurlget( prefixUrl , RetlName, Group, ZipCode, Addr,
			 GMCC, TCC, pageNum, queriesNum, function(data) {
			parsedata(data);
			});

				
}


// parse url data callback function
function parsedata(data) {
			
			//console.log(data.results[0]);
			if (!data){
				$.mobile.loading( "hide" );
							
				messagebox("API異常，關閉程式重開!!");
							
				return;
			}
					
			
			var  allhtml =""; //count=0,
						
			var str= $(data).find("td").text();
			
				
			
			var idx = str.indexOf("總筆數");
						
			if (idx == -1){
			
				$.mobile.loading( "hide" );
							
				messagebox("找不到商店!!");


				addlog( Retnm, Gp, ZipCd, Adr, GC, TC, 0 );	
								
			
				return;
			}
						
			if ( pageNum==1 ){
				queriesNum = $.trim( str.substr(  idx  + 4 ,  7 ) );
				
				queriesNum = parseInt(queriesNum);				

				$("#listheader").text("特約商店(共" + queriesNum +"筆)");
				
				//record log
				addlog( Retnm, Gp, ZipCd, Adr, GC, TC, queriesNum );
			}					
	
			var tmpstr = str.substr( 0 ,  str.indexOf("相關資料")+5 );
			str = str.replace(tmpstr, "");
			str = str.slice( 0 ,  str.indexOf("總筆數") );
			str = str.split("詳細內容\n");
			
			var html ="", firstitem="";	

			
			
			for(i in str){
				tmpstr = str[i].split("\n");
				//count=0;
						
			for (j in tmpstr) {
				//console.log( j + " : " + tmpstr[j] );				
				//if ( tmpstr[j].length >28 && count< 4){					
								
				if ( j ==2 ) //if (count ==0)
				{
					firstitem = $.trim(tmpstr[j]);
					
				}
				else if ( j ==3 ) //else if (count==1)
				{
					html+= '<li  cat="'+  $.trim(tmpstr[j])+'" ';							
				}
				else if ( j ==5 ) //else if (count==2)
				{
					html += 'phone="' +  $.trim(tmpstr[j]) +'" ';
				}
				else if  ( j ==6 )
				{
					html += 'addr="' +  $.trim(tmpstr[j]) 
					+'"><a class="clk" href="#""><h2>' + firstitem +'</h2><p>' 
					+  $.trim(tmpstr[j]) + '</p>'
					 + '</a></li>';
				}				
				else{}							
	
			}
			}
					
			var restNum = queriesNum -  20 * pageNum;
					
			allhtml += html;
					
			//$('.ul').remove();
			//$('#resList').empty();
					
			if (restNum > 0){

				$('#resList').append(allhtml 
				+ '<li data-icon="false" class="more_li"><a href="#" onclick="listMore()"><i>還有 '
				+ restNum  +'個商家  再多載入 '+Math.min(20, restNum)+' 個</i></a></li>');
					}
					else{
						$('#resList').append(allhtml);
					}
						
						$('#resList').listview({
						autodividers: true,
						autodividersSelector: function (li) {
							return li.attr('cat');
						}
						});						
						$('#resList').listview('refresh');
						
						
						
						//listen list click event in store detail page
						$("#resList .clk").click(function() {


							showstore($(this).closest( "li" ));

						})


					//hide loading
					$.mobile.loading( "hide" );

}


/*list more function*/
 function listMore () {
	//loading show				
	$.mobile.loading( "show", {
		text: "讀取中",
		textVisible: true,
		theme: "a",
		html: ""
	});
						
	pageNum++;
						
	//listadd( ++pageNum );
	if ( queriesNum==0 ){
		console.log('queriesNum is empty');
	return;
	}

	$('.more_li').remove();	
			
	preurlget(  prefixUrl ,
	Retnm, Gp, ZipCd, Adr, GC, TC, pageNum, queriesNum ,
	function(data) {
		parsedata(data);
	});
}

//show store detail page
function showstore( li ){
	$('#store_content').html("");

	var iconappend ="";

	var cat = li.attr("cat");	
		

	var storeName = li.find("h2").text();				
		
					//add 旅行業...etc. x2 icon
	if (cat=="旅行業"||cat=="旅宿業"||cat=="觀光遊樂業"||cat=="其它觀光服務業")
		iconappend = '<li>'+ cat +'×②</li>';
	else
		iconappend = '<li>'+ cat + '</a></li>';

	var html = '<h2>'+ li.find("h2").text() + '</h2>'+
		'<ul data-role="listview" data-inset="true" id="storelistview" >'+
		iconappend +
		'<li class="ui-nodisc-icon ui-alt-icon" data-icon="heart" id="fav"><a href="#" onclick="addfav(\''
		+ storeName +'\',\'' + cat + '\',\''+ li.attr("phone") +'\',\''+ li.attr("addr") +'\')">加入最愛</a></li>';
		
	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
		html += '<li class="ui-nodisc-icon ui-alt-icon" data-icon="phone"><a tel="'+ li.attr("phone")+'">'+li.attr("phone")+'</a></li>'+
		'<li class="ui-nodisc-icon ui-alt-icon" data-icon="location"><a href="geo:0,0?q='+ li.attr("addr")+'">'+li.attr("addr") +'</a></li>';
	}	
	else{
		html += '<li>'+li.attr("phone") + '</a></li>'
		     + 	'<li>'+ li.attr("addr") + '</a></li>';
	}		
		
		html += '<a href="#" data-role="button" id="getplaceinfo_btn" data-theme="b" onclick="getplaceinfo(\''+ li.text() +'\', \''+ li.attr("addr") +'\')" >Google地圖及評論</a></ul>'
			+'<div id="store_map_canvas"></div>'
			+'<ul data-role="listview" data-inset="true" id="commentlist"></ul>'
			+'<script src="js/jquery.rateit.min.js"></script>';
		//'<a href="#" data-role="button" data-rel="back" data-theme="b" >返回</a> </ul> ';
		//	'<li data-icon="false"><a href="#"  data-rel="back" data-theme="b">返回</a></li></ul>';
		

		$('#store_content').html(html);
	
		$.mobile.changePage( '#store', { transition: "slideup" });

		 $('#store .ui-listview').listview('refresh');
		$('#store :jqmData(role=content)').trigger('create');							

}

//show txt message box
function messagebox(txt){

	var $popUp = $("<div/>").popup({
		transition: "pop",
		theme: "b",
	}).on("popupafterclose", function () {
		//remove the popup when closing
		$(this).remove();
	}).css({
            'padding': '5px'
    });

	//create a message for the popup
	   $("<p/>", {
		text: txt
	    }).appendTo($popUp);

	 $popUp.popup('open').trigger("create");

	setTimeout(function(){
   	  	$popUp.popup();
		$popUp.popup("close");
	},3000);

}

function confirmAndDelete( listitem ) {

				var str = listitem.find("h2").text();				

				$("#topic").text( str );
				$( "#confirm" ).popup( "open" );
				// Proceed when the user confirms
				$( "#confirm #yes" ).on( "click", function() {

				listitem.remove();
								
				//var delkey = str.substring( 0, str.length-1);
						
				deleteitem( "fav",str );						
						
				//$( "#resList" ).listview( "refresh" );

				});
				// Remove active state and unbind when the cancel button is clicked
				$( "#confirm #cancel" ).on( "click", function() {
					//listitem.removeClass( "ui-btn-down-d" );
					$( "#confirm #yes" ).off();
				});
}

//unix to human readable time
function timeConverter(UNIX_timestamp){

	var date = new Date(UNIX_timestamp*1000),
			datevals = [
			   date.getFullYear(),
			   date.getMonth()+1,
			   date.getDate(),
			   ( date.getHours() < 10 ? "0" +date.getHours() : date.getHours() ),
			   ( date.getMinutes() < 10 ? "0" +date.getMinutes() : date.getMinutes() ),
			   ( date.getSeconds() < 10 ? "0" +date.getSeconds() : date.getSeconds() ) 		   
			];

	  var time = datevals[0]+'/' + datevals[1] + '/' + datevals[2] + ' ' + datevals[3] +':' + datevals[4] +':' +datevals[5];
	  return time;
}

//get place info by address
function getplaceinfo( name, address ){

	$('#getplaceinfo_btn').hide();
     // var infoWindow;
	$('#store_map_canvas').height(200);

	var myOptions = {
		zoom: 14,
		center: new google.maps.LatLng(23.7, 120.7),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	var map = new google.maps.Map( document.getElementById("store_map_canvas"), myOptions );

      var geocoder = new google.maps.Geocoder();
          geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        map.setCenter(results[0].geometry.location);
        
	 var marker = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location,
          icon: 'http://www.google.com/intl/en_us/mapfiles/ms/micons/red-dot.png'
         });
 
       var  service = new google.maps.places.PlacesService(map);
   
	var request = {
	    location: map.getCenter(),
	    radius: '1',
	    query: name
	  };

    	service.textSearch( request, function callback(res, status) {
        if (status != google.maps.places.PlacesServiceStatus.OK) {
        //  console.log(status); //ZERO_RESULTS
	   messagebox("沒有評論及星等！！");
          return;
        }
         
	var request = {
		  placeId: res[0].place_id
	};

	service.getDetails(request, callback);

	function callback(place, status) {
		 if (status == google.maps.places.PlacesServiceStatus.OK && place.reviews) {
			
			for (var i = 0; i < place.reviews.length; i++) { 
				$('#commentlist').append( '<li>'
				+ '<div class="rateit comment" data-rateit-value="' + place.reviews[i].rating 
				+ '" data-rateit-ispreset="true" data-rateit-readonly="true"></div>'
				+'<p>'+ timeConverter(place.reviews[i].time) + '</p>'				
				+ '<p>' +  place.reviews[i].author_name + '</p>'
				+ '<p style="white-space:normal"><strong>' +  place.reviews[i].text + '</strong></p>' 
    				+ '</li>');
    				
			}

			$("div.rateit.comment").rateit();		
		  }		
	}

	if (res[0].rating){

	$('#store_content').prepend('<div class="rateit bigstars" data-rateit-value="'+ res[0].rating
	+'" data-rateit-starwidth="32" data-rateit-starheight="32"   data-rateit-readonly="true"  title="'
	+ res[0].rating + "星" + '"></div>');

	$('.rateit.bigstars').rateit();
	
	}
	else{
		messagebox("沒有足夠評論產生星等！！");
	}
      });
         
      }else {
        console.log("Geocode was not successful for the following reason: " + status);
      }
    });

}

