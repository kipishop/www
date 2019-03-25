(function($){
  isSorting = false;
  terms = [];
  categories = {};
  colors = {};
  sizes = {};
  filters = {};
  targetSlug = '';
  pName = '';
  loaded = false;
  categoryPressed = false;
  termName = {};
  targetName = '';
  offset = 0;
  page = 1;
  filterParams = {};
  categoriesForInfintyScroll = {};
  filtersForInfintyScroll = {};
  termssForInfintyScroll = {};
  var siteLangCode = jQuery('html')[0].lang;
  console.log('first init');
  $(document).ready(function() {
    ajax_gif_loader('on');
    initCategory();
    initRangeFilter(minPrice, maxPrice, getUrlParameter('min_price'), getUrlParameter('max_price'));
    removeCookie();
    filterBtnMobile();
    menuBtnMobile();
    mobileAddToCart();
  });

/*******************************************************************
* Buttons functionality
********************************************************************/
        function filterBtnMobile(){
            $('.filterBtn, .side-menu-filter-background, .sortCloseBtn, .submitFilters').on('click',function (event) {
                openCloseFiterMenu();
            });
            $('.main-menu-link').on('click',function(event){
                if ( $('.side-filter-menu').hasClass('open')) {
                    openCloseFiterMenu();
                }
            });
        }
        function menuBtnMobile(){
           if ($(window).width() <= 640) { //mobile
                $('.mobileCatNav').html($('.categories'));
                $('.navBtn').on('click',function(event) {
                    $('.mobileCatNav').toggleClass('active');
                    $('body').toggleClass('noscroll');
                })
           }
        }
        function openCloseFiterMenu() {
                $('body').toggleClass('noscroll');
                $('.footer-containter').toggleClass('dn');
                $('.catsThumbs').css('cssText','top:'+ $('.catsThumbs').offset().top +'px!important;' );

                $('.side-filter-menu').toggleClass('open');
                $('.side-menu-filter-background').toggleClass('open');
                $('.catsThumbs').toggleClass('left');
                $('.filterTitleNavMobile').toggleClass('left');
                $('.navigation-top').toggleClass('left');
                $('.headerFixed').toggleClass('left');

                if ( !$('.catsThumbs').hasClass('left') ) {
                    $('.catsThumbs').addClass('close');
                    $('.filterTitleNavMobile').addClass('close');
                    $('.navigation-top').addClass('close');
                    $('.headerFixed').addClass('close');
                }

                setTimeout(function() {
                    $('.catsThumbs').removeClass('close');
                    $('.filterTitleNavMobile').removeClass('close');
                    $('.navigation-top').removeClass('close');
                    $('.headerFixed').removeClass('close');
                }, 500);

                $('body').toggleClass('fiterMenuOpen');
            }
        function openCloseCatNavMenu() {
                $('.mobileCatNav').toggleClass('active');
                if ($(window).width() <= 640) { //mobile
                    $('body').toggleClass('noscroll');
                }
            }
/** ******************************************************************* */


  function getFilter( minOrMax = -1, value = -1 ) {
    var slideValues = $("#slider-range").slider("option", "values");
    minPrice = slideValues[0];
    maxPrice = slideValues[1];
    var terms = {};
    var categories = {};
    var colors = {};
    var sizes = {};
    var filters = {};
    var priceRange = {
      minPrice, maxPrice
    };
    var checked = $('#filters input[type="checkbox"]:checked, #filters input[type="radio"]:checked, .mobileCatNav input[type="radio"]:checked');

    $('.param-warp').removeClass('active');
    for (var i = 0; i < checked.length; i++) {
      switch ($(checked[i]).attr('name')) {
        case "product_cat":
          var name = $(checked[i]).data('taxonomy');
          var value = checked[i].value;
          categories[name] = categories[name] ? categories[name] + ',' + value : value;
          targetSlug = Object.keys(categories)[0];
          targetName = $('label[for=type_' + value + '] p').html();
          categoriesForInfintyScroll = categories;
          break;
        case "pa_filters":
          var name = $(checked[i]).data('taxonomy');
          var value = checked[i].value;
          filters[name] = filters[name] ? filters[name] + ',' + value : value;
          filtersForInfintyScroll = filters;
          console.log( filtersForInfintyScroll );
          if ( filtersForInfintyScroll.hasOwnProperty( 'low2hight' ) || filtersForInfintyScroll.hasOwnProperty( 'hight2low' ) ) {
            isSorting = true;
          }
          break;
        case ($(checked[i]).attr('name').match(/^pa_/) || {}).input:
          var name = $(checked[i]).data('taxonomy');
          var value = checked[i].value;
          console.log(value);
          console.log(name);
          termName = $(checked[i]).attr('name').substr($(checked[i]).attr('name').indexOf("_") + 1, $(checked[i]).attr('name').length);
          $(checked[i]).parent('.param-warp').addClass('active');
          if (!terms[termName]) {
            obj = {};
            obj[name] = value;
            terms[termName] = [obj]
          } else {
            obj = {};
            obj[name] = value;
            terms[termName].push(obj);
          }
          $('.catalogItemsLoading').data('done', false);
          $('.catalogItemsLoading').data('loading', false);
          termssForInfintyScroll = terms;
          break;
    }
  }


  console.log(terms);

  targetSlug = (targetSlug) ? targetSlug : cat_slug;
  var filterParams = {};
  if (filters.hasOwnProperty('hight2low')) {
    filterParams.order = 'desc';
  }
  if (filters.hasOwnProperty('low2hight')) {
    filterParams.order = 'asc';
  }
  if (terms.hasOwnProperty('colors')) {
    filterParams.color = terms.colors.map(function(elem) {
      return Object.keys(elem)[0];
    }).join(',');
  }
  if (terms.hasOwnProperty('sizes')) {
    filterParams.size = terms.sizes.map(function(elem) {
      return Object.keys(elem)[0];
    }).join(',');
  }
  if (terms.hasOwnProperty('brands')) {
    filterParams.brand = terms.brands.map(function(elem) {
      return Object.keys(elem)[0];
    }).join(',');
  }
  
  if (terms.hasOwnProperty('ages')) {
    filterParams.age = terms.ages.map(function(elem) {
      return Object.keys(elem)[0];
    }).join(',');
  }
  
   if (terms.hasOwnProperty('genders')) {
    filterParams.gender = terms.genders.map(function(elem) {
      return Object.keys(elem)[0];
    }).join(',');
  }

  offset = 0;
  page = 1;

  if ( $.isEmptyObject(terms) ) {
    categoryPressed = true;
  }

  if (categoryPressed || isSorting) {
    offset = 0;
    page = 1;
    terms = {};
    termssForInfintyScroll = {};
    ajax_gif_loader('on');
  }
  var data = {
    'action': 'cataloge_filter',
    'cat_id': cat_id,
    'cat_slug': cat_slug,
    'terms': terms,
    'categories': categories,
    'filters': filters,
    'categoryPressed': categoryPressed,
    'offset': offset,
    'page': page,
  };

  if (!categoryPressed) {
    data.priceRange = priceRange;
    filterParams.max_price = maxPrice;
    filterParams.min_price = minPrice;
  }
  $.post(ajaxurl, data, function(response) {
    unSlick('.imageCarousel');
    ajax_gif_loader('off');
    var requestParams = generateRequestParams(filterParams); /*Side menu category navigation*/

    jQuery(document).ready(function($) {
      var sub_cat_id = targetSlug;
      $.ajax({
        url: ajaxurl,
        data: {
          'action': 'ajax_parent_category_request',
          'id': sub_cat_id
        },
        success: function(data) { /*console.log('sucess! ('+ sub_cat_id+')');console.log(data);*/ /*main category ajax check*/
          if (data == 'main') { /*alert(data);*/
            history.pushState(site_url + "/product-category/" + main_cat_slug + "/" + cat_slug, null, site_url + "/product-category/" + targetSlug + "/" + requestParams);
          } /*Not main category*/
          else {
            history.pushState(site_url + "/product-category/" + main_cat_slug + "/" + cat_slug, null, site_url + "/product-category/" + main_cat_slug + "/" + targetSlug + "/" + requestParams);

          }

        },
        error: function(errorThrown) {
          console.log(errorThrown);
        }
      });
    }); /*history.pushState(site_url+"/product-category/"+main_cat_slug+"/"+cat_slug,null,site_url+"/product-category/"+main_cat_slug+"/"+targetSlug+"/"+requestParams);*/

    if (targetName) {
      document.title = targetName + ' - ' + site_name;
      $('.cat-title').html(targetName);
      $('.breadcrumbs').html(response.newBreadcrumbs);
    }
    $('.current-menu-item').removeClass('current-menu-item');
    $('.menu-item a[href="' + site_url + "/product-category/" + main_cat_slug + "/" + targetSlug + "/" + '"]').parent().addClass('current-menu-item');
    $('.catsThumbs .products').empty();
    $('.catsThumbs .term-description.top').empty();
    $('.catsThumbs .term-description.bottom').empty();
    if (response.updatedParams || response.updatedParamsEmpty) {
      $('.side-parameters').empty();
      $('.side-parameters').append(response.updatedParams);
    }
    $('.catsThumbs .term-description.top').append(response.top_content);
    if (response.products) {
      $('.catsThumbs .products').append('<div class="row small-up-2 medium-up-3 large-up-4 products-list">' + response.products + '</div>');
    } else {
      $('.catsThumbs .products').append('<div class="row small-up-2 medium-up-3 large-up-4 products-list">לא נמצאו מוצרים!</div>');
    }
    $('.catsThumbs .term-description.bottom').append(response.bottom_content);
    $('.type-product .params input').unbind('change');
    $('.ajax_add_to_cart').unbind('click');
    $('.toggleParam').unbind('click');
    addToCartEvent();
    paramsChangeAfterLoad();
    initSlickSlider();
    singleParamAutoClick();
    infinityScroll();
    if (categoryPressed) {
      filterClickEvent();
      wishListEvent();
      openCloseCatNavMenu();
      subProductsTitles();
      offset = 0;
      page = 1;
      $('.catalogItemsLoading').data('done', false);
      $('.catalogItemsLoading').data('loading', false);
      changeShareLinks(targetSlug);
      minPrice = response.catMin;
      maxPrice = (parseFloat(response.catMax) == parseFloat(minPrice)) ? parseFloat(response.catMax) + 1 : parseFloat(response.catMax);
      $("#slider-range").attr('dom-change', true);
      $("#slider-range").slider("option", "values", [parseFloat(minPrice), parseFloat(maxPrice)])
      $('#slider-range').slider("option", "min", parseFloat(minPrice));
      $('#slider-range').slider("option", "max", parseFloat(maxPrice));
      $("#amount").val("₪" + parseFloat(minPrice) + " - ₪" + parseFloat(maxPrice));
      $("#slider-range").attr('dom-change', false);
    }
  }, 'json');
}

  var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
      sURLVariables = sPageURL.split('&'),
      sParameterName, i;
    for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split('=');
      if (sParameterName[0] === sParam) {
        return sParameterName[1] === undefined ? true : sParameterName[1];
      }
    }
  };

  function generateRequestParams(paramsObj) {
	  
	  count=1;
	  
    var requestParams = "";
    if (paramsObj.hasOwnProperty('min_price') && paramsObj.min_price !== 'false' && paramsObj.min_price !== false)
		if(count==1){
		requestParams += "?min_price=" + paramsObj.min_price;
			count++;
		}
		else{
		requestParams += "&min_price=" + paramsObj.min_price;	
		}
      //requestParams += "?min_price=" + paramsObj.min_price;
    if (paramsObj.hasOwnProperty('max_price') && paramsObj.max_price !== 'false' && paramsObj.max_price !== false)
		if(count==1){
		requestParams += "?max_price=" + paramsObj.max_price;
			count++;
		}
		else{
		requestParams += "&max_price=" + paramsObj.max_price;	
		}	
	
      //requestParams += "&max_price=" + paramsObj.max_price;
    if (paramsObj.hasOwnProperty('order') && paramsObj.order !== 'false' && paramsObj.order !== false)
		if(count==1){
		requestParams += "?order=" + paramsObj.order;
			count++;
		}
		else{
		requestParams += "&order=" + paramsObj.order;	
		}		
	
      //requestParams += "&order=" + paramsObj.order;
    if (paramsObj.hasOwnProperty('color') && paramsObj.color !== 'false' && paramsObj.color !== false)
		if(count==1){
		requestParams += "?color=" + paramsObj.color;
			count++;
		}
		else{
		requestParams += "&color=" + paramsObj.color;	
		}		

      //requestParams += "&color=" + paramsObj.color;
    if (paramsObj.hasOwnProperty('brand') && paramsObj.brand !== 'false' && paramsObj.brand !== false)
		if(count==1){
		requestParams += "?brand=" + paramsObj.brand;
			count++;
		}
		else{
		requestParams += "&brand=" + paramsObj.brand;	
		}	
	
      //requestParams += "&brand=" + paramsObj.brand;
    if (paramsObj.hasOwnProperty('size') && paramsObj.size !== 'false' && paramsObj.size !== false)
		if(count==1){
		requestParams += "?size=" + paramsObj.size;
			count++;
		}
		else{
		requestParams += "&size=" + paramsObj.size;	
		}	
	
     //requestParams += "&size=" + paramsObj.size;
    if (paramsObj.hasOwnProperty('age') && paramsObj.age !== 'false' && paramsObj.age !== false)
		if(count==1){
		requestParams += "?age=" + paramsObj.age;
			count++;
		}
		else{
		requestParams += "&age=" + paramsObj.age;	
		}	
	
     //requestParams += "&age=" + paramsObj.age;
    if (paramsObj.hasOwnProperty('gender') && paramsObj.gender !== 'false' && paramsObj.gender !== false)
		if(count==1){
		requestParams += "?gender=" + paramsObj.gender;
			count++;
		}
		else{
		requestParams += "&gender=" + paramsObj.gender;	
		}	
	
     //requestParams += "&gender=" + paramsObj.gender;
    return requestParams;
  }

  function initCategory() {
    console.log('initCategory');
    filterParams.order = getUrlParameter('order') ? getUrlParameter('order') : false;
    filterParams.max_price = getUrlParameter('max_price') ? getUrlParameter('max_price') : false;
    filterParams.min_price = getUrlParameter('min_price') ? getUrlParameter('min_price') : false;
    filterParams.size = getUrlParameter('size') ? getUrlParameter('size') : false;
    filterParams.color = getUrlParameter('color') ? getUrlParameter('color') : false;
    filterParams.brand = getUrlParameter('brand') ? getUrlParameter('brand') : false;
    filterParams.age = getUrlParameter('age') ? getUrlParameter('age') : false;
    filterParams.gender = getUrlParameter('gender') ? getUrlParameter('gender') : false;


	
    var requestParams = generateRequestParams(filterParams);
    categoryPressed = true;
    $.post(ajaxurl, {
      'action': 'cataloge_filter',
      'cat_id': cat_id,
      'cat_slug': cat_slug,
      'terms': terms,
      'categories': categories,
      'priceRange': {
        minPrice, maxPrice
      },
      'filterParams': filterParams,
      'categoryPressed': categoryPressed,
      'page': page,
      'offset': offset
    }, function(response) {
      unSlick('.imageCarousel');
      $('label[for=type_' + cat_id + ']').toggleClass('active');
      var requestParams = generateRequestParams(filterParams);
      if (main_cat_slug == cat_slug) {
        history.pushState(null, null, site_url + "/product-category/" + cat_slug + "/" + requestParams);
      } else {
        history.pushState(null, null, site_url + "/product-category/" + main_cat_slug + "/" + cat_slug + "/" + requestParams);
      };
      $('.catsThumbs .products').empty();
      if (response.updatedParams) {
        $('.side-parameters').empty();
        $('.side-parameters').append(response.updatedParams);
      }
      if (response.products) {
        $('.catsThumbs .products').append('<div class="row small-up-2 medium-up-3 large-up-4 products-list">' + response.products + '</div>');
      } else {
        $('.catsThumbs .products').append('<div class="row small-up-2 medium-up-3 large-up-4 products-list">לא נמצאו מוצרים!</div>');
      }
      if (response.done) {
        $('.catalogItemsLoading').data('done', true);
      }
      ajax_gif_loader('off');
      paramsChangeAfterLoad();
      addToCartEvent();
      initRangeFilter(minPrice, maxPrice, filterParams.min_price, filterParams.max_price);
      filterClickEvent();
      wishListEvent();
      subProductsTitles();
      infinityScroll();
      initSlickSlider();
      singleParamAutoClick();
      categoryPressed = false;
      $("#slider-range").attr('dom-change', false);
    }, 'json');
  }

  function ajax_gif_loader(on_off) {
            var gif = $('.ajax-loader');
            if ( on_off == 'on' ) {
                $(gif).fadeIn(600);
            }
            if ( on_off == 'off' ) {
                $(gif).fadeOut(300);
            }
        }

  function filterClickEvent() {

    $('#filters input[type="checkbox"], #filters input[type="radio"], .mobileCatNav input[type="radio"]').change(function(event) {

      if ($(this).attr('name') == 'product_cat') {
        $('.categories label').removeClass('active');
        var parentId = $(this).data('main-cat-id');
        $('.sub-cats-list').removeClass('active');
        $('.sub-cats-list[data-parent-id=' + parentId + ']').addClass('active');
        categoryPressed = true;
      } else {
        categoryPressed = false;
      }
      if ($(this).attr('name') == 'pa_filters') {
        $('.priceFilte label').removeClass('active');
        $('.toggleParam').off('click');
        $('.priceFilte').data('needToSort', true);
      }
      $('label[for=' + $(this).attr('id') + ']').toggleClass('active');
      loaded = false;
      if (categoryPressed) {
        $('#filters input[type="checkbox"],#filters input[type="radio"], .mobileCatNav input[type="radio"]').off('change');
      }
      getFilter(minPrice, maxPrice);
      return false;
    });


    $('input[type="button"]#find_by_name').on('click', function(event) {
      pName = $('input[name="p_name"]').val();
    });


    $("#slider-range").on("slidechange", function(event, ui) {
      if ($("#slider-range").attr('dom-change') == "false") {

        loaded = false;
        categoryPressed = false;
        getFilter(ui.handleIndex, ui.value);
        return false;
      }
    });
  }

  function initRangeFilter(minPrice, maxPrice, filterMinPrice, filterMaxPrice) {
    var filterMaxPrice = filterMaxPrice ? filterMaxPrice : maxPrice;
    var filterMinPrice = filterMinPrice ? filterMinPrice : minPrice;
    $("#slider-range").slider({
      range: true,
      change: function(event, ui) {
        $("#amount").val("₪" + $("#slider-range").slider("values", 0) + " - ₪" + $("#slider-range").slider("values", 1));
      },
      min: parseFloat(minPrice),
      max: (parseFloat(maxPrice) == parseFloat(minPrice)) ? parseFloat(maxPrice) + 1 : parseFloat(maxPrice),
      values: [parseFloat(filterMinPrice), (parseFloat(filterMaxPrice) == parseFloat(filterMinPrice)) ? parseFloat(filterMaxPrice) + 1 : parseFloat(filterMaxPrice)],
      slide: function(event, ui) {
        $("#amount").val("₪" + ui.values[0] + " - ₪" + ui.values[1]);
      }
    });
    $("#amount").val("₪" + $("#slider-range").slider("values", 0) + " - ₪" + $("#slider-range").slider("values", 1));
  }

  function paramsChangeAfterLoad() {
$('.type-product .params input').change(function(event) {
var addToCartLink = $(this).parents('.post-' + $(this).attr('data-pid')).find('.ajax_add_to_cart');
var paramsAreSet = 0;
var radio_groups = {}
$(this).parents('.params').find('input[type="radio"][name*="pa_"]').each(function() {
  radio_groups[this.name] = true;
})
var params = $(this).parents('.params').find('input[type="radio"][name*="pa_"]:checked');
if ($(this).attr('name') == 'pa_colors') {
  $('.imageCarousel-nav[data-pid="' + $(this).attr('data-pid') + '"] img[data-color-id="' + $(this).attr('id') + '"]').trigger('click')
  $(this).parents('.param-section').find('.color-warp label').removeClass('active');
  $(this).parents('.param-section').find('label[for=' + $(this).attr('id') + ']').addClass('active');
  $(this).parents('.param-section').find('.current-color-title').html($(this).attr('data-val-name'));
  var newUrl = updateURLParameter(addToCartLink.attr('href'), $($(this)).data('param-name'), $(this).val());
} else {
  $(this).parents('.param-section').find('.param-warp').removeClass('active');
  $(this).parents('.param-section').find('label[for=' + $(this).attr('id') + ']').parent('.param-warp').addClass('active');
  $(this).parents('.param-section').find('.current-param-title').html($(this).attr('data-val-name'));
  var newUrl = updateURLParameter(addToCartLink.attr('href'), $($(this)).data('param-name'), $(this).val());
}
addToCartLink.attr('href', newUrl);
if (params.length == getPropertyCount(radio_groups)) {
  $(addToCartLink).removeClass('disabled');
}
});
$('.toggleParam').on('click', function(event) {
$(this).parent().toggleClass('open');
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
      for (var i = 0; i < tempArray.length; i++) {
        if (tempArray[i].split('=')[0] != param) {
          newAdditionalURL += temp + tempArray[i];
          temp = "&";
        }
      }
    }
    var rows_txt = temp + "" + param + "=" + paramVal;
    return baseURL + "?" + newAdditionalURL + rows_txt;
  }

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
                         } else {
                             $('.cartSvg').removeClass('notEmpty');
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

  function infinityScroll() {
    $(window).scroll(function() {
      console.log('INFINITY...........................................');
      var top = $(window).scrollTop();
      var pageHeight = $(window).height();
      var height = $('.product-category').outerHeight() + $('.navigation-top').outerHeight() + $('.saleBar').outerHeight();
      if (!$('.catalogItemsLoading').data('done') && !$('.catalogItemsLoading').data('loading') && height - pageHeight < top + 150) {
        $('.catalogItemsLoading').data('loading', true);
        offset++;

        filterParams.order = getUrlParameter('order') ? getUrlParameter('order') : false;
        filterParams.max_price = getUrlParameter('max_price') ? getUrlParameter('max_price') : false;
        filterParams.min_price = getUrlParameter('min_price') ? getUrlParameter('min_price') : false;
        filterParams.size = getUrlParameter('size') ? getUrlParameter('size') : false;
        filterParams.color = getUrlParameter('color') ? getUrlParameter('color') : false;
        filterParams.brand = getUrlParameter('brand') ? getUrlParameter('brand') : false;
        filterParams.age = getUrlParameter('age') ? getUrlParameter('age') : false;
        filterParams.gender = getUrlParameter('gender') ? getUrlParameter('gender') : false;

	

        var requestParams = generateRequestParams(filterParams);
        $('.loadingText').removeClass('dn');
        $.post(ajaxurl, {
          'action': 'cataloge_filter',
          'cat_id': cat_id,
          'cat_slug': cat_slug,
          'terms': termssForInfintyScroll,
          'categories': categoriesForInfintyScroll,
          'filters': filtersForInfintyScroll,
          'priceRange': {
            minPrice, maxPrice
          },
          'filterParams': filterParams,
          'categoryPressed': false,
          'infinityScroll': true,
          'offset': offset,
          'page': page,
        }, function(response) {
          page++;
          $('.loadingText').addClass('dn');
          if ($(window).width() <= 640) {
            $("body, html").animate({
              scrollTop: (height - 50)
            }, 600);
          }
          if (response.done) {
            $('.catalogItemsLoading').data('done', true);
            $('.loadingText').addClass('dn');
          }
          $('.catalogItemsLoading').data('loading', false);
          if (response.products) {
            $('.catsThumbs .products .products-list').append('' + response.products + '');
          }
          $('.type-product .params input').unbind('change');
          $('.ajax_add_to_cart').unbind('click');
          $('.toggleParam').unbind('click');
          paramsChangeAfterLoad();
          addToCartEvent();
          wishListEvent();
          subProductsTitles();
          // unSlick('.imageCarousel');
          initSlickSlider();
          singleParamAutoClick();
          categoryPressed = false;
          // console.log($('.priceFilte').data('needToSort'));
          // console.log($('.priceFilte').attr('data-needToSort'));
          // if ($('.priceFilte').data('needToSort')) {
          //   $('.priceFilte').data('needToSort',false);
          //   getFilter();
          // }
        }, 'json');
      }
    });
  }

  function unSlick(selector) {
      $(selector).each(function () {
          $('.imageCarousel[data-pid="' + $(this).attr('data-pid') + '"]').slick('unslick');
          $('.imageCarousel-nav[data-pid="' + $(this).attr('data-pid') + '"]').slick('unslick');
      });
  }

  function initSlickSlider() {
      $('.imageCarousel:not(.slick-initialized)').each(function () {
          $('.imageCarousel[data-pid="' + $(this).attr('data-pid') +'"]').slick({
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
              asNavFor: '.imageCarousel[data-pid= "' + $(this).attr('data-pid') +'"]',
              dots: false,
              centerMode: false,
              vertical: true,
              focusOnSelect: true
          });
      });


  }

  function changeShareLinks(slug) {
          var fullSlug = $('.shareIcons').attr('data-base-url') + slug + '/';
          $('.shareIcons .facebook').attr('href' , 'https://www.facebook.com/sharer/sharer.php?u=' + fullSlug );
          $('.shareIcons .twitter').attr('href' , 'https://twitter.com/home?status=' + fullSlug );
          $('.shareIcons .whatsapp').attr('href' , 'whatsapp://send?text=' + fullSlug );
      }

})( jQuery );