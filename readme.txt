=== SinePay Payment Plugin for WooCommerce ===
Contributors: elkanaajowi
Tags: sinepay, payment plugin, Kenya, payment method, woocommerce, wordpress, m-pesa payment
Requires at least: 4.8
Tested up to: 5.8
Requires PHP: 5.6
Stable tag: 1.0.3
License: GPLv2 or later
License URI: https://spdx.org/licenses/GPL-2.0-or-later.html

SinePay Payment Plugin for WooCommerce allows you to collect payment from multiple sources in Kenya like M-Pesa, Airtel-Money, SinePay eWallet, etc.

== Description ==
Borrowing from SinePay Express, the SinePay Payment Plugin for WooCommerce is designed to do on-site payment processing (no redirects) using both JavaScript (JS) and PHP calls. Using only three calls: the pre-call, the payment confirmation, and final order processing, payments can be received from M-Pesa, Airtel Money, SinePay eWallet, and all other sources supported by SinePay Core Engine.

A pre-flight call is made by JS as soon as the person clicks on ‘Go to Checkout’ containing bare minimum transaction details as complete details will only be available after order placement. The pre-call returns with codes ready to be used for HTML rendering which will guide on payment making process.

On choosing SinePay as the processor, payment options will be presented, payment should be made as per one of the choices, and confirmation done by the client. A second JS call is then made to verify that the payment was made and if so, some updates are done at the server-side on the first call data. Success or failure messages are instantly returned when the ‘Confirm Payment’ button is pressed.

If the payment was successful, the internal WooCommerce ‘Place Order’ button will be automatically actioned and the final payment confirmation begins. The order details will be posted to the normal order-processing page where they will be captured for all necessary details – including SinePay’s own eShop identification tokens. These will be posted to SinePay servers for processing via PHP. At the server, the records will be re-validated and if correct, updates will be done including the internalization of the transaction as per the SinePay Core Engine (the 8-step transaction logging) automatically. A final ERROR or APPROVED message will then be returned instantly to the calling page. This result will be interpreted by the eShop resident payment gateway codes to either action the page to Success or Failure page. This ends the payment processing process.

Document Control Number: 2020/12/01

== Use of 3rd Party Services ==
i)  Before installation, it is important to know that this plugin relies on third-party services. However, the third-party so mentioned is the SinePay core engine at their severs - the providers of this plugin.
ii) By being a payment processor, just like many of its kind, it must send some transaction details to the third-party server (itself) for token generation and transaction logging.
iii)It is this transfer back and forth of data between your eShop and the SinePay servers that we would like to bring to your attention clearly and plainly.
iv) The main links to SinePay, its terms and conditions, and privacy policy are as listed:
		-- Home Page: https://www.sinepay.net 
		-- Plugin Instruction page: https://sinepay.net/INSTRUCTIONS/payment-gateway-plugin.php
		-- Terms and Conditions: https://www.sinepay.net/tou.php
		-- Privacy: https://www.sinepay.net/privacy.php
v)  Also, as will be seen in the installation instruction section, you will be required to have the SinePay mobile app from Google Play store so as to get the eWallet ID and other credentials;
vi) The data taken from your eShop are strictly the transaction details including buyer contacts for payment-receipt sending as well as other transaction notices;
v)  The above records, the transaction details, are not treated as belonging to SinePay and are never used for any other purposes a part from the notices mentioned;
vi) But the records you use when registering your mobile app or the eShop are treated as per the privacy policy and the terms-of-usage.
vii)The external files referenced by this plugin, due to WordPress policy recommendations, are all include in the plugin directory. However, as already mentioned, external calls will be made to the following links:
		-	public/woocommerce/sipn.php 				;token generation 
		-	public/woocommerce/expresspaycheck.php		;payment confirmation 
		-	woocommerce/sipnexpress.php					;final order confirmation and transaction logging
viii)We hope this clearly puts you in the know about the third-party services included in this plugin.

== Installation ==
1. Upload \"sinepay-gateway\" to the \"/wp-content/plugins/\" directory.
2. Activate the plugin through the \"Plugins\" menu in WordPress.
3. Then proceed on this order below: pre-setup, and then setup

**Pre-setups** 
i)	The eShop first needs to have a SinePay mobile app installed and eWallet ID noted down; get it on Google Play Store;
ii)	The eShop next need to register at www.sinepay.net > sinepay plus > Register Business > Register Online Shop; this will create the necessary credentials to be used here.
iii)	As for now, only the Hash Code is required for eShop Identification by the plugin.
iv)	The username and Merchant Id are used for internal eShop management at SinePay website.
v)	The plugin can now be installed and activated using the Hash Code.
vi)	This will bring the eShop files which will be automatically linked to the activation values
vii)Ensure that your sale currency is set to Kenya Shillings in your eShop; WooCommerce > Settings > General > Currency Options.

**Setups**
i)	After this the plugin needs to be installed; if it is not already installed by uploading its folder to your wp-content/plugins directory;
ii)	First, activate it on WordPress: Plugins > SinePay Payment Gateway for WooCommerce > Activate
iii)Then on WooCommerce as: WooCommerce > Settings > Payments > (SinePay Payment Gateway) > On
iv)	Details should be set via: Manage (above screen, or Setup);
v)	The eShop Hash Code must be given as per the registration’s Hash Code in pre-setups; password can be given but is not used for now.
v)	That’s about it; the eShop is ready for SinePay payment processing; Save the changes.

== Frequently Asked Questions ==
1. Which countries does the plugin support?
    - For now, only Kenya, and/or where else M-Pesa is supported

2. Which currency does it support?
   - Only Kenya Shillings; later it will support USD

3. How do I receive payments?
   - Payments are channeled directly into the eShop SinePay eWallet ID

4. How long does it take for the payment to reflect 
   - As per the SinePay core logic and policy, payments are reflected in real-time but only after the buyer has confirmed the receipt of goods at SinePay Buyer stage 4. Checkout the mobile app for more info.

5. How do I withdraw the money 
   - You can withdraw it to your M-Pesa, Airtel, or Equity Bank accounts; in Kenya. You can also use your eWallet for other purchases.

6. What are the charges related to the plugin usage 
   - The plugin is free to install but payment processing incur some small charges (ranging from a minimum of KES 10/- to a maximum of KES 100/- for transaction lower than KES 100,000/=). Upwards of this attracts KES 100/- plus 0.9% transaction fees.

6. Does the Plugin support Test modes? 
   - No, but for test, just set a product to say KES 1/= and purchase it to your account then confirm your purchases; eShop wallet will have them
   - Or, simply decline all your purchases and SinePay will refund all your money to the originating SinePay account;
   - It is recommended to use your own SinePay wallet account, and not M-Pesa or others, for numerous testing.

== Screenshots ==
1. This is the pre-selection stage on check-out
2. This shows the available payment options
3. This shows specific selection, M-Pesa
4. This shows specific selection, SinePay eWallet

== Changelog ==
Initial release.

== Upgrade Notice ==
No Upgrade notices for now