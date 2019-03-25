(function($){  
    var siteLangCode = jQuery('html')[0].lang;

    $(document).ready(function() {
        addToCartEvent();
        paramsChangeAfterLoad();
        slickSliderInit();
        wishListEvent();
        removeCookie();
        $('.equalHeight').equalHeights();
        initSlickSlider();
    });

    function addToCartEvent() {
        $('.ajax_add_to_cart').on('click',function (event) {
            event.preventDefault(); //prevent woocommerce add to cart event
            event.stopPropagation();
            if($(this).hasClass('disabled')) return false;
            

            var addToCartBtn = $(this);

            var params =  getUrlVars($(this).attr('href'));

            paramsForCart = {};
            for (var i = 0; i < productsAttrs.length; i++) { //set variation array to WC cart
                if ( productsAttrs[i].attribute_name == 'colors' || productsAttrs[i].attribute_name == 'sizes' ) {
                    paramsForCart["attribute_pa_" + productsAttrs[i].attribute_name] = decodeURI(params['pa_' + productsAttrs[i].attribute_name]);
                }
            }

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
                            if (response > 0) {
                                $('.cartSvg').addClass('notEmpty');
                            }
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

                            removeItemFromMiniCart(); //add the remove event for the new item - main.js
                        });
                    }
                    );

            },'json');
            
        })
    }

    function  paramsChangeAfterLoad(){
        $('.type-product .params input').change(function(event) {
            var addToCartLink = $(this).parents('.post-'+ $(this).attr('data-pid')).find('.ajax_add_to_cart');

            var paramsAreSet = 0;
            // var params = $(this).closest('.params').find('select');

            var radio_groups = {}
            $(this).parents('.params').find('input[type="radio"][name*="pa_"]').each(function(){
                radio_groups[this.name] = true;
            })
            // console.log(getPropertyCount(radio_groups))

            var params =  $(this).parents('.params').find('input[type="radio"][name*="pa_"]:checked');
            // for (var i = 0; i < params.length; i++) {
            //     var element = params[i];
            //     if ($(element).val() != '') {
            //         paramsAreSet++;
            //     }
            // }
            // console.log($(this).parents('.param-section').find('input[type="radio"][name*="pa_"]'))
            // console.log($(this).attr('id'))
            // console.log($(this).parents('.param-section'))

            if ($(this).attr('name') == 'pa_colors') {
                $('.imageCarousel-nav[data-pid="' + $(this).attr('data-pid') + '"] img[data-color-id="' + $(this).attr('id') + '"]').trigger('click')//slide to image
                $(this).parents('.param-section').find('.color-warp label').removeClass('active');
                $(this).parents('.param-section').find('label[for='+ $(this).attr('id') +']').addClass('active'); //add active class to current pressed
                $(this).parents('.param-section').find('.current-color-title').html($(this).attr('data-val-name'));
                var newUrl = updateURLParameter(addToCartLink.attr('href'), $($(this)).data('param-name'),$(this).val());

            }else{
                // console.log($(this).attr('id'))
                $(this).parents('.param-section').find('.param-warp').removeClass('active'); //remove all other color active class
                $(this).parents('.param-section').find('label[for='+ $(this).attr('id') +']').parent('.param-warp').addClass('active'); //add active class to current pressed
                $(this).parents('.param-section').find('.current-param-title').html($(this).attr('data-val-name'));
                var newUrl = updateURLParameter(addToCartLink.attr('href'), $($(this)).data('param-name'),$(this).val());
            }
            addToCartLink.attr('href', newUrl );
            // console.log(params.length )
            // console.log(radio_groups)
            // console.log(getPropertyCount(radio_groups))
            if (params.length == getPropertyCount(radio_groups)) {
                $(addToCartLink).removeClass('disabled');
            }
        });
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

    function slickSliderInit() {
        $('.header-slider').slick({
            arrows: false,
            dots: true,
            infinite: true,
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
            fade: true,
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
    }

    function initSlickSlider() {

        $('.imageCarousel').each(function () {

            $('.imageCarousel[data-pid="' + $(this).attr('data-pid') + '"]').slick({
                arrows: false,
                dots: false,
                infinite: true,
                slidesToShow: 1,
                slidesToScroll: 1,
                rtl: siteLangCode == 'he-IL' ? true : false,
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

            $('.imageCarousel-nav[data-pid="' + $(this).attr('data-pid') + '"]').slick({
                arrows: false,
                infinite: false,
                draggable: true,
                slidesToShow: 5,
                slidesToScroll: 1,
                asNavFor: '.imageCarousel[data-pid= "' + $(this).attr('data-pid') + '"]',
                dots: false,
                centerMode: false,
                vertical: true,
                focusOnSelect: true
            });
        });
    }

})( jQuery );