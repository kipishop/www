(function($){
    // console.log('product');
    var siteLangCode = jQuery('html')[0].lang;
    // console.log(siteLangCode)

    $(document).ready(function() {
        paramsChangeAfterLoad();
        addToCartEvent();
        initSlickSlider();
        wishListEvent();
        removeCookie();
        singleParamAutoClickProductPage();
    });

    // Read URL variables and return them as an associative array.
    function getUrlVars(url){
        var vars = [];
        var hash;
        var hashes = url.slice(url.indexOf('?') + 1).split('&');
        for(var i = 0; i < hashes.length; i++)
        {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    }

    function addToCartEvent() {
        $('.ajax_add_to_cart').on('click',function (event) {
            event.preventDefault(); //prevent woocommerce add to cart event
            event.stopPropagation();
            if($(this).hasClass('disabled')) return false;
            
            // console.log($(this).hasClass('disabled'));

            var addToCartBtn = $(this);

            var params =  getUrlVars($(this).attr('href'));

            paramsForCart = {};
            for (var i = 0; i < productsAttrs.length; i++) { //set variation array to WC cart
                if ( productsAttrs[i].attribute_name == 'colors' || productsAttrs[i].attribute_name == 'sizes' ) {
                    paramsForCart["attribute_pa_" + productsAttrs[i].attribute_name] = decodeURI(params['pa_' + productsAttrs[i].attribute_name]);
                }
            }

            // console.log(paramsForCart)

            // console.log(paramsForCart)

            $.post(ajaxurl, {
                'action': 'woocommerce_add_variation_to_cart',
                "product_id" : params['product_id'],
                "variation_id" : params['variation_id'],
                "quantity" : params['quantity'],
                "variation" : paramsForCart,
                // "variation" : {
                //     "attribute_pa_sizes" : decodeURI(params['pa_sizes']),
                //     "attribute_pa_colors": decodeURI(params['pa_colors'])
                // },
            }, function(response) {
                 var data = {
                   'action': 'update_mini_cart'
                 };
                 $.post(
                    ajaxurl, // The AJAX URL
                    data, // Send our PHP function
                   function(response){
                    //    console.log($(response).filter('.woocommerce-mini-cart li'))
                       $('#mini-cart').html(response); // Repopulate the specific element with the new content
                       var data = {
                        'action': 'update_mini_cart_count'
                      };
                       $.post(ajaxurl, data ,function(response){
                        //    console.log(response);
                           $('.cartSvg .count').html(response);
                           $('.cartSvg').toggleClass('newItem');
                           $('.newItemInCart').addClass('openned');

                           setTimeout(function() {
                               $('.cartSvg').toggleClass('newItem');
                           }, 1500);
                           
                           $('<span class="p-added">מוצר התווסף לסל!</span>').insertAfter(addToCartBtn);
                           setTimeout(function() {
                               $('.p-added').remove();
                           }, 1500);

                           $('.cartSvg').addClass('newItemAdded');
                           setTimeout(function() {
                                $('.cartSvg').removeClass('newItemAdded');
                           }, 1000);

                           $('.cartSvg').trigger('click');
                           removeItemFromMiniCart();
                       });
                   }
                 );

            },'json');
            
        })
    }


    function  paramsChangeAfterLoad(){
        
        $('.params input').change(function(event) {
            var addToCartLink = $(this).parents('.upsale-item, .product-section').find('.ajax_add_to_cart');
            // console.log(addToCartLink)
            var paramsAreSet = 0;
            // var params = $(this).closest('.params').find('select');

            var radio_groups = {}
            $(this).parents('.params').find('input[type="radio"][name*="pa_"]').each(function(){
                radio_groups[this.name] = true;
            });
            
            // console.log(getPropertyCount(radio_groups))

            var params = $(this).parents('.params').find('input[type="radio"][name*="pa_"]:checked');
            // for (var i = 0; i < params.length; i++) {
            //     var element = params[i];
            //     if ($(element).val() != '') {
            //         paramsAreSet++;
            //     }
            // }

            if ($(this).attr('name') == 'pa_colors') {
                // $('.imageCarousel-nav img[data-color-id="' + $(this).attr('id') + '"]').trigger('click'); //slide to relevant image
                // $('.color-warp label').removeClass('active'); //remove all other color active class
                // $('label[for='+ $(this).attr('id') +']').addClass('active'); //add active class to current pressed
                // $(this).parents('.params').find('.current-color-title').html($(this).attr('data-val-name'));

                $('.imageCarousel-nav[data-pid="' + $(this).attr('data-pid') + '"] img[data-color-id="' + $(this).attr('id') + '"]').trigger('click')//slide to image
                $(this).parents('.param-section').find('.color-warp label').removeClass('active');
                $(this).parents('.param-section').find('label[for=' + $(this).attr('id') + ']').addClass('active'); //add active class to current pressed
                $(this).parents('.param-section').find('.current-color-title').html($(this).attr('data-val-name'));

                var newUrl = updateURLParameter(addToCartLink.attr('href'), $($(this)).data('param-name'),$(this).val());

            }else{

                // $('.param-warp').removeClass('active'); //remove all other color active class
                // $('label[for='+ $(this).attr('id') +']').parent('.param-warp').addClass('active'); //add active class to current pressed
                // $(this).parents('.params').find('.current-param-title').html($(this).attr('data-val-name'));

                $(this).parents('.param-section').find('.param-warp').removeClass('active'); //remove all other color active class
                $(this).parents('.param-section').find('label[for=' + $(this).attr('id') + ']').parent('.param-warp').addClass('active'); //add active class to current pressed
                $(this).parents('.param-section').find('.current-param-title').html($(this).attr('data-val-name'));
                
                var newUrl = updateURLParameter(addToCartLink.attr('href'), $($(this)).data('param-name'),$(this).val());

            }
            addToCartLink.attr('href', newUrl );
            // console.log(addToCartLink)
            // console.log(params.length)
            // console.log(getPropertyCount(radio_groups))
            if (params.length == getPropertyCount(radio_groups)) {
                $(addToCartLink).removeClass('disabled');
            }
        });
        $('.desktop-quantity-buttons #minus, .mobile-quantity-buttons #minus').on('click',function(event){
            var val = Number($('.quantity-buttons .quantity').val());
            if (val > 1) {
                $('.quantity').val( Number($('.quantity-buttons .quantity').val()) -1 );
                $('.quantity-buttons .quantity').trigger('change');
            }
        });

        $('.desktop-quantity-buttons #plus, .mobile-quantity-buttons #plus').on('click',function(event){
            $('.quantity').val( Number($('.quantity-buttons .quantity').val()) +1 );
            $('.quantity-buttons .quantity').trigger('change');
        });
        
        $('.quantity').change(function (event) {
            var addToCartLink = $('.ajax_add_to_cart');

            var newUrl = updateURLParameter(addToCartLink.attr('href'), 'quantity', $(this).val());
            addToCartLink.attr('href', newUrl );
        });
    }

    function updateURLParameter(url, param, paramVal){
        var newAdditionalURL = "";
        var tempArray = url.split("?");
        var baseURL = tempArray[0];
        var additionalURL = tempArray[1];
        var temp = "";
        if (additionalURL) {
            tempArray = additionalURL.split("&");
            for (var i=0; i<tempArray.length; i++){
                if(tempArray[i].split('=')[0] != param){
                    newAdditionalURL += temp + tempArray[i];
                    temp = "&";
                }
            }
        }
    
        var rows_txt = temp + "" + param + "=" + paramVal;
        return baseURL + "?" + newAdditionalURL + rows_txt;
    }

    function getPropertyCount(obj) {
        var count = 0,
            key;
    
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                count++;
            }
        }
    
        return count;
    }

    function wishListEvent(){
        $('.wishlist-link').on('click',function(event){
            event.preventDefault();
            // console.log($(this).data('pid'))
            var wishlistHREF = $(this);
            var pid = $(this).data('pid');
            var toRemove = false;
            var toAdd = false;
            // console.log($(this))
            if ($(this).hasClass('inWishlist')) {
                data = {
                    'action': 'wishList',
                    'remove': pid,
                }
                toRemove = true;
            }else{
                data = {
                    'action': 'wishList',
                    'add': pid,             
                }
                toAdd = true;
            }
            
            $.post(ajaxurl, data, function(response) {
                // console.log(response)
                if ( response.not_user ) {
                    // $('body').append(response.alert);
                    $.magnificPopup.open({
                        mainClass: 'mfp-fade',
                        items: {
                            src: '#wishlist_not_user'
                        },
                        type:'inline',
                        midClick: true 
                    });
                } else {
                    if (toAdd) {
                        $(wishlistHREF).addClass('inWishlist');
                    }else if(toRemove){
                        $(wishlistHREF).removeClass('inWishlist');
                    }
                    $('body').append(response);
                }
            },'json');
        });
    }

    function removeCookie(){
        delete_cookie('wishlistFrom');
        delete_cookie('wishlistToAdd');
    }
    
    function delete_cookie( name ) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    }
    
    function initSlickSlider(){
        $('.imageCarousel').slick({
            arrows: false,
            dots: true,
            infinite: false,
            slidesToShow: 1,
            slidesToScroll: 1,
            rtl : siteLangCode == 'he-IL' ? true : false,
            adaptiveHeight: false,
            autoplay: false,
            autoplaySpeed: 3000,
            draggable: true,
            mobileFirst: false,
            pauseOnHover: false,
            pauseOnDotsHover: false,
            swipe: false,
            fade: false,
            touchMove: true,
            touchThreshold: 5,
            responsive: [
                {
                  breakpoint: 600,
                  settings: {
                    swipe: true,
                  }
                }
            ]
        });

        // $('.related-carousel').slick({
        //     arrows: false,
        //     dots: true,
        //     infinite: true,
        //     slidesToShow: 2,
        //     slidesToScroll: 2,
        //     rtl :  false,
        //     adaptiveHeight: false,
        //     autoplay: false,
        //     autoplaySpeed: 3000,
        //     draggable: true,
        //     mobileFirst: true,
        //     swipe: false,
        //     fade: true,
        //     touchMove: true,
        //     touchThreshold: 2
        // });
        
        function textsCarousel() {
            'use strict';
            $('#devTest').slick({
                arrows: false,
                dots: true,
                infinite: true,
                slidesToShow: 1,
                slidesToScroll: 1,
                // rtl: siteLangCode == 'he-IL' ? true : false,
                rtl: false,
                adaptiveHeight: true,
                autoplay: true,
                autoplaySpeed: 3000,
                draggable: true,
                mobileFirst: true,
                pauseOnHover: false,
                pauseOnDotsHover: false,
                swipe: true,
                touchMove: true,
                touchThreshold: 5
            });
        }
        
        $('.imageCarousel-nav').slick({
            arrows: false,
            infinite: false,
            draggable: true,
            slidesToShow: 5,
            slidesToScroll: 1,
            asNavFor: '.imageCarousel',
            dots: false,
            centerMode: false,
            vertical: true,
            focusOnSelect: true
         });
        //  prevSlide = jQuery('.imageCarousel .slick-slide.slick-current.slick-active');
        if ($(window).width() >= 1023) {
            $('.imageCarousel .slick-slide').zoom();
        }else{
            if ($('.imageCarousel .slick-dots li').length == 1) {
                $('.imageCarousel .slick-dots').addClass('dn');
            }
        }
    }


    function singleParamAutoClickProductPage() {

        let productParams = $('.product-section .params')
        let productParamSections = $('.param-section', productParams);
        let sectionHasMultiplyItems = false;

        productParamSections.each(function (j) {
            let sectionParamItems = $('input.item-param', $(this));
            sectionHasMultiplyItems = (sectionParamItems.length > 1) ? true : false;
//            if (!sectionHasMultiplyItems && $(sectionParamItems).length > 0) {
            if ($(sectionParamItems).length > 0) {
                // console.log(sectionParamItems)
                // $(sectionParamItems).trigger('click');
                $('#' + $(sectionParamItems).attr('id')).trigger('click')
            }
        });
    }

})( jQuery );