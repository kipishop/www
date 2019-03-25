(function ($) {

    var get_url = function (endpoint) {
        return wc_cart_params.wc_ajax_url.toString().replace(
            '%%endpoint%%',
            endpoint
        );
    };

    $(document).ready(function () {
        quantityEvent();
        addPopUps();
        removeCookie();
        checkoutSubmitEvent();
        $('#billing_notes').attr('maxlength', 100);
    });

    function removeCookie() {
        if (getCookie('wishlistFrom') && getCookie('wishlistToAdd')) {
            delete_cookie('wishlistFrom');
            delete_cookie('wishlistToAdd');
        }
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
    function quantityEvent() {
        var item_hash, item_quantity, currentVal;
        // console.log('quantityEvent')
        $('.minus').on('click', function (event) {
            // console.log('minus')
            var val = Number($(this).parents('.quantity-buttons').find('.quantity input[type=number]').val());
            // console.log(val)
            if (val > 1) {
                $(this).parents('.quantity-buttons').find('.quantity input[type=number]').val(Number(val) - 1);
                $(this).parents('.quantity-buttons').find('.quantity input[type=number]').trigger('change');
            }

            item_hash = $(this).parents('.quantity-buttons').find('.quantity input[type=number]').attr('name').replace(/cart\[([\w]+)\]\[qty\]/g, "$1");
            item_quantity = $(this).parents('.quantity-buttons').find('.quantity input[type=number]').val();
            currentVal = parseFloat(item_quantity);

        });

        $('.plus').on('click', function (event) {
            // console.log('plus')
            var val = Number($(this).parents('.quantity-buttons').find('.quantity input[type=number]').val());
            // console.log(val)
            $(this).parents('.quantity-buttons').find('.quantity input[type=number]').val(Number(val) + 1);
            $(this).parents('.quantity-buttons').find('.quantity input[type=number]').trigger('change');

            item_hash = $(this).parents('.quantity-buttons').find('.quantity input[type=number]').attr('name').replace(/cart\[([\w]+)\]\[qty\]/g, "$1");
            item_quantity = $(this).parents('.quantity-buttons').find('.quantity input[type=number]').val();
            currentVal = parseFloat(item_quantity);

        });

        $('input.qty').on('change', function () {
            // console.log('input.qty change')
            item_hash = $(this).parents('.quantity-buttons').find('.quantity input[type=number]').attr('name').replace(/cart\[([\w]+)\]\[qty\]/g, "$1");
            item_quantity = $(this).parents('.quantity-buttons').find('.quantity input[type=number]').val();
            currentVal = parseFloat(item_quantity);

            qty_cart(item_hash, item_quantity, currentVal);
        });

        $('td.product-remove a').on('click', function (event) {
            event.preventDefault(); //prevent woocommerce add to cart event
            event.stopPropagation();

            item_hash = $(this).parents('.woocommerce-cart-form__cart-item').find('.quantity input[type=number]').attr('name').replace(/cart\[([\w]+)\]\[qty\]/g, "$1");
            item_quantity = $(this).parents('.woocommerce-cart-form__cart-item').find('.quantity input[type=number]').val();
            currentVal = parseFloat(0);

            qty_cart(item_hash, item_quantity, currentVal);

        });

        $('input.button[name=update_cart]').on('click', function () {
            setTimeout(function () {
                quantityEvent();
            }, 1500);
        });

        $('input.button[name=apply_coupon]').on('click', function (event) {
            event.preventDefault(); //prevent woocommerce add to cart event
            event.stopPropagation();

            var $text_field = $('#coupon_code');
            var coupon_code = $text_field.val();

            var data = {
                security: wc_cart_params.apply_coupon_nonce,
                coupon_code: coupon_code
            };

            $.ajax({
                type: 'POST',
                url: get_url('apply_coupon'),
                data: data,
                dataType: 'html',
                success: function (response) {
                    $('.woocommerce-error, .woocommerce-message, .woocommerce-info').remove();
                    $('.woocommerce-cart-form').before(response);
                    if ($(response).filter("ul.woocommerce-error").length) { //error applying coupon
                        $('html, body').animate({
                            scrollTop: ($('.woocommerce-error').offset().top - $('.headerFixed').outerHeight())
                        }, 1000)
                    }
                    // console.log($(".woocommerce-error", response).prevObject)
                    // show_notice( response );
                },
                complete: function () {
                    $text_field.val('');
                    $.ajax({
                        type: 'POST',
                        url: ajax_url,
                        data: {
                            action: 'get_cart',
                        },
                        success: function (data) {
                            $('.cart-collaterals').empty();
                            $('.cart-collaterals').append($(data).find('.cart-collaterals').html());
                            quantityEvent();
                            // $( '.cart-collaterals' ).html($(data).find('.cart-collaterals .cart_totals.calculated_shipping'));
                        }
                    });
                }
            });
        });

        $('.woocommerce-remove-coupon').on('click', function (event) {
            event.preventDefault(); //prevent woocommerce add to cart event
            event.stopPropagation();

            var coupon = $(this).attr('data-coupon');

            var data = {
                security: wc_cart_params.remove_coupon_nonce,
                coupon: coupon
            };

            $.ajax({
                type: 'POST',
                url: get_url('remove_coupon'),
                data: data,
                dataType: 'html',
                success: function (response) {
                    $('.woocommerce-error, .woocommerce-message, .woocommerce-info').remove();
                    $('.woocommerce-cart-form').before(response);
                },
                complete: function () {
                    $.ajax({
                        type: 'POST',
                        url: ajax_url,
                        data: {
                            action: 'get_cart',
                            hash: item_hash,
                        },
                        success: function (data) {
                            $('.cart-collaterals').empty();
                            $('.cart-collaterals').append($(data).find('.cart-collaterals').html());
                            quantityEvent();
                            // $( '.cart-collaterals' ).html($(data).find('.cart-collaterals .cart_totals.calculated_shipping'));
                        }
                    });
                }
            });

        });

        $('select.shipping_method').on('change', function (event) {
            event.preventDefault(); //prevent woocommerce add to cart event
            event.stopPropagation();

            var shipping_methods = {};

            $('select.shipping_method option:selected').each(function () {
                shipping_methods[$(this).data('index')] = $(this).val();
            });
            var data = {
                security: wc_cart_params.update_shipping_method_nonce,
                shipping_method: shipping_methods
            };
            // console.log(data);
            $.ajax({
                type: 'post',
                url: get_url('update_shipping_method'),
                data: data,
                dataType: 'html',
                success: function (response) {
                    // console.log(response)
                    $('.cart-collaterals').empty();
                    // $('.cart-collaterals').append($(response).find('.cart-collaterals .cart_totals.calculated_shipping'));
                    $('.cart-collaterals').append(response);
                    quantityEvent();
                }
            });
        });
    }

    function qty_cart(item_hash, item_quantity, currentVal) {
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
                console.log(data);
                $('.woocommerce .cart-content').empty();
                $('.woocommerce .cart-content').html($(data).find('.cart-content').html());
                quantityEvent();
                getMiniCart();
                // $( '.cart-collaterals' ).html($(data).find('.cart-collaterals .cart_totals.calculated_shipping'));
            }
        });
    }

    function addPopUps() {
        $('.showlogin').on('click', function (event) {
            event.preventDefault(); //prevent woocommerce add to cart event
            event.stopPropagation();
            $('#register form').css('cssText', 'display: block;');
            $('#register').css('cssText', 'display: block;');
            $.magnificPopup.open({
                mainClass: 'mfp-fade',
                items: {
                    src: '#register'
                },
                type: 'inline',
                midClick: true
            });
        });
    }

    function checkoutSubmitEvent() {
        $('.checkout').on('submit', function (event) {
            setTimeout(function () { //wait for woocommerce to return errors if there are any
                if ($('.woocommerce-error').length > 0) {
                    $('html, body').animate({
                        scrollTop: ($('.woocommerce-error').offset().top - 150)
                    }, 500);
                }
            }, 1000);
        });
    }

    function update_checkout_action(args) {
        if (wc_checkout_form.xhr) {
            wc_checkout_form.xhr.abort();
        }

        if ($('form.checkout').length === 0) {
            return;
        }

        args = typeof args !== 'undefined' ? args : {
            update_shipping_method: true
        };

        var country = $('#billing_country').val(),
            state = $('#billing_state').val(),
            postcode = $('input#billing_postcode').val(),
            city = $('#billing_city').val(),
            address = $('input#billing_address_1').val(),
            address_2 = $('input#billing_address_2').val(),
            s_country = country,
            s_state = state,
            s_postcode = postcode,
            s_city = city,
            s_address = address,
            s_address_2 = address_2,
            $required_inputs = $(wc_checkout_form.$checkout_form).find('.address-field.validate-required:visible'),
            has_full_address = true;

        if ($required_inputs.length) {
            $required_inputs.each(function () {
                if ($(this).find(':input').val() === '') {
                    has_full_address = false;
                }
            });
        }

        if ($('#ship-to-different-address').find('input').is(':checked')) {
            s_country = $('#shipping_country').val();
            s_state = $('#shipping_state').val();
            s_postcode = $('input#shipping_postcode').val();
            s_city = $('#shipping_city').val();
            s_address = $('input#shipping_address_1').val();
            s_address_2 = $('input#shipping_address_2').val();
        }

        var data = {
            security: wc_checkout_params.update_order_review_nonce,
            payment_method: wc_checkout_form.get_payment_method(),
            country: country,
            state: state,
            postcode: postcode,
            city: city,
            address: address,
            address_2: address_2,
            s_country: s_country,
            s_state: s_state,
            s_postcode: s_postcode,
            s_city: s_city,
            s_address: s_address,
            s_address_2: s_address_2,
            has_full_address: has_full_address,
            post_data: $('form.checkout').serialize()
        };

        if (false !== args.update_shipping_method) {
            var shipping_methods = {};

            $('select.shipping_method, input[name^="shipping_method"][type="radio"]:checked, input[name^="shipping_method"][type="hidden"]').each(function () {
                shipping_methods[$(this).data('index')] = $(this).val();
            });

            data.shipping_method = shipping_methods;
        }

        $('.woocommerce-checkout-payment, .woocommerce-checkout-review-order-table').block({
            message: null,
            overlayCSS: {
                background: '#fff',
                opacity: 0.6
            }
        });

        wc_checkout_form.xhr = $.ajax({
            type: 'POST',
            url: wc_checkout_params.wc_ajax_url.toString().replace('%%endpoint%%', 'update_order_review'),
            data: data,
            success: function (data) {

                var selectedPaymentMethod = $('.woocommerce-checkout input[name="payment_method"]:checked').attr('id');

                // Reload the page if requested
                if (true === data.reload) {
                    window.location.reload();
                    return;
                }

                // Remove any notices added previously
                $('.woocommerce-NoticeGroup-updateOrderReview').remove();

                var termsCheckBoxChecked = $('#terms').prop('checked');

                // Save payment details to a temporary object
                var paymentDetails = {};
                $('.payment_box input').each(function () {
                    var ID = $(this).attr('id');

                    if (ID) {
                        if ($.inArray($(this).attr('type'), ['checkbox', 'radio']) !== -1) {
                            paymentDetails[ID] = $(this).prop('checked');
                        } else {
                            paymentDetails[ID] = $(this).val();
                        }
                    }
                });

                // Always update the fragments
                if (data && data.fragments) {
                    $.each(data.fragments, function (key, value) {
                        $(key).replaceWith(value);
                        $(key).unblock();
                    });
                }

                // Recheck the terms and conditions box, if needed
                if (termsCheckBoxChecked) {
                    $('#terms').prop('checked', true);
                }

                // Fill in the payment details if possible without overwriting data if set.
                if (!$.isEmptyObject(paymentDetails)) {
                    $('.payment_box input').each(function () {
                        var ID = $(this).attr('id');

                        if (ID) {
                            if ($.inArray($(this).attr('type'), ['checkbox', 'radio']) !== -1) {
                                $(this).prop('checked', paymentDetails[ID]).change();
                            } else if (0 === $(this).val().length) {
                                $(this).val(paymentDetails[ID]).change();
                            }
                        }
                    });
                }

                // Check for error
                if ('failure' === data.result) {

                    var $form = $('form.checkout');

                    // Remove notices from all sources
                    $('.woocommerce-error, .woocommerce-message').remove();

                    // Add new errors returned by this event
                    if (data.messages) {
                        $form.prepend('<div class="woocommerce-NoticeGroup woocommerce-NoticeGroup-updateOrderReview">' + data.messages + '</div>');
                    } else {
                        $form.prepend(data);
                    }

                    // Lose focus for all fields
                    $form.find('.input-text, select, input:checkbox').trigger('validate').blur();

                    // Scroll to top
                    $('html, body').animate({
                        scrollTop: ($('form.checkout').offset().top - 100)
                    }, 1000);

                }

                // Re-init methods
                wc_checkout_form.init_payment_methods(selectedPaymentMethod);

                // Fire updated_checkout event.
                $(document.body).trigger('updated_checkout', [data]);
            }

        });
    }

})(jQuery);
