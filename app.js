var express = require('express')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var app = express()
var interval
var interval_switch
var urlencodeParser = bodyParser.urlencoded({extended: false})
var decider = false 
var time 

//Import 
let Simulation = require('./models/simulate')
let SuitSwitch = require('./models/suitswitch')

//Database connector
//mongoose.connect("mongodb://Manny_Carr:Tvstudent1!@nasa-suits-2020-shard-00-00-whk7y.mongodb.net:27017,nasa-suits-2020-shard-00-01-whk7y.mongodb.net:27017,nasa-suits-2020-shard-00-02-whk7y.mongodb.net:27017/test?ssl=true&replicaSet=nasa-suits-2020-shard-0&authSource=admin&retryWrites=true")
mongoose.connect("mongodb+srv://Manny_Carr:Tvstudent1!@nasa-suits-2020-whk7y.mongodb.net/test?retryWrites=true&w=majority")
//mongoose.connect('mongodb://localhost/spacesuit');

//EJS framework for website display
app.set('view engine', 'ejs')
app.use('/assets', express.static('assets'))

//ROUTES
app.get('/',function(req, res){
	res.render('index')
})

//On start button, simulation starts
app.post('/', urlencodeParser, function(req, res){
	console.log('--------------Simulation started--------------')

	time = Date.now() 
	interval = setInterval(Simulation.suitTelemetry.bind(null, time, decider),1000)
	interval_switch = setInterval(SuitSwitch.SuitSwitch.bind(null,decider),1000)

	res.render('error_ready',{qs: ''})
})

app.post('/error-ready',urlencodeParser, function(req, res){
	console.log('-> Error calculation active!')

	//Stop standard simulation
	clearInterval(interval)
	clearInterval(interval_switch)

	decider = true 

	//Start alternative simulation
	interval = setInterval(Simulation.suitTelemetry.bind(null, time, decider),1000)
	interval_switch = setInterval(SuitSwitch.SuitSwitch.bind(null,decider),1000)

	res.render('error_resolver',{qs: req.query})
})

app.get('/error-ready',function(req, res){
	res.render('error_ready',{qs: req.query})
})

app.post('/resolver',urlencodeParser, function(req, res){
	console.log('-> Normal calculation active!')

	//Stop standard simulation
	clearInterval(interval)
	clearInterval(interval_switch)
    
	decider = false 
    
	//Start alternative simulation
	interval = setInterval(Simulation.suitTelemetry.bind(null, time, decider),1000)
	interval_switch = setInterval(SuitSwitch.SuitSwitch.bind(null,decider),1000)



	res.render('contact',{qs: req.query})
})

app.get('/resolver',function(req, res){
	res.render('error_resolver',{qs: req.query})
})

app.get('/contact',function(req, res){
	res.render('contact',{qs: req.query})
})

app.post('/contact', urlencodeParser, function(req, res){
	console.log('--------------Simulation stopped--------------')
	clearInterval(interval)
	clearInterval(interval_switch)
	res.render('contact-success',{data: req.body})
})



console.log("before api/suit")
//Returns all simulated data from the database
app.get('/api/suit', function(req, res){     
	
	console.log("after api/suit")
	Simulation.getSuitTelemetry(function (err, data) {
		
		console.log("after getSuitTelemetry function")
		if (err) {
			throw err
			console.log(err)
		}
		res.json(data)
	})
})

console.log("before api/suit/recent")
app.get('/api/suit/recent', function(req, res){   
	
	console.log("after api/suit/recent")
	Simulation.getSuitTelemetryByDate(function (err, data) {
		
		console.log("after getSuitTelemetryByDate function")
		if (err) {
			throw err
			console.log(err)
		}
		res.json(data)
	})
})

console.log("before api/suitswitch")
app.get('/api/suitswitch', function(req, res){ 
	
	console.log("after api/suitswitch")
	SuitSwitch.getSuitSwitch(function (err, data) {
		
		console.log("after getSuitSwitch function")
		if (err) {
			throw err
			console.log(err)
		}
		res.json(data)
	})
})
console.log("before api/suitswitch/recent")
app.get('/api/suitswitch/recent', function(req, res){   
	
	console.log("code afer api/suitswitch/recent")
	SuitSwitch.getSuitSwitchByDate(function (err, data) {
		
		console.log("after getSuitSwitchByDate function")
		if (err) {
			throw err
			console.log(err)
		}
		res.json(data)
	})
})



app.listen(process.env.PORT || 3000)
console.log('Server is running on port 3000...')
