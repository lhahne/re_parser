const mailparser = require('mailparser');
const cheerio = require('cheerio');
const request = require('request');
const moment = require('moment');

const aws = require('aws-sdk');
const s3 = new aws.S3();
const s3Stream = require('s3-upload-stream')(s3);

const selectors = {
    price: ".costs > dl:nth-child(2) > dd:nth-child(2) > ul > li:nth-child(1) > label",
    vastike: ".costs > dl:nth-child(3) > dd:nth-child(2) > ul > li:nth-child(1) > label",
    city: ".basics > dl > dd:nth-child(4) > ul > li:nth-child(1) > a:nth-child(1) > span",
    slum: ".basics > dl > dd:nth-child(4) > ul > li:nth-child(1) > a:nth-child(2) > span",
    area: ".basics > dl > dd:nth-child(14) > label",
    floor: ".basics > dl > dd:nth-child(18) > label:nth-child(1)",
    year: ".basics > dl > dd:nth-child(19) > label:nth-child(1)"
};

const bucket = 'etuovi.hahne.fi';

exports.handler = (event, context, callback) => {
    // TODO implement
    const message = JSON.parse(event.Records[0].Sns.Message);
    console.log(JSON.stringify(message, null, 2));
    console.log(message.content);
    mailparser.simpleParser(message.content, (err, mail) => {
        const mailHtml = cheerio.load(mail.html);
        const url = mailHtml('tbody > tr:nth-child(5) > td:nth-child(2) > table > tbody > tr:nth-child(1) > td > a').attr('href');
        const plainUrl = url.split("?")[0];
        const id = plainUrl.split("/").pop();
        const pdfUrl = "https://www.etuovi.com/kohde_pdf/" + id + "?download=pdf";
        console.log(pdfUrl);

        const upload = s3Stream.upload({
            Bucket: bucket,
            Key: "pdf/" + id + ".pdf"
        });

        upload.on('error', (error) => {
            console.log(error);
            callback(null, 'errror');
        });

        upload.on('uploaded', (details) => {
            console.log(details);

            request(plainUrl, (error, response, body) => {
                const pageHtml = cheerio.load(body);
                const parsed = {
                    id: id,
                    pdf: details.Location,
                    time: moment().format()
                };

                Object.keys(selectors).forEach(key => {
                    parsed[key] = pageHtml(selectors[key]).text();
                });

                parsed.price = Number.parseFloat(parsed.price.replace(/€| /g, ''));
                parsed.vastike = Number.parseFloat(parsed.vastike.split('€')[0].replace(/ /g, '').replace(',', '.'));
                parsed.area = Number.parseFloat(parsed.area.split(' ')[0].replace(',', '.'));

                console.log(parsed);

                const toUpload = {
                    Body: JSON.stringify(parsed),
                    Bucket: bucket,
                    Key: "json/" + id + ".json"
                };


                s3.putObject(toUpload, (err, data) => {
                    console.log(err);
                    console.log(data);
                    callback(null, 'finished');
                });
                
            });

        });
        
        request(pdfUrl).pipe(upload);
    });
    
};