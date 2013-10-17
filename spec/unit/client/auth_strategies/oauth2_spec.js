describe("RAML.Client.AuthStrategies.Oauth2", function() {
  var REDIRECT_URI = 'http://localhost:9000/oauth2_success.html';
  var Oauth2 = RAML.Client.AuthStrategies.Oauth2;
  var credentialsManager, settings;

  beforeEach(function() {
    settings = {
      authorizationUrl: 'https://example.com/oauth/authorize',
      accessTokenUrl: 'https://example.com/oauth/access_token'
    };

    credentialsManager = Oauth2.credentialsManager({ clientId: 'ID', clientSecret: 'secret' });
  });

  describe("making an authorization request", function() {
    var request;

    beforeEach(function() {
      spyOn(window, 'open');
      request = Oauth2.authorizationRequest(settings, credentialsManager);
    });

    it("opens authorization resource in a new window", function() {
      var expectedUrl = settings.authorizationUrl + '?client_id=ID&response_type=code&redirect_uri=' + REDIRECT_URI;
      expect(window.open).toHaveBeenCalledWith(expectedUrl, 'raml-console-oauth2');
    });

    describe("completing the request by calling the authorization success callback", function() {
      var success;

      beforeEach(function() {
        success = jasmine.createSpy();
        request.then(success);
        window.RAML.authorizationSuccess('code');
      });

      it("yields the auth code", function() {
        expect(success).toHaveBeenCalledWith('code');
      })
    });
  });

  describe("making an access token request", function() {
    var xhrSpy, accessTokenResponse;

    beforeEach(function() {
      accessTokenResponse = jasmine.createSpyObj('promise', ['then']);
      xhrSpy = spyOn($, 'ajax').andReturn(accessTokenResponse);
      Oauth2.accessTokenRequest(settings, credentialsManager)('code');
    });

    it("requests an access token", function() {
      expect(xhrSpy).toHaveBeenCalledWith({
        url: settings.accessTokenUrl,
        type: 'post',
        data: {
          client_id: 'ID',
          client_secret: 'secret',
          code: 'code',
          grant_type: 'authorization_code',
          redirect_uri: REDIRECT_URI
        }
      });
    });
  });
});
