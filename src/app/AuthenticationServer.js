var restify = require('restify');
var config = require('config').get('iandd-rest-server');
// Require the client API
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
let businessNetworkConnection = new BusinessNetworkConnection();
let businessNetworkDefinition;

var server = restify.createServer();
server.use(restify.bodyParser({ mapParams: true }));
server.pre(restify.CORS());
server.use(restify.fullResponse());

server.post('/authenticate', function(req, res, next){
    /**
     * Setup the business definition
     */
    if(!req.is('application/json')){
        res.send(500, {"Error": "This service accepts content-type application.json"});
    }

    let participantId = req.params.participantId;
    let participantPwd = req.params.participantPassword;
    let connectionProfile = config.get('connectionProfileName');
    let businessNetworkIdentifier = config.get('networkIdentifier');

    businessNetworkConnection.connect(connectionProfile, businessNetworkIdentifier, participantId, participantPwd).then(function(result){
      businessNetworkDefinition = result;
      console.log('Connected: BusinessNetworkDefinition obtained=' + businessNetworkDefinition.getIdentifier());
      businessNetworkConnection.ping().then(function(participantResult){
          var splitResult = participantResult.participant.split('#');
          res.json({'participantType': splitResult[0], 'participantId': splitResult[1]});
          businessNetworkConnection.disconnect();
      }).catch(function(error){
          businessNetworkConnection.disconnect();
          next(error);
      })
    });
    

})

server.listen(2400,  function(){
    console.log('%s listening at %s', server.name, server.url);
});
