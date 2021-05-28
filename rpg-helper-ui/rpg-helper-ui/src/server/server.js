var express = require('express');
var fs = require("fs");
var bodyParser = require('body-parser');
var config = require('./config.json');

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

function getWorldDir() {
    return config.rootFolder;
}
function getWorldFileName(name) {
    return getWorldDir() + "/" + name + ".json"
}

app.get('/api/worlds/:name', function (req, res) {
    let name  = req.params.name; // regexp pour garder a-zA-Z0-9 !! https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
    fs.readFile(getWorldFileName(name), 'utf8', function (err, data) {
       res.end(data);
    });
 })


 app.get('/api/worlds', function (req, res) {
     console.log(getWorldDir());
    fs.readdir(getWorldDir(), (err, files) => {
        res.end(JSON.stringify(files.map(x => x.replace(".json",""))));
      });
 })

// https://www.tutorialspoint.com/nodejs/nodejs_restful_api.htm

app.post('/api/worlds/:name', function (req, res) {
     var file = getWorldFileName(req.params.name);
     console.log(req.body);
     fs.writeFile(file,
        JSON.stringify(req.body), function (err) {
        if (err) {
            console.log(err);
        } else {
            response = {
                message:'File uploaded successfully',
                filename: file
            };
            
            console.log( response );
            res.end(JSON.stringify(response));
        }
        
    });
    //res.send('{"result":"uploaded"}');
 })

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})