var express = require("express");
var app = express();
var mysql = require('mysql');
var multer = require('multer');
var config = require('./config.json');

console.log(config);
app.use(express.static(__dirname + '/public'));

//Database stuff
app.get('/contracts', function(req, res, next) {
	//Query for all contracts
	console.log('Querying for contracts:')
	connection.query('SELECT * from opt.tblContracts', function(err, rows, fields) {
		if (!err) {
			res.send(rows);
			console.log('Contracts:')
			console.log(rows);
		} else {
			console.log('Error while performing Query.');
			console.log(err);
		}
	});
});

app.get('/results', function(req, res, next) {
	//Query for all results
	console.log('Querying for results:');
	connection.query('SELECT * from opt.tblResult', function(err, rows, fields) {
		if (!err) {
			res.send(rows);
			console.log('Results');
			console.log(rows);
		} else {
			console.log('Error while performing Query.');
			console.log(err);
		}
	});
});

//TODO: setup pooling http://codeforgeek.com/2015/01/nodejs-mysql-tutorial/
var connection = mysql.createConnection({
  host     : config.db_host,
  user     : config.db_user,
  password : config.db_password,
  port : config.db_port,
  database : 'opt'
});

connection.connect();

function insertNewContract(contractName) {
	console.log('Inserting new contract named: ' + contractName);
	connection.query('INSERT INTO opt.tblContracts (Name) VALUES(?)', [contractName], function(err, result) {
		if (!err) {
			console.log('Inserted ' + result.insertId);
			//TODO: return promise
		} else {
			console.log('Error while performing Query.');
			console.log(err);
		}
	});
};

function populateSimulations(simulations) {
	//columns for tblSimulations: ContractSID,Year,Event,Loss 
	//TODO: figure out how to insert into opt.tblSimulations
}

//TODO:Figure out if I even need to end the connection
//connection.end();

//TODO: handle uploading
//http://codeforgeek.com/2014/11/ajax-file-upload-node-js/


app.listen(3001);