/**
 * @category  Crankycyclops
 * @package   Crankycyclops_AddToCartModal
 * @author    James Colannino
 * @copyright Copyright (c) 2018 James Colannino
 * @license   https://opensource.org/licenses/OSL-3.0 OSL v3
 */

define([
    'jquery',
	'jquery-ui-modules/dialog'
], function ($) {

	'use strict';

	return function (config, element) {

		// Populates the dialog with the correct product data
		function updateModalData(data) {

			let selectedSwatch = $('.swatch-option.selected');

			// By default, assume we're working with an ordinary simple product
			let product = config;

			// If we have swatches, that means this is a configurable product
			// and that we need to display data relevant to the chosen option.
			// TODO: support non-swatch configurable product, too
			if (selectedSwatch.length > 0) {

				let swatchOptionParams = /option-label-format\-(\d+)\-item\-(\d+)/.exec(selectedSwatch.attr('id'));
				let option = config['options'][swatchOptionParams[1]]['options'][swatchOptionParams[2]];

				product = option['product'];

				$('#add-to-cart-modal .selected-option-value').text(option.label);
				$('#add-to-cart-modal .selected-option-value').show();
			}

			$('#add-to-cart-modal .name').text(config.product_name);
			$('#add-to-cart-modal .product-details-wrapper .sku').text(config.sku);
			$('#add-to-cart-modal .product-details-wrapper .price').text('$' + product.price);
			$('.product-image').html(product.image ? '<img src="' + product.image + '" />' : '');
		}

		/*********************************************************************/

		let popup = $('#add-to-cart-modal').modal({
			modalClass: 'add-to-cart-modal',
			buttons: {}
		});

		$('#add-to-cart-modal .continue-shopping').on('click', function (e) {
			popup.modal('closeModal');
		});

		// Proceed to checkout
		$('#add-to-cart-modal .checkout').on('click', function (e) {
			window.location = window.checkout.checkoutUrl;
		});

		/* The logic here is a little convoluted, so I think it warrants a
		   decent sized comment. I can't just listen for ajax:addToCart, because
		   sometimes that event fires even when the add to cart ultimately fails
		   (for example, when you've reached the quantity limit of an item.)
		   You would think, then, that I should listen to
		   $('[data-block="minicart"]').on('contentUpdated', but again, there's
		   a problem, because this event fires not only when you add a product
		   to your cart, but also when you delete items from your cart.

		   What to do?

		   There might be a better way for me to handle this (God knows I've
		   written my fair share of bad code), but the way I figured out of this
		   is to let the minicart's contentUpdated event send a signal every
		   time the cart is updated successfully. Meanwhile, I listen on
		   ajax:addToCart, and when that event fires, I wait until a successful
		   cart update is signaled before opening the dialog. */

		let cartUpdated = false;

		// Every time we initiate a new operation on the cart, reset cartUpdated
		// so that we won't mistake a more current operation for a previously
		// successful one.
		$('[data-block="minicart"]').on('contentLoading', function (e) {
			cartUpdated = false;
		});

		// Yay!
		$('[data-block="minicart"]').on('contentUpdated', function (e) {
			cartUpdated = true;
		});

		// Open the modal when the user adds a product to their cart.
		$(document).on('ajax:addToCart', function (e, productData) {

			let timeout = 100;

			setTimeout(function waitUntilCartUpdated() {

				// The cart was successfully updated after the "Add to Cart"
				// button was clicked, so it's now safe to open the dialog.
				if (cartUpdated) {
					updateModalData(productData);
					popup.modal('openModal');
				}

				// I don't want the possibility of a setTimeout that refreshes
				// perpetually, so give up after a certain number of tries.
				else if (timeout) {
					timeout--;
					setTimeout(waitUntilCartUpdated, 200);
				}
			}, 200);
		});
	}
});

