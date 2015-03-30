function context(data,func) {
    return function(event){func(data,event);}
};
function my_alert(text) {
    var html = $('<div class="alert">'+text+'</div>');
    $('#ui_alerts').append(html);
    setTimeout(function(){
        html.fadeOut('fast', function(){
            html.remove();
        });
    }, 5000);
}
function drag_n_drop(id, options) {
    // Проверка поддержки браузером
    if (typeof(window.FileReader) == 'undefined') {
        return false;
    }

    if (typeof(options) == 'undefined' && typeof(id) == 'object') {
        options = id;
        id = false;
    }

    var obj = {
        maxFileSize: 10000000,  // максимальный размер файла - 10 мб.
        handler: 'upload.php',  // адрес для загрузки
        is_one: false,          // закачивать ли только один файл

        html_simple: '',        // '<div class="item"></div>',

        _start: function() {
            if (this.html_simple) {
                var html = $(this.html_simple);
                this.this_obj.append(html);
                return html;
            }
            return false;
        },
        _finish: function(data, event) {
            this.this_obj.html('<img src="'+data.img.src_feedbacks+'">');
        },
        _finish_error: function(data, event) {
            this.alert('Во время загрузки произошла ошибка');
        },
        _progress: function(event) {},

        sendFile: function(file) {
            if (file.size > this.maxFileSize) {
                this.alert('Файл слишком большой!');
                return false;
            }

            var fd = new FormData();
                fd.append("file", file);

            this.this_obj.find('.no_img_text').remove();
            var html = this._start();

            // Создаем запрос
            var xhr = new XMLHttpRequest();
            xhr.upload.addEventListener('progress', context({obj: this}, this.uploadProgress), false);
            xhr.onreadystatechange = context({obj: this, html: html}, obj.uploadFinish);
            xhr.open('POST', this.handler);
            xhr.send(fd);
        },
        uploadProgress: function(data, event) {
            event.percent = parseInt(event.loaded / event.total * 100);
            data.obj._progress(event);
        },
        uploadFinish: function(data, event) {
            if (event.target.readyState == 4) {
                if (event.target.status == 200) {
                    data.img = $.parseJSON(event.target.response);

                    data.obj._finish(data, event);
                } else {
                    data.obj._finish_error(data, event);
                }
            }
        },
        alert: function(text) {
            my_alert(text);
        }
    }

    // custom options
    for (name in options) {
        obj[name] = options[name];
    }

    $(document).on("dragover", obj.id, function(event){
        event.preventDefault();
        event.stopPropagation();
        $(this).addClass('hover');
    });

    $(document).on("dragleave", obj.id, function(event){
        event.preventDefault();
        event.stopPropagation();
        $(this).removeClass('hover');
    });

    $(document).on("drop", obj.id, obj, function(event){
        event.preventDefault();
        event.stopPropagation();
        $(this).removeClass('hover');
        $(this).addClass('drop');

        event.data.this_obj = $(this);

        if (event.data.is_one) {
            var file = event.originalEvent.dataTransfer.files[0];
            event.data.sendFile(file);
        } else {
            var files = event.originalEvent.dataTransfer.files;
            for (var i = 0, l = files.length; i < l; i++) {
                event.data.sendFile(files[i]);
            }
        }
    });
}
