(function($){

    $(document).ready(function() {
        $('.playBtn').on('click',function(e){
            $.magnificPopup.open({
                mainClass: 'mfp-fade',
                items: {
                    src: '#videoWarp'
                },
                type:'inline',
                midClick: true,
                callbacks: {
                    open: function() {
                        $('.videoWarp').css('cssText','display:block!important');
                    },
                    close: function() {
                        $('.videoWarp').css('cssText','display:none!important');
                    }
                }
            });
        });
    });  

})( jQuery );