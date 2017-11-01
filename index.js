const mailparser = require('mailparser');
const cheerio = require('cheerio');
const request = require('request');

const aws = require('aws-sdk');
const s3Stream = require('s3-upload-stream')(new aws.S3());

exports.handler = (event, context, callback) => {
    // TODO implement
    const message = JSON.parse(event.Records[0].Sns.Message);
    console.log(JSON.stringify(message, null, 2));
    console.log(message.content);
    mailparser.simpleParser(message.content, (err, mail) => {
        const mailHtml = cheerio.load(mail.html);
        const url = mailHtml('tbody > tr:nth-child(5) > td:nth-child(2) > table > tbody > tr:nth-child(1) > td > a').attr('href');
        const id = url.split("?")[0].split("/").pop();
        const pdfUrl = "https://www.etuovi.com/kohde_pdf/" + id + "?download=pdf";
        console.log(pdfUrl);

        const upload = s3Stream.upload({
            Bucket: "etuovi.hahne.fi",
            Key: "pdf/" + id + ".pdf"
        });

        upload.on('error', (error) => {
            console.log(error);
            callback(null, 'errror');
        });

        upload.on('uploaded', (details) => {
            console.log(details);
            callback(null, 'finished');
        });
        
        request(pdfUrl).pipe(upload);
    });
    
};