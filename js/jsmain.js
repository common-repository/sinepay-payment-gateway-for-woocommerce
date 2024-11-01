/*	This is the main JS codes for Woocommerce SinePay Gateway Pluggin
	Since this file cannot be properly secured, sensitive server information should not be stored here
	All function requiring those information must explicitly take them as variable - which must be given by php
*/

//This function creates cross-browser XMLHttp object, may need updates now
function createXMLHttp(){
		if (typeof XMLHttpRequest != "undefined") {
				return new XMLHttpRequest();
		} else if (window.ActiveXObject) {
				var aVersions = [ 	"MSXML2.XMLHttp.9.0",
									"MSXML2.XMLHttp.8.0",
									"MSXML2.XMLHttp.7.0",
									"MSXML2.XMLHttp.6.0",
									"MSXML2.XMLHttp.5.0",
									"MSXML2.XMLHttp.4.0","MSXML2.XMLHttp.3.0",
									"MSXML2.XMLHttp","Microsoft.XMLHttp"
								];
				for (var i = 0; i < aVersions.length; i++) {
					try {
					var oXmlHttp = new ActiveXObject(aVersions[i]);
					return oXmlHttp;
					} catch (oError) {
					//Do nothing
					}
				}
		}
		throw new Error("XMLHttp object could be created.");
	}

//global vars, must be changed dynamically
var fres = 'none';
var sres = 'none';
var shopid = 'none';
var shopurl = 'none';
var currency = 'KES';
var amount = '0.00';
var orderid = '000';
var securitykey = '000';

var code = 'ABX123';
var amount = '100';
var wcode = '123ABC';

//added, WIP 
var waitMSG1 = "<br/><br/>Please wait <br/> This won't take a minute.";
var waitMSG2 = "<br/><br/>Please wait as <br/> SinePay confirms this payment.";
var secid  = '123654';

//this function is for specific Ajax calls to sinepay
function jsonPost(jsonData){
		//var flag = true;
		//var waitres = wait(flag); 
		var http = createXMLHttp();
     	var url = "https://www.sinepay.net/public/woocommerce/sipn.php";
		var jsonString = "jsonString=" + JSON.stringify(jsonData);
		http.open("POST", url, true);
		http.setRequestHeader("Content-type","application/x-www-form-urlencoded");
     	http.onreadystatechange = function() {		
			if(http.readyState == 4) {
				if(http.status == 200) {
					flag = false;
				}
         		//alert(http.responseText);
				var retString = '';		var retArray = ''; 
				var rstatus = '';		var rpaidError = ''; 	var rReceipt = '';	var rbalance = ''; 	var rphone = '';
				retString = http.responseText;
				if(retString.includes(">")){
					//fine, proceed 
					fres = retString;
					var fresArray = fres.split(">");
					secid  = fresArray[0];
					code = fresArray[1];
					wcode = fresArray[2];
					amount = fresArray[3];
					orderid = fresArray[4];
					gerrorMSG = fresArray[5];	//always carry any other msg from server elkana@?
					//clean them now
					secid  = sanitizeAlphaNumeric(secid);
					code  = sanitizeAlphaNumeric(code);
					wcode  = sanitizeAlphaNumeric(wcode);
					amount  = sanitizeAlphaNumeric(amount);
					orderid  = sanitizeAlphaNumeric(orderid);
					gerrorMSG  = sanitizeAlphaNumeric(gerrorMSG);
					//some checks, WIP 
					if(secid == "ERROR"){
						//WIP 
					}					
				}else {
					//un-caught failure;
				}
				return retString;
        	}
     	}
 		http.send(jsonString);    		
}


//this function help with visual waiting as processing goes on
function wait(flag) {
	var xbusy = document.getElementById('sinepay_busy');
	var xconfirm = document.getElementById('sinepay_confirm');
	var dispMSG = '';
	var mainValues = fres;
	if(mainValues == 'none') {
		dispMSG = waitMSG1;
	} else {
		dispMSG = waitMSG2;
	}
	if(flag) {
		xbusy.style.display = 'block';
		xconfirm.disabled = 'disabled';
		xbusy.innerHTML = dispMSG;
	} else {
		xbusy.style.display = 'none';
		xconfirm.disabled = false;		
	}
	return;
}


//this function displays checkout modes: express or rapid
function CheckedValue(cocode) {
	var readyRes = false;
	var flag = false;
	var xbusy = document.getElementById('sinepay_busy');
	xbusy.innerHTML = waitMSG1;
	//-------------------------------------------
	var xwaiter = setInterval(function(){ 
		readyRes = checkStatus();
		//readyRes = true;
		if(readyRes){
			//clearInterval(xwaiter);	
			//flag = false;
			//var waitres = wait(flag);	
		}else {
			//flag = true;
			//var waitres = wait(flag);
		}
	}, 500);
	//-------------------------------------------
	if(secid == "ERROR"){
		alert(gerrorMSG);	
		return false; 
	}else {
		var Express = document.getElementById("logosmain");
		var Rapid = document.getElementById("logosmainwallet");
		var LogoMsg = document.getElementById("logomessage");
		LogoMsg.style.display = 'none';
		if(cocode == '1'){
			Rapid.style.display = 'none';
			Express.style.display = 'block';
		}else if(cocode == '2'){
			Express.style.display = 'none';
			Rapid.style.display = 'block';				
		}else {
			return false;
		}		
	}		
			
}

		
//this function is helper to CheckedValue
function checkStatus() {
	var mainValues = fres;
	if(mainValues != 'none') {
		return true;
	} else {
		return false;
	}
}


//this function calls the checkout main page
function callSinePay(flag){
	if(flag){
		//show it; also pass sinepay_token
		jQuery('#sinepay_token').val(secid);
		var xtoken = jQuery('#sinepay_token').val();
		if(xtoken == '123654' || xtoken == 'NONE'){
			alert('Invalid SinePay token; Refresh the page or Go-Back');
			return;
		}	
		var checkres = validateGlobal();
		if(checkres){
			var mainDV = document.getElementById("fadeWrapper");
			mainDV.style.display = 'block';		
		}else {
			alert('Sorry, but SinePay will not properly work untill the error is corrected');
			return;
		}		
	}else {
		//remove it 
		var mainDV = document.getElementById("fadeWrapper");
		mainDV.style.display = 'none';				
	}
}

		
//this function confirms payments
function confirmPayment() {
	var flag = true;
	var waitres = wait(flag);
	
	//----------------------------------------
	//checkout form submits even if payment was not received
	//but binding it to non-default behaviour (on payment failure) will stop it even if payment is next received
	//we now stop it for all; then unbind it only on successful payment	event.preventDefault(); click submit
	jQuery("form.woocommerce-checkout").on('click', function(event) {
		event.preventDefault();
	});
	//----------------------------------------	
	
	var xtime = new Date().getTime() / 1000;
	var xsecid = secid;		//conversation id
	var xcode = code;
	var xamount = amount;	
	var xcurrency = currency;
	var xorderid = orderid;
	var xmethod = method;
		
	var http = createXMLHttp();
	var url = "https://www.sinepay.net/public/woocommerce/expresspaycheck.php";
	var parameters = "time="+xtime+"&secid="+xsecid+"&code="+code+"&wcode="+wcode+"&amount="+xamount+"&currency="+xcurrency+"&orderid="+xorderid+"&method="+xmethod;
	http.open("POST", url, true);
	http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	http.onreadystatechange = function() {		
		if(http.readyState == 4) {
			if(http.status == 200) {
				flag = false;
				var waitres = wait(flag);
			}
			//alert(http.responseText);
			var retString = '';		var retArray = '';
			var rstatus = '';		var rpaidError = ''; 	var rReceipt = '';	var rbalance = ''; 	var rphone = '';
			var converId = '';		var orderId = '';		var spStatus = '';
			retString = http.responseText;
			retString = retString.trim();
			sres = retString.trim();
			//----------------------------------------					
			retArray = retString.split(">");				
			rstatus = retArray[0];
				rstatus = sanitizeAlphaNumeric(rstatus.trim());	
			rpaidError = retArray[1];
				rpaidError = sanitizeAlphaNumeric(rpaidError.trim());
			rReceipt = retArray[2];
				rReceipt = sanitizeAlphaNumeric(rReceipt.trim()); 
			
			if(rstatus == '-1') {
				alert('SinePay: ' + rpaidError);				
				return false;
			} else {						
				if(rstatus == '1') {
					rpaidError = retArray[1];
						rpaidError = rpaidError.trim();
						rpaidError = sanitizeAlphaNumeric(rpaidError);
					rReceipt = retArray[2];
						rReceipt = rReceipt.trim();
						rReceipt = sanitizeAlphaNumeric(rReceipt);
					rbalance = retArray[3];
						rbalance = rbalance.trim();
						rbalance = sanitizeAlphaNumeric(rbalance);
					rphone = retArray[4];
						rphone = rphone.trim();	
						rphone = sanitizeAlphaNumeric(rphone);
					//endProcess();		//WIP on better handling of results
					callSinePay(0);
					console.log('Thank you; payment was received and receipt sent to your email.');
					jQuery("form.woocommerce-checkout").submit();
					return true;
				}else if(rstatus == '0') {
					alert('SinePay Error: Payment was not received!');
					return false;
				}else if(rstatus == '2') {
					rbalance = retArray[3];
						rbalance = rbalance.trim();
						rbalance = sanitizeAlphaNumeric(rbalance);
					alert('SinePay Error: Payment not fully received! Contact SinePay Support for help in paying up this balance: ' + rbalance);
					return false;						
				}else {					
					alert('SinePay Error: Payment was not received, unknown error has occured');
					return false;
				}	
			}						
			//----------------------------------------	
		}
	}
	http.send(parameters);

}


//this function moves action to success or failure pages 
function endProcess() {
	//not used for now; discarded
	var mainResults = sres;
	if(mainResults == 'none'){
		alert('Serious error detected; contact SinePay Support');
		return;
	}
	//1>84166.7>968H82A>0>254707840025
	var converId = '';	var orderId = '';		var orderAmount = '';	//spReceipt must equal one of the code or wcode, wip
	var spStatus = '';	var spReceipt = '';		var spBalance = '';		var spPayerNum = '';
	var sresArray = sres.split(">");
	spStatus = sresArray[0];		//not returned, only pstatus-preceipt-balance-payernumber
	spReceipt = sresArray[1];
	spBalance = sresArray[2];
	spPayerNum = sresArray[3];
	//from first res
	converId = secid;	orderId = orderid;	orderAmount = amount;	
	//alert('successFailurePage: '+ sres);
	if(spStatus == '1'){
		alert('Thank you; payment was received and receipt sent to your email.');
		callSinePay(0);
	}else {
		alert('Sorry, but payment was not recieved. Try again');
	}	

}


//this function validates main data, WIP, set to true for now 
function validateGlobal() {
	//first, check vital order details 
	if(fres == "none"|| fres == ""){
		return false;
	}
	//next, check vital billing information
	var billing_first_name = jQuery('#billing_first_name').val();
	var billing_last_name = jQuery('#billing_last_name').val();
	var billing_company = jQuery('#billing_company').val();
	var billing_country = jQuery('#billing_country').val();
	var billing_address_1 = jQuery('#billing_address_1').val();
	var billing_address_2 = jQuery('#billing_address_2').val();
	var billing_city = jQuery('#billing_city').val();
	var billing_state = jQuery('#billing_state').val();
	var billing_postcode = jQuery('#billing_postcode').val();
	var billing_phone = jQuery('#billing_phone').val();
	var billing_email = jQuery('#billing_email').val();
	if(billing_first_name == "" || billing_last_name == "" || billing_country == "" || billing_address_1 == "" || billing_city == "" || 
		billing_postcode == "" || billing_phone == "" || billing_email == ""){
			alert('Required billing information not given; please rectify.');
		return false;
	}else {
		//fine, more validations 
	} 
	//now check if eShop currency was set
	if(currency != 'KES'){
		alert('Your eShop Currency is not set to Kenya Shillings; please set it up.');
		return false;
	}else {
		//fine, proceed 
	}
	return true;
}

//minor email validation
function isEmail(emailAddress) {
	if(emailAddress == undefined || emailAddress == null || emailAddress.length < 5){
		return false;
	}
	return true;
}

//minor phone number validation
function isPhone(phoneNumber) {
	if(phoneNumber == undefined || phoneNumber == null || phoneNumber.length < 9){
		return false;
	}
	return true;
}

//minor alphanumeric validation 
function sanitizeAlphaNumeric(data){
	data = data.trim();
	//data = data.replace(/[\W]+/g,"");
	//data = data.replace(/[^[a-zA-Z0-9|@?()\/=+_.:;\s\w,\-]/gi, '');	//wide
	data = data.replace(/[^[a-zA-Z0-9@\/=+_.;\s\w,\-]/gi, '');
	return data;	 
}

//normalizes client time to server time
function serverTime() {
    var d = new Date();
    var n = d.getTimezoneOffset();
	var nm = n * 60000;				//turning minutes to milliseconds
	var ntime = d.getTime() + nm;	//utc time in millisecond
	ntime = ntime + (180 * 60000);	//server is at +3UTC; accuracy is one minute
	//replacing the client GMT with server GMT
	var xd = new Date(ntime);
	var xds = xd.toString();
	var xda = xds.split(" ", 6);	//ignoring the descriptive part
	xda[5] = "GMT+0300";
	var xdn = xda.join(" ");
	//trying to get back the timestamp
	var sDate = new Date(xdn); 	//time zone inside date
	var sEpoch = sDate.getTime()/1000.0;	
	//return timestamp
	return sEpoch;
}


//this function shows payment messages
//-------------------------------------------------------------
function showMessage(id) {
	//alert("code: " + code);
	var mainValues = fres;
	if(mainValues == 'none') {
		alert('Error: HTML Parse values missing');
		return;
	} 
	//needed var are put in global scope, modified later
	var LogoMsg = document.getElementById("logomessage");
	LogoMsg.style.display = 'block';			
	LogoMsg.style.height = '170px';
		var mpesaMSG = 	" 1. Go to M-PESA Menu and  Select <b>Lipa Na M-Pesa</b> then > <b>Paybill</b><br/>" + 
						" 2. Enter this Paybill Number: <b>707284</b><br/>" +
						" 3. Enter this Account Number:  <b>" + code + "</b><br/>" +
						" 4. Enter Amount (in this case, No comas): <b>" + amount + "</b><br/>" +
						" 5. Give MPesa PIN and confirm <i>; (wait for M-Pesa to respond then:)</i><br/>" +
						" 6. Press <b>Confirm Payment</b> below<br/>" +
						"<input type='submit' class='subbut' name='sinepay_confirm'  id='sinepay_confirm' value='Confirm Payment'>";
						
		var airtelMSG = "1. Go to Airtel Money menu and Select <b>MAKE PAYMENTS</b> then > <b>Paybill</b> > then <b>OTHERS</b></b><br/>" +
						"2. Enter this Business Name / Number: <b>398398</b><br/>" +
						"3. Enter Amount (No comas, in this case): <b>" + amount + "</b><br/>" +
						"4. Enter your 4 digit Airtel Money <b>password</b> </li><br/>" +	
						"5. Enter this REFERENCE Number: <b>" + code + "</b> then OK; <i>wait for Airtel Money to respond then</i><br/>" + 
						"6. Press <b>Confirm Payment</b> below <br/>" +
						"<input type='submit' class='subbut' name='sinepay_confirm'  id='sinepay_confirm' value='Confirm Payment'>"; 
						
		var swalletMSG = "1. Start your <b>SinePay</b> Mobile App <br/>" +
						"2. Go to <b>SinePay Wallet</b> - <i>App password will be needed</i> <br/>" +
						"3. Tap on <b>Online Purchases</b><br/>" +
						"4. Carefully Enter this Reference Number (and tap Verify):  <b>" + wcode + "</b><br/>" +
						"5. Wait for notification confirming <b>eShop name and required amount</b> <br/>" + 
						"6. If correct Confirm by pressing <b>Pay Now</b>, if not Cancel and re-enter the Reference correctly <br/>" + 
						"7. Wait for on-screen confirmation from SinePay, and finally > Press <b>Confirm Payment</b> below.<br/>" + 
						"<input type='submit' class='subbut' name='sinepay_confirm'  id='sinepay_confirm' value='Confirm Payment'>";
						
		var orangeMSG = "1. Go to T-kash menu <br/>" +
						"2. Select <b>Paybill</b><br/>" +
						"3. Enter Paybill Number: <b>(Pending)</b> <br/>" +
						"4. Enter Amount (No comas, in this case, ): <b>" + amount + "</b><br/>" +
						"5. Enter this Reference Number: <b>" + code + "</b><br/>" +
						"6. Give <b>passward</b> and confirm; <i>(wait for T-kash to respond then:)</i> <br/>" + 
						"7. Press <b>Confirm Payment</b> below<br/>"  + 
						"<input type='submit' class='subbut' name='sinepay_confirm'  id='sinepay_confirm' value='Confirm Payment'>";
						
		var genMSG = '';
		if(id == "mpesa") {
			genMSG = mpesaMSG;	method = 'mpesa';
		} else if(id == "airtel") {
			genMSG = airtelMSG;	method = 'airtel';
		} else if(id == "swallet") {
			genMSG = swalletMSG;	method = 'swallet';
		} else if(id == "orange") {
			genMSG = orangeMSG;	method = 'orange';
		} else {
			genMSG = "Error";	method = 'none';
		}				
	LogoMsg.innerHTML = '';
	LogoMsg.innerHTML = genMSG;
}
//-------------------------------------------------------------

	
	//handles ESC Key to end full screen actioned by SinePay
	document.addEventListener('keydown', function(event) {
		const key = event.key;	/*	IE does not work	*/
		if (key === "Escape") {
			var mainDV = document.getElementById("fadeWrapper");
			mainDV.style.display = 'none';
		}
	});
	
	//changing all in-line functions to handlers 
	//-------------------------------------------------------------
	//-------------------------------------------------------------
	//handler, callSinePay 
	jQuery(function($){
		$('form.woocommerce-checkout').on( 'click', "#xmain_logo", function(event){
			callSinePay(1);
		});
	});
	
	//handler, CheckedValue
	jQuery(function($){
		$('form.woocommerce-checkout').on( 'click', "#express", function(event){
			CheckedValue(1);
		});	
		$('form.woocommerce-checkout').on( 'click', "#rapid", function(event){
			CheckedValue(2);
		});
	});
	
	//handler, logo options click; showMessage 
	jQuery(function($){
		$('form.woocommerce-checkout').on( 'click', "#mpesa", function(event){
			showMessage('mpesa');
		});
		$('form.woocommerce-checkout').on( 'click', "#airtel", function(event){
			showMessage('airtel');
		});
		$('form.woocommerce-checkout').on( 'click', "#orange", function(event){
			showMessage('orange');
		});
		$('form.woocommerce-checkout').on( 'click', "#swallet", function(event){
			showMessage('swallet');
		});		
	});	
	
	//handler, confirmPayment
	jQuery(function($){
		$('form.woocommerce-checkout').on( 'click', "#sinepay_confirm", function(event){
            event.preventDefault();
			return confirmPayment();
		});
	});	
	
	//handler, stop direct place-order access
	jQuery(function($){
		$('form.woocommerce-checkout').on( 'click', "#place_order", function(event){
            var choicePayment = $("input[name='payment_method']:checked").val();
            if(choicePayment){
				if(choicePayment == 'sinepay'){
					//we stop this button, sinepay will auto action it
					event.preventDefault();
					alert("Please use SinePay buttons; or choose another payment method");					
				}else {
					//fine, not sinepay 
				}
            }
		});
	});	
	//-------------------------------------------------------------
	
