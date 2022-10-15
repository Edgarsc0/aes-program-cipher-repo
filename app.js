const express=require("express");
const mysql=require("mysql2");
const bodyParser=require("body-parser");
const cryptojs=require("crypto-js");
const app=express();
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended:true
}));
const con=mysql.createConnection({
    host:"containers-us-west-105.railway.app",
    user:"root",
    port:"6398",
    password:"cRTWdTz50nTvnKlkHvAX",
    database:"railway"
});
try{
    con.connect();
    console.log("se conecto a la bd");
}catch(err){
    console.log(err);
}
app.post("/decode",(req,res)=>{
    const parameters=req.body;
    if(parameters.file_name==""||parameters.publicKey==""||parameters.texto==""){
        res.redirect("/descifrar.html");
    }else{
        console.log(req.body);
        con.query(`select * from mensajes where id="${parameters.publicKey}"`,(err,result)=>{
            if(result.length==0){res.redirect("/")}else{
            const textoDescifrado=cryptojs.AES.decrypt(parameters.texto,result[0].clave).toString(cryptojs.enc.Utf8);
            res.send(`
            <html>
            <head></head>
            <body>
            <script>
                function download(filename, text) {
                    var element = document.createElement('a');
                    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
                    element.setAttribute('download', filename);
                
                    element.style.display = 'none';
                    document.body.appendChild(element);
                
                    element.click();
                
                    document.body.removeChild(element);
                }
                download("descifrado.txt","${textoDescifrado}");
                window.location.href="/";
            </script>
            </body>
            </html>
            `)}
        });}
});
app.post("/cifrar",(req,res)=>{
    const parameters=req.body;
    if(parameters.emisor==""
    || parameters.publicKey==""
    || parameters.texto=="" 
    || parameters.privateKey==""){
        res.redirect("index.html");
    }else{
        const textoCifrado=cryptojs.AES.encrypt(`El presente ha sido enviado por: ${parameters.emisor}, `+parameters.texto,parameters.privateKey).toString();
        console.log(textoCifrado);
        con.query(`insert into mensajes values(?,?,?)`,[parameters.publicKey,parameters.emisor,parameters.privateKey],(err,result)=>{
            if(err){console.log(err)}else{
                res.write(
                    `
                    <html>
                    <head>
                    </head>
                    <body>
                        <script>
                        function download(filename, text) {
                            var element = document.createElement('a');
                            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
                            element.setAttribute('download', filename);
                        
                            element.style.display = 'none';
                            document.body.appendChild(element);
                        
                            element.click();
                        
                            document.body.removeChild(element);
                        }
                        download("cifrado.txt","${textoCifrado}");
                        window.location.href="/";
                        </script>
                    </body>
                    </html>
                    `
                );
                res.end();
            }
        });
        /*

        */
    }

});
const port=process.env.PORT||8000;
app.listen(port,()=>{
    console.log("server on port "+port);
});