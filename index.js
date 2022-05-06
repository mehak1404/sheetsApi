const express = require('express');
const app = express();
const path  = require("path");
const bodyparser = require("body-parser");
app.set('views', path.join(__dirname, 'views'));
app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());
var google = require('googleapis');
var prompt = require('prompt');

const fs = require('fs');

  
  const clientId = "1006620290593-fl384d6a768p7mlt3n40jtavo6ss5kl5.apps.googleusercontent.com";
  const clientSecret = "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";
  const redirectUris = "http://localhost:3000/login";
  
  const oAuth2Client = new google.google.auth.OAuth2(
      clientId, clientSecret, redirectUris,
  );
  
  // Generate a url that asks permissions for Gmail scopes
  const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
  ];
  
  const url = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
  });
  
  console.info(`authUrl: ${url}`);

  // for login
app.get("/", (req, res)=>{
    res.redirect(`${url}`);
});
app.get("/login", async (req,res)=>{
    // const url = req.url;
    const code = req.query.code
    console.log(code);

    if(req) res.sendFile(path.join(__dirname+'/views/home.html'));
    else res.send("something went wrong, try again");
        
    const { tokens } = await oAuth2Client.getToken(code);
    console.info(tokens);
    fs.writeFileSync('./credentials.json', JSON.stringify(tokens));
   
    const token = fs.readFileSync('./credentials.json', 'utf-8');
    oAuth2Client.setCredentials(JSON.parse(token));
    
})
// to read the file with specified range.

// app.get("/spreadsheet/:spreadsheetId",async (req,res)=>{
//     const array =[];
//     const token = fs.readFileSync('./credentials.json', 'utf-8');
//     oAuth2Client.setCredentials(JSON.parse(token));
//     const gsapi = google.google.sheets({version:'v4',auth:oAuth2Client});
    
//     const opt = {
//         spreadsheetId : req.params.spreadsheetId,
//         range:"sheet_id_1",
        
//         // dateTimeRenderOption: "FORMATTED_STRING",
//         majorDimension: "ROWS",
//         // valueRenderOption: "UNfORMATTED_VALUE"
//     };
    
//     let ans = await gsapi.spreadsheets.values.get(opt) 
//     let data = ans.data.values;
    
//     if(data.length){
//         data.map((row) => {
//             if(row)array.push(row);
//         });
//     }
    
//     res.send(array);
// });
app.get("/spreadsheet/:spreadsheetId?",async (req,res)=>{
    const array =[];
    const token = fs.readFileSync('./credentials.json', 'utf-8');
    oAuth2Client.setCredentials(JSON.parse(token));
        const gsapi = google.google.sheets({version:'v4',auth:oAuth2Client});
       
        const opt = {
            spreadsheetId : req.params.spreadsheetId,
            range:req.query.name,
        
            // dateTimeRenderOption: "FORMATTED_STRING",
            majorDimension: "ROWS",
            // valueRenderOption: "UNfORMATTED_VALUE"
        };
    
        let ans = await gsapi.spreadsheets.values.get(opt) 
        let data = ans.data.values;

        if(data.length){
            data.map((row) => {
                if(row)array.push(row);
              });
        }

        res.send(array);
});


// for updating
app.get("/update",async (req,res)=>{
    res.sendFile(path.join(__dirname+'/views/update.html'));
  });
app.post("/update", async (req, res)=>{

        const r =req.body.row_number;
        const c= req.body.column_number;
        console.log(r);
        console.log(c);
        console.log(req.body);
        const values =[[req.body.value]];
        const ranges = req.body.name+"!"+ `R[${req.body.row_number}]`+`C[${req.body.column_number}]`;
        console.log(ranges); 
        const options = {
            spreadsheetId : req.body.id,
            range : ranges,
            resource:{values},
            valueInputOption: "USER_ENTERED"

        };
        const token = fs.readFileSync('./credentials.json', 'utf-8');
        oAuth2Client.setCredentials(JSON.parse(token));
        
        const gsapi = google.google.sheets({version:'v4',auth:oAuth2Client});
        await gsapi.spreadsheets.values.update(options); 
        res.send("your data has been updated, please check your sheet");

});
const port = 3000
app.listen( port, (req, res)=>{
    console.log(`app is running on port : ${port}`);
});