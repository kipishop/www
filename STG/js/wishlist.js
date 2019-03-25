(function($){
    $(document).ready(function() {
        wishlistClickEvent();
    });  

    function wishlistClickEvent(){
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
                if (toAdd) {
                    $(wishlistHREF).addClass('inWishlist');
                }else if(toRemove){
                    $(wishlistHREF).removeClass('inWishlist');
                    data = {
                        'action': 'get_wishlist',
                    }
                    $.post(ajaxurl, data, function(response) {
                        $('.wishlist-container').empty();
                        $('.wishlist-container').append($(response).filter('.wishlist-container').html());
                    });
                }
                $('body').append(response);
                
            },'json');
        });
    }
})( jQuery );