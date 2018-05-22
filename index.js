const express = require('express')
const bodyParser = require('body-parser')

var cheerio = require('cheerio');
var request = require('request');

const app = express()
app.use(bodyParser.json())
app.set('port', (process.env.PORT || 5000))


var popup_link = "http://www.saramin.co.kr";
var notice_url_s;
var notice_url;

var res_content;
var req_company = '농심';
var req_content = 'FAX';

 // req_company = encodeURI(req_company);        //한글로 들어온 것 인코딩 시키기

var url1 = 'http://www.saramin.co.kr/zf_user/search/company?searchword=';
var url2 = '&searchType=auto&go=';
var url;



app.get('/', function (req, res) {
  res.send('Use the /webhook endpoint.')
})
app.get('/webhook', function (req, res) {
  res.send('You must POST your request')
})
function get_url(req_company, req_content){
    url = url1 + req_company + url2;

    request(url, function(error, response, html){
      var $ = cheerio.load(html);
      //기업 팝업 링크 찾아서 popup_link에 저장      
      var popup_link_info = $('.company_tit > .tit ').first().find('a').attr('href');
      var temp = popup_link_info.split("'");
      popup_link += temp[1];
    // console.log(popup_link);
      return popup_link;
      // res.send(JSON.stringify(notice_url_s))
  });
}
app.post('/webhook', function (req, res) {
  // we expect to receive JSON data from api.ai here.
  // the payload is stored on req.body
  console.log(req.body)
  

  // we have a simple authentication
 /* if (REQUIRE_AUTH) {
    if (req.headers['auth-token'] !== AUTH_TOKEN) {
      return res.status(401).send('Unauthorized')
    }
  }*/

  // and some validation too
  if (!req.body.result) {
    return res.status(400).send('bad~!~!')
  }

  // the value of Action from api.ai is stored in req.body.result.action
 // console.log('* Received action -- %s', req.body.result.action)

  // parameters are stored in req.body.result.parameters
  req_company = req.body.result.parameters['company']
  req_content = req.body.result.parameters['Content']

  req_company = encodeURI(req_company); 
  
var uuuuu = get_url(req_company,req_content);

//  var webhookReply = 'Hello ' + userName + '! Welcome from the heroku.'
  var webhookReply = uuuuu;

  // the most basic response
  res.status(200).json({
    source: 'webhook',
    speech: webhookReply,
    displayText: webhookReply
  })
})

app.listen(app.get('port'), function () {
  console.log('* Webhook service is listening on port:' + app.get('port'))
})
