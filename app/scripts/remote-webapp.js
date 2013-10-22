var WebAppModel = Model({

  marker: {},
  iframe: '',

  /**
   * Prepare data for fake navigator of the clients
   * @param  {json} data
   */
  updateNavigator: function(data) {
    var data = data || {};

    data.error = remote.error;
    data.onLine = remote.onLine;

    data.position = {
      coords: {
        latitude: remote.app.position.latitude,
        longitude: remote.app.position.longitude,
        accuracy: remote.route.driving.accuracy
      },
      timestamp: new Date().getTime()
    }

    remoteLog('update:navigator' + JSON.stringify(data));

    remote.comm.sendToClients(data);
  },

  /**
   * Add an iFrame to the remote control for the webapp
   */
  addIframe: function () {
    this.iframe = document.createElement('iframe');
    this.iframe.id = 'webapp';

    document.body.appendChild(this.iframe);
  },

  /**
   * Removes the iFrame from remote control
   */
  removeIframe: function () {
    this.iframe.parentNode.removeChild(this.iframe);
    this.iframe = '';
  },

  /**
   * Updates the iFrame in removing and adding again
   * @param  {string} query it's used as the query string of the iframe url
   */
  updateIframe: function(query) {

    if (this.iframe.tagName) {
      this.removeIframe();
    }

    this.addIframe();

    // prevent me (the remote) from getting framed all over again and again and again ...
    if (window != window.top) {
      return;
    }

    var search = query || '?embed=true&' + window.location.search.replace('?','');
    var href = window.location.href.replace('/remote', '')  + search;

    // set http if not
    href = (/^(http||https):\/\//.test(href)) ? href : 'http://' + href;

    // update control
    $('.webapp .url').val(search);

    // set src attr to iframe
    this.iframe.setAttribute('onload','remote.webapp.injectJavascript()');
    this.iframe.src = href;

    this.trigger('iframe:ready');
  },

  /**
   * Injecting the nessasary js files in the client app
   */
  injectJavascript: function() {

    var script;

    var jsLibs = [
      'remote/scripts/fake-geolocation.js',
      'remote/scripts/fake-navigator.js',
      'remote/scripts/client-scripts.js'
    ]

    _.each(jsLibs, function (src) {

      script = this.iframe.contentWindow.document.createElement("script");
      script.type = "text/javascript";
      script.src = src;
      this.iframe.contentWindow.document.body.appendChild(script);

    }, this);
  }
});