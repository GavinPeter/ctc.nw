
//Start home page reset 
  $(document).on('pageinit','#home',function(){


	
		

	/*initial GMCC select option*/
   	 initGMcc(inForm.GMCC, inForm.TCC);



	$('#GMCC').selectmenu('refresh');
	
	$('#TCC').selectmenu("refresh");

	


	 initCity( inForm.Group, inForm.ZipCode );

	$('#Group').selectmenu('refresh');
			
	$('#ZipCode').selectmenu("refresh");
		
	//jquery mobile selectmenu need
	 $("#Group").change(function () {

		changeCity(inForm.Group, inForm.ZipCode);
	
       		 $('#ZipCode').selectmenu("refresh");
   	 });	 			


	$("#GMCC").change(function () {

		changeGMcc(inForm.GMCC, inForm.TCC);
	
       		$('#TCC').selectmenu("refresh");
   	 });	

	//calculate bonus of sabbaticalday year 
	$("#sabbaticalday").change(function () {
		

		if ($("#sabbaticalday").val()==7){
			
			$("#sabbaticalbonus").val( 8000) ;

		}
		else if ($("#sabbaticalday").val()==14){

			$("#sabbaticalbonus").val( 16000) ;

		}
		else{
			$("#sabbaticalbonus").val( 1143 * $("#sabbaticalday").val()) ;
		}
		
				

   	 });	


	/*submit button function*/
	$("#submit_btn").on('click', function () {

	var RetlName = $("#RetlName").val();
	var Group = $("#Group").val();
	var ZipCode =  $("#ZipCode").val();
	var Addr = $("#Addr").val();
	var GMCC = $("#GMCC").val();
	var TCC = $("#TCC").val();
	
	if (($("#select-area").val()=="")&&(GMCC=="")){
		alert('沒有選擇區域或行業別!!');
		return;
	}

	$.mobile.changePage( $("#list"), { transition: "slide"} );

	//$("#listheader").text("特約商店列表");

	queryctc( RetlName, Group, ZipCode, Addr, GMCC, TCC);	
		
	});


});
