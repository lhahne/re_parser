const mailparser = require('mailparser');
const cheerio = require('cheerio');
const request = require('request');

exports.handler = (event, context, callback) => {
    // TODO implement
    const message = JSON.parse(event.Records[0].Sns.Message);
    console.log(JSON.stringify(message, null, 2));
    console.log(message.content);
    mailparser.simpleParser(message.content, (err, mail) => {
        const mailHtml = cheerio.load(mail.html);
        const url = mailHtml('tbody > tr:nth-child(5) > td:nth-child(2) > table > tbody > tr:nth-child(1) > td > a').attr('href');
        console.log(url);
        
        request(url.split("?")[0], (error, response, body) => {
            console.log(body);
            callback(null, 'Hello from Lambda');
        });
    });
    
};