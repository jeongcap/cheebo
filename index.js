const express = require('express')
const bodyParser = require('body-parser')
const cheerio = require('cheerio');
const request = require('request');

const app = express()
app.use(bodyParser.json())
app.set('port', (process.env.PORT || 5000))


var popup_link;
var notice_url_s;
var notice_url;

var res_content;
var req_company;
var req_content;

var url1;
var url2;
var url;



app.get('/', function (req, res) {
  //  res.send('Use the /webhook endpoint.')
    
    console.log(popup_link + req_company);
    res.send(res_content);
})

function get_inform(req_company, req_content){
  popup_link = "http://www.saramin.co.kr";
  url1 = 'http://www.saramin.co.kr/zf_user/search/company?searchword=';
  url2 = '&searchType=auto&go=';

  req_company = encodeURI(req_company); 
  url = url1 + req_company + url2;
  console.log('검색 url 완성');

  request(url,function(error, response, html){
  
    var $ = cheerio.load(html);
    var popup_link_info = $('.company_tit > .tit ').first().find('a').attr('href');
    var temp = popup_link_info.split("'");
    popup_link += temp[1];
    console.log(popup_link+'    팝업링크 완성');

    request(popup_link, function (error, response, html) {
      if (!error) {
          var $1 = cheerio.load(html);
          var arr = [];              
          var b = $1('tbody', '.table_col_type1').text();
          b = b.split('\n');
          b.shift();
          b.shift();                

          for (var i=0;i <b.length;i++){
              arr[i] = b[i].trim();                    
          }            
          arr = arr.filter(n => n);
         
          //주어진 req_content 값 찾기
          var ind = arr.indexOf(req_content) ;
          res_content = ind != -1? arr[ind + 1] : '없습니다';
          console.log(res_content + '   내용 찾음');
                
        }
      });
    
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
  req_content = req.body.result.parameters['Contents']
  get_inform(req_company,req_content);
  
  

//  var webhookReply = 'Hello ' + userName + '! Welcome from the heroku.'
  var webhookReply = res_content;

  // the most basic response
  res.status(200).json({
    source: 'webhook',
    speech: popup_link,
    displayText: webhookReply
  })
})

app.listen(app.get('port'), function () {
  console.log('* Webhook service is listening on port:' + app.get('port'))
})
