jQuery(document).ready(function ($) {

	firstAjaxPing()

	removeItemFromMiniCart();
	mobileAddToCart();

	newsletterPopUp();

	sharePopUps();

	mobileSubMenu();
	$(window).resize(function () {
		mobileSubMenu();
	})

	$(window).resize(function () {
		subProductsTitles();
		fixElementsHeight();
	});
	fixElementsHeight();

	setTimeout(() => {
		if ($('body').hasClass('single-product')) {
			singleParamAutoClick('.related-section');
		} else {
			singleParamAutoClick();
		}
	}, 500);


	$('.burger ,.nav-background').on('click', function () {
		$('.burger, #site-navigation, .nav-background').toggleClass('open');
	});

	$('.cartSvg').on('click', function (event) {
		$('#site-header-cart').toggleClass('miniCartDisplay');
		$('.mini-cart-background').toggleClass('active');
	});

	$('.mini-cart-background').on('click', function (event) {
		$('#site-header-cart').toggleClass('miniCartDisplay');
		$('.mini-cart-background').toggleClass('active');
	});

	$('.cartSvg').on('click', function (event) {
		if ($(window).width() <= 1023 && !$(this).hasClass('newItemAdded')) { //mobile & tablet
			window.location.href = cart_page;
		}
	});

	$('.ajax_add_to_cart').click(function (event) {
		if ($(this).hasClass('disabled')) return false;
		// event.preventDefault();
		$('.cartSvg').toggleClass('newItem');
		$('.cartSvg .count').html(Number($('.cartSvg .count').html()) + 1);

	});


	$('.search-icon, .input-wrapper.search svg').on('click', function (event) {
		$('.search-form-header').toggleClass('dn');
		$('body').toggleClass('noscroll');
		if (!$('.search-form-header').hasClass('dn')) {
			$('#form_search').trigger('focus');
		}
	});

	$(document).keyup(function (e) {
		if (e.keyCode == 27 && $('body').hasClass('noscroll')) { // escape key maps to keycode `27`
			$('.search-icon').trigger('click');
		}
	});

	$('#form_search').on('keyup', function () {
		// var searchStr = $(this).val().split(" ");
		// console.log($(this).val().length)
		if ($(this).val().length >= 3) {
			var data = {
				'action': 'autocomplete',
				'search_str': $(this).val().split(" ")
			};
			$.post(ajaxurl, data, function (response) {
				// console.log(response);
				$('.autoCompleteResponse').empty();
				if (response != '0') {
					$('.autoCompleteResponse').html(response);
				} else {
					$('.autoCompleteResponse').html('<div class="noresult">לא נמצאו תוצאות!</div>');
				}
			});
		} else {
			$('.autoCompleteResponse').empty();
		}
	});

	$('.search-form form').on('submit', function (event) { //for now
		event.preventDefault();
	});

	if (Number($('.cartSvg .count').html()) > 0) {
		$('.cartSvg').addClass('notEmpty');
	}
});

$ = jQuery;

function firstAjaxPing() {
	if (!getCookie('pingReq')) {
		var data = { 'action': 'first_ajax_ping' }

		$.post(ajaxurl, data, function (res) {
			console.log(res);
			setCookie('pingReq', true);
		})
	}
}

function mobileSubMenu() {
	if ($(window).width() > 1023) {
		$('#top-menu li.menu-item-has-children .sub-menu').css('cssText', 'height: ');
		$('.submenuOpener').remove();
		return
	}

	var subMenus = $('#top-menu li.menu-item-has-children');

	for (let i = 0; i < subMenus.length; i++) {
		const subMenu = subMenus[i];
		var subMenuLis = $(subMenu).find('.sub-menu li');
		var subMenuH = 0;
		for (let j = 0; j < subMenuLis.length; j++) {
			const subMenuLi = subMenuLis[j];
			subMenuH += $(subMenuLi).outerHeight(true);

		}

		$(subMenu).find('.sub-menu').attr('open-height', subMenuH);
		$(subMenu).find('.sub-menu').addClass('init')
	}

	$('#top-menu li.menu-item-has-children .submenuOpener').remove();
	$('#top-menu li.menu-item-has-children').append('<div class="submenuOpener"><span class="plus left"></span></div>');

	$('#top-menu li.menu-item-has-children .submenuOpener').on('click', function () {

		var subMenuHeight = $(this).prev().attr('open-height');

		$(this).prev().toggleClass('open'); //closest #top-menu li.menu-item-has-children .sub-menu

		if ($(this).prev().hasClass('open')) { //closest #top-menu li.menu-item-has-children .sub-menu
			$(this).prev().css('cssText', 'height: ' + subMenuHeight + 'px');
		} else {
			$(this).prev().css('cssText', 'height: 0');
		}

		$(this).find('.plus').toggleClass('open');
	});
}

function fixElementsHeight() {
	$('.search-form-header').css('cssText', 'top:' + $('.headerFixed').outerHeight() + 'px');
	$('#site-header-cart').css('cssText', 'top:' + $('.headerFixed').outerHeight() + 'px');

	if ($(window).width() <= 1023 && $('.saleBar').length) { //tablet mobile
		$('#site-navigation').css('cssText', 'top:-' + $('.saleBar').outerHeight() + 'px');
	}
}

function removeItemFromMiniCart() {
	$('a.remove-cart-item').off('click'); //remove multiply events

	$('a.remove-cart-item').on('click', function (event) {
		event.preventDefault(); //prevent woocommerce add to cart event
		event.stopPropagation();

		item_hash = $(this).parent().find('.quantity input[type=number]').attr('name').replace(/cart\[([\w]+)\]\[qty\]/g, "$1");
		item_quantity = $(this).parent().find('.quantity input[type=number]').val();
		currentVal = parseFloat(0);

		main_qty_cart(item_hash, item_quantity, currentVal, $(this));

	});
}


function main_qty_cart(item_hash, item_quantity, currentVal, currentElement) {
	// console.log('qty_cart')
	$.ajax({
		type: 'POST',
		url: ajax_url,
		data: {
			action: 'qty_cart',
			hash: item_hash,
			quantity: currentVal
		},
		success: function (data) {
			$(currentElement).parents('.mini_cart_item').remove();
			getMiniCart();
			// $('.woocommerce .cart-page').empty();
			// $('.woocommerce .cart-page').html($(data).find('.cart-page').html());
			// quantityEvent();
			// $( '.cart-collaterals' ).html($(data).find('.cart-collaterals .cart_totals.calculated_shipping'));
		}
	});
}


function getMiniCart() {
	var data = {
		'action': 'update_mini_cart'
	};
	$.post(
		ajaxurl, // The AJAX URL
		data, // Send our PHP function
		function (response) {
			console.log('asdf')
			//    console.log($(response).filter('.woocommerce-mini-cart li'))
			$('#mini-cart').html(response); // Repopulate the specific element with the new content
			var data = {
				'action': 'update_mini_cart_count'
			};
			$.post(ajaxurl, data, function (response) {
				console.log(response);
				$('.cartSvg .count').html(response);
				if (response > 0) {
					$('.cartSvg').addClass('notEmpty');
				} else {
					$('.cartSvg').removeClass('notEmpty');
				}

				// removeItemFromMiniCart(); //add the remove event for the new item - main.js
			});
		}
	);
}

function subProductsTitles() {
	if ($(window).width() <= 640) { //mobile only
		$(".p-title").each(function (index) {
			// console.log( index + ": " + $( this ).text() );
			// console.log($( this ).text().length)
			if ($(this).text().length > 36) { //breaks line
				var text = $(this).text();
				$(this).text(text.substring(0, 33) + '...');
			}
		});
	}
}


function mobileAddToCart() {
	// console.log('mobileAddToCart')
	$('.newItemInCart .close-button').on('click', function (event) {
		$('.newItemInCart').removeClass('openned');
	});
}

function newsletterPopUp() {
	if (!getCookie('firsttime')) {
		if (window.innerWidth > 1025 && $('#newsletter_form').length) {
			setTimeout(function () {
				$.magnificPopup.open({
					mainClass: 'mfp-fade',
					items: {
						src: '#newsletter_form'
					},
					type: 'inline',
					midClick: true
				});
			}, 1000);
		}
		setCookie('firsttime', true);
	}

	// newsletter popup
	$('.open-popup-link').magnificPopup({
		type: 'inline',
		midClick: true,
		mainClass: 'mfp-fade'
	});
}


// cookie by session..
function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	document.cookie = cname + "=" + cvalue + ";" + 'expires=""' + ";path=/";
}
function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}

function sharePopUps() {
	$('.shareIcons .facebook, .shareIcons .twitter').click(function (e) {
		e.preventDefault();
		window.open($(this).attr('href'), 'fbShareWindow', 'height=450, width=550, top=' + ($(window).height() / 2 - 275) + ', left=' + ($(window).width() / 2 - 225) + ', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0');
		return false;
	});
}


function singleParamAutoClick(selector = '.product') {

	// var disabledBtns = $(selector + ' .disabled.ajax_add_to_cart:not([data-checked=true]'); //selector "not" is not working on iOS
	var disabledBtns = $(selector + ' .disabled.ajax_add_to_cart[data-checked=false]');
	disabledBtns.each(function (i) {


		$(this).attr('data-checked', 'true');
		let productParams = $(this).prev('.params');
		let productParamSections = $('.param-section', productParams);
		let sectionHasMultiplyItems = false;

		productParamSections.each(function (j) {
			let sectionParamItems = $('input.item-param', $(this));
			sectionHasMultiplyItems = (sectionParamItems.length > 1) ? true : false;
			if (!sectionHasMultiplyItems && $(sectionParamItems).length > 0) {
				// console.log(productParams)
				// console.log(productParamSections)
				// console.log(sectionHasMultiplyItems)
				// console.log(sectionParamItems)
				// $(sectionParamItems).trigger('click');
				$('#' + $(sectionParamItems).attr('id')).trigger('click')
			}
		});
	});
}