
/*
 * X Plugin Name: SinePay Payment Gateway for WooCommerce; JavaScript Document
 * X Plugin URI: https://sinepay.net/INSTRUCTIONS/payment-gateway-plugin.php
 * X Description: Take m-pesa, airtel-money, sinepay e-wallet, and other payments on your store.
 * X Author: Elkana Ajowi
 * X Author URI: http://sinepay.net
 * X Version: 1.0.1
 * X Date: May 30, 2020 
 * X Inspiration from: https://rudrastyh.com/woocommerce/payment-gateway-plugin.html 
*/

jQuery(document).ready(function($){
	var publishableKey = sinepay_params.publishableKey;
	var deliveryParty = sinepay_params.deliveryParty;
	var deliveryDays = sinepay_params.deliveryDays;
	var carthash = sinepay_params.carthash;
	var tmp_orderid = sinepay_params.tmp_orderid;
	var payflag = sinepay_params.payflag;
	var count = sinepay_params.count;
	var xtotal = sinepay_params.xtotal;
	var xcurrency = sinepay_params.xcurrency;
	var rcurrency = sinepay_params.rcurrency;
	var xsecuritykey = sinepay_params.securitykey;
	var eshop_url = sinepay_params.eshop_url;
	var page_ref = sinepay_params.page_ref;
	var cart_page_id = sinepay_params.cart_page_id;
	
	//prepare values 
	//------------------------------------------
		//shop details 		
		shopid = publishableKey;
		shopurl = eshop_url; 
		//order details 
		orderid = tmp_orderid;
		var orderqty = count;
		var ordercourier = deliveryParty;
		var orderamount = xtotal;
		var ordercurrency = rcurrency;
		var orderdeliverydays = deliveryDays;
		amount = orderamount;	
		currency = ordercurrency;
		securitykey = xsecuritykey;	
		//customer details, WIP 
		var customername = 'NONE';
		var customeremail = 'NONE';
		var customerphone = 'NONE';
		var customercountry = 'NONE';
		var customercity = 'NONE';
		var customerstreet = 'NONE';
		var customerplaza = 'NONE';
		var customerroomnum = 'NONE';		
		//payment confirmation details
		var secid = 'NONE';
		var code = 'NONE';
		var wcode = 'NONE';		
		var method = 'NONE';
		//prepare JSON data		
		var eshopDetails = 	{	shopID:shopid,
								shopURL:shopurl
							};									
		var orderDetails = 	{	orderID:orderid,
								orderHASH:carthash,
								orderQTY:orderqty,
								orderCOURIER:ordercourier,
								orderDELDAYS: orderdeliverydays,
								orderAMOUNT:orderamount,
								orderCURRENCY:currency,
								orderKEY:securitykey
							};
		var customerDetails = 	{	customerNAME:customername,
									customerEMAIL:customeremail,
									customerPHONE:customerphone,
									customerCOUNTRY:customercountry,
									customerCITY:customercity,
									customerSTREET:customerstreet,
									customerPLAZA:customerplaza,
									customerROOMNUMBER:customerroomnum
								};	
		var mainJSData = { 	shop: eshopDetails,
							order: orderDetails,
							customer: customerDetails
						};		
	//------------------------------------------
	//get token only if coming from cart 
	var from_flag = page_ref.includes("/cart/") || cart_page_id == '7';
	if(from_flag){
		var res = jsonPost(mainJSData);
		//alert('Sending');
	}else {
		alert('Retrieval of tokens not activated; error.');
	}
});
