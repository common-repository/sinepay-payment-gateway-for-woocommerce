<?php
/**
 * Plugin Name:			SinePay Payment Gateway for WooCommerce
 * Plugin URI:			https://sinepay.net/INSTRUCTIONS/payment-gateway-plugin.php
 * Description:			Take m-pesa, airtel-money, sinepay e-wallet, and other payments on your store.
 * Version:				1.0.3
 * Requires at least:	4.8
 * Requires PHP:		5.6+
 * Author:				Elkana Ajowi - for SinePay Services
 * License:				GPL v2 or later
 * License URI:			https://spdx.org/licenses/GPL-2.0-or-later.html
 */ 
 
 /*
 * This action hook registers our PHP class as a WooCommerce payment gateway
 */
 
add_filter( 'woocommerce_payment_gateways', 'sinepay_add_gateway_class' );
function sinepay_add_gateway_class( $gateways ) {
	$gateways[] = 'WC_sinepay_Gateway'; 
	return $gateways;
}
 
/*	
 * The class itself, please note that it is inside plugins_loaded action hook
 */
add_action( 'plugins_loaded', 'sinepay_init_gateway_class' );
function sinepay_init_gateway_class() {
 
	class WC_Sinepay_Gateway extends WC_Payment_Gateway {
 		public function __construct() {
			$this->id = 'sinepay'; 
			$this->icon = plugin_dir_url( __FILE__ ) . 'images/sinepay.bmp'; 
			$this->has_fields = true;
			$this->method_title = 'SinePay Payment Gateway';
			$this->method_description = 'SinePay Payment Gateway offers a quick and secure on-site processing.'; 
			
			// simple products only, for now 
			$this->supports = array(
				'products'
			);
			
			// Method with all the options fields
			$this->init_form_fields();
			
			// Load the settings.
			$this->init_settings();
			$this->title = $this->dataSanitizer($this->get_option( 'title' ));
			$this->description = $this->dataSanitizer($this->get_option( 'description' ));
			$this->enabled = $this->dataSanitizer($this->get_option( 'enabled' ));
			$this->testmode = 'no';
			$this->private_key = 'none';
			$this->publishable_key = $this->dataSanitizer($this->get_option( 'publishable_key' ));
			$this->delivery_party = $this->dataSanitizer($this->get_option( 'delivery_party' ));
			$this->delivery_days = $this->dataSanitizer($this->get_option( 'delivery_days' ));
						
			// This action hook saves the settings
			add_action( 'woocommerce_update_options_payment_gateways_' . $this->id, array( $this, 'process_admin_options' ) );
			
			// We need custom JavaScript to obtain a token
			add_action( 'wp_enqueue_scripts', array( $this, 'payment_scripts' ) );
		 
 		}

		/**
 		 * Plugin options, for setups
 		 */
 		public function init_form_fields(){
			  
			$this->form_fields = array(
				'enabled' => array(
					'title'       => 'Enable/Disable',
					'label'       => 'Enable SinePay Gateway',
					'type'        => 'checkbox',
					'description' => '',
					'default'     => 'no' 
				),
				'title' => array(
					'title'       => 'Title',
					'type'        => 'text',
					'description' => 'SinePay Payment Processor',
					'default'     => 'SinePay Payment Processor',
					'desc_tip'    => true
				),				
				'description' => array(
					'title'       => 'Description',
					'type'        => 'textarea',
					'description' => 'Pay with your M-Pesa, Airtel Money, or SinePay eWallet fast and securely.',
					'default'     => 'Pay with your M-Pesa, Airtel Money, or SinePay eWallet fast and securely.'
				),
				'publishable_key' => array(
					'title'       => 'eShop Hash Code', 
					'description' => 'Download and activate SinePay mobile app; then Register your eShop at www.sinepay.net to get the API Key like: M007967165M0301550',
					'type'        => 'text'
				),
				'private_key' => array(
					'title'       => 'Live Private Key',
					'description' => 'After the eShop registration above, this is the password you chose then.',
					'type'        => 'password'
				),
				'delivery_party' => array(
					'title'       => 'Delivery Party',
					'description' => 'Set this to one of these: supplier, buyer, sinepay', 
					'default'     => 'supplier',
					'type'        => 'text'
				),
				'delivery_days' => array(
					'title'       => 'Delivery Days',
					'description' => 'Set the typical number of days for the delivery to be made',
					'default'     => '3',
					'type'        => 'text'
				)				
			);
			
	 	}
 
		/**
		 * We use custom credit card form to hold the payment form
		 */
		public function payment_fields() {
 
			// displaying some description before the payment form
			if ( $this->description ) {
				// you can instructions for test mode;
				if ( $this->testmode ) {
					$this->description;
					$this->description  = trim( $this->description );
				}
				// display the description with <p> tags etc.
				echo wpautop( wp_kses_post( $this->description ) );
			}
		 
			// We echo() the form, direct closure of tags may conflict with non-closing tags of php 7.x 
			echo '<fieldset id="wc-' . esc_attr( $this->id ) . '-cc-form" class="wc-credit-card-form wc-payment-form" style="background:transparent;">';
		 
			// Add this action hook if you want your custom payment gateway to support it
			do_action( 'woocommerce_credit_card_form_start', $this->id );
		 
			// Injecting the SinePay display form
			echo '<div class="form-row form-row-wide">
				
				</div>
					<!--- start of sinepay html -->
					<input type="hidden" class="input-hidden" name="sinepay_token" id="sinepay_token" value="NONE">
					<div id="xmain_logo"></div>
					<div id="fadeWrapper">
						<div id="sinepay_busy"></div>
						<div id="sbloader" class="loader"></div>
						<div id="smainBox">
							<div id="scWrapper">
								<div id="radiohead">      
									Choose Checkout Method
									<div id="radiobuts">
										<input type="radio" name="checkouttype" id= "express" value="express">SinePay Express
										<input type="radio" name="checkouttype" id= "rapid" value="rapid">SinePay Rapid
									</div>
								</div>
							</div>
							<div id="logosmain" style="display:none"> 
								<div id="logoOne">
									<img src="'. plugin_dir_url( __FILE__ ) . 'images/paylogo/mpesa.jpg'.'" alt="Pay with MPesa" id="mpesa">
								</div>            
								<div id="logoTwo">
									<img src="'. plugin_dir_url( __FILE__ ) . 'images/paylogo/airtel.jpg'.'" alt="Pay with AirtelMoney" id="airtel">
								</div>
								<div id="logoOne">
									<img src="'. plugin_dir_url( __FILE__ ) . 'images/paylogo/tkash.png'.'" alt="Pay with T-Kash" id="orange">
								</div>   
								<div id="logoTwo">
									<img src="'. plugin_dir_url( __FILE__ ) . 'images/paylogo/sinepaywallet.png'.'" alt="Pay with SinePay Wallet" id="swallet">
								</div>                              
							</div>  
							<div id="logosmainwallet"  style="display:none">   
								<div id="logowallet" >
									<img src="'. plugin_dir_url( __FILE__ ) . 'images/paylogo/sinepaywallet.png'.'" alt="Pay with SinePay Wallet" id="swallet">
								</div>                              
							</div>  
							<div id="logomessage" style="width:auto"></div>
						</div>
					</div>			
					<!--- end of sinepay html -->
				<div class="clear"></div>';
				
			do_action( 'woocommerce_credit_card_form_end', $this->id );
			
			echo '<div class="clear"></div></fieldset>';			
		}
 
		/*
		 * Custom CSS and JS, in most cases required only when you decided to go with a custom credit card form
		 */
	 	public function payment_scripts() {
			
			// we need JavaScript to process a token only on cart/checkout pages, right?
			if ( ! is_cart() && ! is_checkout() && ! isset( $_GET['pay_for_order'] ) ) {
				return;
			}
			
			// if our payment gateway is disabled, we do not have to enqueue JS too
			if ( 'no' === $this->enabled ) {
				return;
			}
			
			// no reason to enqueue JavaScript if API keys are not set
			if ( empty( $this->private_key ) || empty( $this->publishable_key ) ) {
				return;
			}
			
			// do not work with card details without SSL unless your website is in a test mode
			if ( ! $this->testmode && ! is_ssl() ) {
				return;
			}
			
			//--------------
			global $woocommerce; 	
			//get some cart values, better order values not available now; cleaning at the time of passing to JS below
			$payflag = $woocommerce->cart->needs_payment(); 
			$count = $woocommerce->cart->cart_contents_count;
			$xtotal = $woocommerce->cart->get_cart_total();
			$xcustomer = $woocommerce->cart->get_customer();	//value not available for now, may needs logins get_option('woocommerce_currency')
			$xcurrency =  get_woocommerce_currency_symbol();
			$rcurrency =  get_woocommerce_currency();
			$carthash =  $woocommerce->cart->get_cart_hash();	//may help in back-tracing 
			$tmp_orderid = mt_rand(1000,9999);		//temporary order id
			$securitykey = time();
			$eshop_url = wc_get_page_permalink( 'shop' );
			$page_ref = wp_get_referer();
			$cart_page_id = wc_get_page_id( 'cart' );
			
			//order total needs reworks 
			$xtotal = str_replace($xcurrency, "", $xtotal);
			$xtotal = str_replace($rcurrency, "", $xtotal);
			$xtotal = floatval( preg_replace('#[^\d.]#', '', $xtotal ));		
			//-------------- 
			
			//we now bring the main js file from server; no, locally
			wp_register_script('sinepay_js', plugins_url('/js/jsmain.js', __FILE__), array('jquery'), false, false);
			
			//the CSS to render the payment processor form
			wp_enqueue_style('sinepay_css', plugins_url('/styles/expressMain.css', __FILE__)); 
			
			//custom JS in the plugin directory that works with sinepay_js
			wp_register_script( 'woocommerce_sinepay', plugins_url( 'sinepay.js', __FILE__ ), array( 'jquery', 'sinepay_js' ) );
			
			//we pass to JS the eShop Id (token) plus other details available; sanitize also	
			wp_localize_script( 'woocommerce_sinepay', 'sinepay_params', array(
				'publishableKey' => $this->dataSanitizer($this->publishable_key),
				'deliveryParty' => $this->dataSanitizer($this->delivery_party),
				'deliveryDays' 	=> $this->dataSanitizer($this->delivery_days),
				'carthash'		=> $this->dataSanitizer($carthash),
				'payflag'		=> $this->dataSanitizer($payflag),
				'count'			=> $this->dataSanitizer($count),
				'xtotal'		=> $this->dataSanitizer($xtotal),
				'xcurrency' 	=> $this->dataSanitizer($xcurrency),
				'rcurrency' 	=> $this->dataSanitizer($rcurrency),
				'tmp_orderid' 	=> $this->dataSanitizer($tmp_orderid),
				'securitykey' 	=> $this->dataSanitizer($securitykey),
				'eshop_url' 	=> $eshop_url,
				'page_ref' 	=> $page_ref,
				'cart_page_id' 	=> $cart_page_id
			) );
			
			wp_enqueue_script( 'woocommerce_sinepay' );			
		}
		
		/*
		 * Fields validation
		 */
		public function validate_fields() {
			if( empty( $_POST[ 'billing_first_name' ]) ) {
				wc_add_notice(  'First name is required!', 'error' );
				return false;
			}else {
				if($this->validateName($_POST[ 'billing_first_name' ])){
					wc_add_notice(  'Only letters and white space allowed in First Name!', 'error' );
					return false;
				}
			}
			
			if( empty( $_POST[ 'billing_last_name' ]) ) {
				wc_add_notice(  'Last name is required!', 'error' );
				return false;
			}else {
				if($this->validateName($_POST[ 'billing_last_name' ])){
					wc_add_notice(  'Only letters and white space allowed in Last Name!', 'error' );
					return false;
				}
			}			
			
			if( empty( $_POST[ 'billing_company' ]) ) {
				//wc_add_notice(  'Company name may be required!', 'error' );
				//return false;
			}else {
				if($this->validateName($_POST[ 'billing_company' ])){
					wc_add_notice(  'Only letters and white space allowed in Company Name!', 'error' );
					return false;
				}
			}			
			
			$selCountry = $this->validateName($_POST[ 'billing_country' ]);	//WIP, Not registering 
			if (strpos($selCountry, 'default') !== false) {
				wc_add_notice(  'Please select the Country Name!', 'error' );
				return false;				
			}
			
			if( empty( $_POST[ 'billing_address_1' ]) ) {
				wc_add_notice(  'Street address is required!', 'error' );
				return false;
			}else {
				if($this->validateName($_POST[ 'billing_address_1' ])){
					wc_add_notice(  'Only letters and white space allowed in Street address!', 'error' );
					return false;
				}
			}	

			if( empty( $_POST[ 'billing_address_2' ]) ) {
				//wc_add_notice(  'Street address may be required!', 'error' );
				//return false;
			}else {
				if($this->validateName($_POST[ 'billing_address_2' ])){
					wc_add_notice(  'Only letters and white space allowed in Street address 2!', 'error' );
					return false;
				}
			}

			if( empty( $_POST[ 'billing_city' ]) ) {
				wc_add_notice(  'Town / City is required!', 'error' );
				return false;
			}else {
				if($this->validateName($_POST[ 'billing_city' ])){
					wc_add_notice(  'Only letters and white space allowed in Town / City!', 'error' );
					return false;
				}
			}
			
			$selState = $this->validateName($_POST[ 'billing_state' ]);	//WIP, Not registering
			if (strpos($selState, 'default') !== false) {
				wc_add_notice(  'Please selet the State / County!', 'error' );
				return false;				
			}			
			
			if( empty( $_POST[ 'billing_postcode' ]) ) {
				wc_add_notice(  'Postcode / ZIP is required!', 'error' );
				return false;
			}else {
				if($this->validateName($_POST[ 'billing_postcode' ])){
					wc_add_notice(  'Only letters and white space allowed in Postcode / ZIP!', 'error' );
					return false;
				}
			}
			
			if( empty( $_POST[ 'billing_phone' ]) ) {
				wc_add_notice(  'Phone number is required!', 'error' );
				return false;
			}else {
				$givenPhone = preg_replace('/[^0-9]/', '', $_POST['billing_phone']);
				if(strlen($givenPhone) > 9 && strlen($givenPhone) < 14) { 
					//fine 
				}else {
					wc_add_notice(  'The given Phone number appears invalid!', 'error' );
					return false;
				}
			}	

			if( empty( $_POST[ 'billing_email' ]) ) {
				wc_add_notice(  'Email address is required!', 'error' );
				return false;
			}else {
				if (!filter_var($_POST[ 'billing_email'], FILTER_VALIDATE_EMAIL)) {
					wc_add_notice(  'The given Email address is invalid!', 'error' );
					return false;
				}
			}
			
			if( empty( $_POST[ 'order_comments' ]) ) {
				//wc_add_notice(  'Order notes may be required!', 'error' );
				//return false;
			}else {
				if($this->validateName($_POST[ 'order_comments' ])){
					wc_add_notice(  'Only letters and white space allowed in Order notes!', 'error' );
					return false;
				}
			}			
			
			return true;					
		}
		
		/*
		 * Generic input sanitizer 
		 */		
		public function dataSanitizer($data) {
			$data = trim($data);
			$data = stripslashes($data);
			$data = htmlspecialchars($data);
			return $data;
		}
		
		public function validateName($data) {
			if (!preg_match("/^[0-9a-zA-Z-' ;.]*$/",$data)) {
				return true; //bad 
			}else {
				return false;
			}
		}		
		/*
		 * We're processing the payments here
		 */
		public function process_payment( $order_id ) {
			//this runs after payment is made and confirm button pressed
			global $woocommerce;
			$order = wc_get_order( $order_id );
			
			//get all details for re-submission and php confirmation; first was JS 
			//eShop Identity 
			$shopid = $this->dataSanitizer($this->publishable_key);
			$shopurl = $order->get_checkout_order_received_url();
			$converID = sanitize_text_field( $_POST['sinepay_token'] );
			update_post_meta( $post->ID, 'sinepay_token', $converID );
			//just in case, again 
			$converID = $this->dataSanitizer($converID);
			
			//key order details; some are presumed clean  
			$orderid = $this->dataSanitizer($order_id);
			$carthash = $this->dataSanitizer($order->get_cart_hash()); 
			$orderamount = $this->dataSanitizer($order->get_total());
			$currency = $this->dataSanitizer($order->get_currency());
			$orderqty = $this->dataSanitizer($order->get_item_count());		//get_item_total
			$securitykey = time();			
			$ordercourier = $this->dataSanitizer($this->delivery_party);
			$orderdeliverydays = $this->dataSanitizer($this->delivery_days);
			
			//customer billing details; these are already clean, but sanitize anyway
			$fname = $this->dataSanitizer($order->get_billing_first_name());	//shipping ones appear empty, they are in $post variable, WIP
			$lname = $this->dataSanitizer($order->get_billing_last_name());	
			$customername = $fname .' '. $lname;
			$customeremail = $this->dataSanitizer($order->get_billing_email());
			$customerphone = $this->dataSanitizer($order->get_billing_phone());
			$customercountry = $this->dataSanitizer($order->get_billing_country());
			$customercity = $this->dataSanitizer($order->get_billing_city());
			$customerstreet = $this->dataSanitizer($order->get_billing_address_1());
			$customerplaza = $this->dataSanitizer($order->get_billing_address_2());
			$customerroomnum = $this->dataSanitizer($order->get_billing_postcode());
			
			// Get Order Payment Details; presumed clean but re-sanitized anyway
			$order_payment_method = $this->dataSanitizer($order->get_payment_method());
			$order_payment_method_title = $this->dataSanitizer($order->get_payment_method_title());
			$order_transaction_id = $this->dataSanitizer($order->get_transaction_id());	//this is empty
			
			//we create each blocks array, SinePay needs these blocks as they are 
			$eshopDetails = array("shopID"=>$shopid, "shopURL"=>$shopurl);
			
			$orderDetails = array("orderID"=>$orderid, "orderHASH"=>$carthash, "orderQTY"=>$orderqty, 
									"orderCOURIER"=>$ordercourier, "orderDELDAYS"=>$orderdeliverydays, "orderAMOUNT"=>$orderamount, 
									"orderCURRENCY"=>$currency, "orderKEY"=>$securitykey);
									
			$customerDetails = array("customerNAME"=>$customername, "customerEMAIL"=>$customeremail, "customerPHONE"=>$customerphone, 
									"customerCOUNTRY"=>$customercountry, "customerCITY"=>$customercity, "customerSTREET"=>$customerstreet, 
									"customerPLAZA"=>$customerplaza, "customerROOMNUMBER"=>$customerroomnum);
			
			//now the main array; combine the three
			$eshopDetails = array("shop"=>$eshopDetails, "order"=>$orderDetails, "customer"=>$customerDetails);
			
			//JSON Encode, ready for sending 
			$jsonMainData = json_encode($eshopDetails);
			
			//target URL for SinePay's WooCommerce payment processing
			$sinepay_url = 'https://sinepay.net/woocommerce/sipnexpress.php';
			
			/*
			 * Array with parameters for API interaction
			 */			 
			$args = array(
				"xshopKey"		=> $this->dataSanitizer($this->publishable_key),
				"xversion"		=> "1.0.1",
				"converID"		=> $converID,
				"xorderid"		=> $orderid,
				"xorderamount"	=> $orderamount,
				"xmaindata" 	=> $jsonMainData
			);
		
			/*
			 * we use wp_remote_post() to post these to SinePay
			 */
			$response = wp_remote_post( $sinepay_url, array(
			  'method'    => 'POST',
			  'body'      => http_build_query($args),
			  'timeout'   => 60,
			  'sslverify' => true,
			) );
			 
			if( !is_wp_error( $response ) ) {				 
				$body = $this->dataSanitizer($response['body']);
				//wc_add_notice($body, 'error' );	
				if ($body == 'APPROVED') {		 
					// we received the payment
					$order->payment_complete();
					$order->reduce_order_stock();
					$woocommerce->cart->empty_cart();
					// some notes to customer (replace true with false to make it private)
					$order->add_order_note( "Your order is paid! Thank you!", true );					
		 
					// Redirect to the thank you page
					return array(
						'result' => 'success',
						'redirect' => $this->get_return_url( $order )
					);
					
				} else {
					wc_add_notice(  'Please try again.', 'error' );
					return;
				}
			} else {
				throw new Exception( __( 'There is issue connecting to SinePay Payment gateway. Sorry for the inconvenience.', 'sinepay' ) );				
				wc_add_notice(  'Connection error.', 'error' );
				return;
			}					
		}
		
	}	

}
 