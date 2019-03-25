jQuery(document).ready(function($) {
    var mediaUploader;

    $('#upload-button').on('click',function (e) {
        e.preventDefault();
        if(mediaUploader){
            mediaUploader.open();
            return;
        }

        mediaUploader = wp.media.frames.file_frame = wp.media({
            title: 'Upload site logo',
            button: {
                text: 'Choose Picture'
            },
            multiple: false
        });

        mediaUploader.on('select',function(){
            att = mediaUploader.state().get('selection').first().toJSON();
            $('#logo').val(att.url);
            $('#logo-preview').css('background-image','url(' + att.url + ')');
        });

        mediaUploader.open();

    });

    $('#remove-logo').on('click', function(e) {
        e.preventDefault();
        var answer = confirm("Are you sure you want to remove the logo?");
        if (answer) {
            $('#logo').val('');
            $('.stg-general-form').submit();
        }
        return;
    });

    //remove ReduX ads
    if ($('.rAds').length) {
        $('.rAds').remove();
    }
    $('.redux-group-tab-link-a').on('click',function() {
        if ($('.rAds').length) {
            $('.rAds').remove();
        }
    });

});