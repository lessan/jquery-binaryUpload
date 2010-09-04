$(function() {
  jQuery.fn.binaryUpload = function(options) {
    var elem = $(this);
    var defaults = {
      onStart: null,
      onFinish: null,
      onProgress: null,
      onError: null,
      onBrowserIncompatible: null,
      url: null,
      fields: {}
    }
    var opts = $.extend(defaults, options);
    opts.fileField = $(this).attr('name') || 'file';

    $(this).change(function(evt) {
      var req = new XMLHttpRequest();

      req.upload.addEventListener('progress', opts.onProgress, false);
      req.upload.addEventListener('loadstart', opts.onStart, false);
      req.upload.addEventListener('load', opts.onFinish, false);
      req.upload.addEventListener('error', opts.onError, false);

      if (window.FormData) {
        var formData = new FormData();

        file = elem[0].files[0]
        formData.append(opts.fileField, file);
        $.each(opts.fields, function(k, v) {
          formData.append(k, v);
        });

        req.open('POST', opts.url);
        req.setRequestHeader('Cache-Control', 'no-cache');
        req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        req.setRequestHeader('X-File-Name', file.fileName);
        req.setRequestHeader('X-File-Size', file.fileSize);
        req.send(formData);
      } else if (elem[0].files[0].getAsBinary) {
        var file = elem[0].files[0];
        var boundary = 'xxxxxxxxx';
        var body = '--' + boundary + "\r\n";

        body += 'Content-Disposition: form-data; name="' + opts.fileField + '"; filename="' + file.fileName + '"\r\n';
        body += 'Content-Type: application/octet-stream\r\n\r\n';
        body += file.getAsBinary() + "\r\n";
        body += '--' + boundary;

        $.each(opts.fields, function(k, v) {
          body += '\r\n';
          body += 'Content-Disposition: form-data; name="' + k + '"\r\n\r\n';
          body += v + '\r\n';
          body += '--' + boundary;
        })
        body += '--\r\n';

        req.open('POST', opts.url, true);
        req.setRequestHeader('Accept', 'text/javascript');
        req.setRequestHeader('content-type', 'multipart/form-data; boundary=' + boundary);
        req.sendAsBinary(body);
      }
    });

    if (typeof(window.FormData) == 'undefined' && typeof(File) == 'undefined') {
      $.isFunction(opts.onBrowserIncompatible) && opts.onBrowserIncompatible.call();
    }
  }

});