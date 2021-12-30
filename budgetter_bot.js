// v1.0.0
var token = <your token>; 
var telegramUrl = "https://api.telegram.org/bot" + token;
var webAppUrl = <your webAppUrl>; 
var selfID = <your chat id>; // get from telegram @userinfobot

function setWebhook() {
  var url = telegramUrl + "/setWebhook?url=" + webAppUrl;
  var response = UrlFetchApp.fetch(url);
}

function sendText(chatId, text, keyBoard) {
  var data = {
    method: "post",
    payload: {
      method: "sendMessage",
      chat_id: String(chatId),
      text: text,
      parse_mode: "HTML",
      reply_markup: JSON.stringify(keyBoard)
    }
  };
  UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/', data);
}

function doPost(e) {
//parse user data
var contents = JSON.parse(e.postData.contents);
//set spreadsheet 
var ssId = <your SpreadsheetID>;
var expenseSheet =  SpreadsheetApp.openById(ssId).getSheetByName("bot"); // replace with your sheet ref

var keyBoard = {
    "inline_keyboard": [
        [{
         "text": "Budget",
         'callback_data': 'budget'
        }],
        [{
         "text": "Total",
         'callback_data': 'total'
        }],
        [{
         "text": "Balance",
         'callback_data': 'balance'
        }]
        ]
};
  
if (contents.callback_query) {
  var id_callback = contents.callback_query.from.id;
  var data = contents.callback_query.data;

  if (id_callback != selfID) {
    sendText(id_callback, "Whoopsie who are you?");
  }
 
    else if (id_callback == selfID & data == 'budget') {
      var budget = expenseSheet.getRange(1, 2).getDisplayValue();
      sendText(id_callback, budget + " is your allocated budget" );
    }
    else if (id_callback == selfID & data == 'total') {
      var total = expenseSheet.getRange(2, 2).getDisplayValue();
      sendText(id_callback, total + " is your total spent so far" );
    }
    else if (id_callback == selfID & data == 'balance') {
      var balance = expenseSheet.getRange(3, 2).getDisplayValue();
      sendText(id_callback, balance + " is your money left" );
    }  
} 

else if (contents.message) {
  var id_message = contents.message.from.id; 
  var text = contents.message.text; 
  var item = text.split("=");
  var firstName = contents.message.from.first_name;             
       
    if (id_message == selfID & text.indexOf("=") !== -1 ) { 
      //get date
      var nowDate = new Date(); 
      var date = nowDate.getMonth()+1+'/'+nowDate.getDate(); 
      expenseSheet.appendRow([date, item[0], item[1]]);
      sendText(id_message,"Ok. Added to your expense sheet"); 
    } 
    
    else if (id_message == selfID) {
      sendText(id_message, "Hi " + firstName +  ", you may send me your expenses with format: 'item = price'. You may also pull your expense reports:",keyBoard)
    }
  
    else if (id_message != selfID) {
      sendText(id_message, "Whoopsie who are you?");  
    }
}
  
}