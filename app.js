const express = require('express')
const cmd = require('node-cmd')
const redis = require('redis')
const bodyParser = require('body-parser')

const app = express()
const client = redis.createClient()

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use('/autodeploy',(req,res,next) => {
	let token = req.get('X-Gitlab-Token')

	client.hkeys(token,(err, rep) => {
		if(rep.length > 0) {
			next()
		} else {
			res.send('Ora ono tokene iki')
		}
	})
})

app.get('/keys', (req,res) => {
	client.keys("*", (err, results) => {
		res.json(results)
	})
})

app.post('/commands', (req, res) => {
	let redisKey = req.body.key
	let redisField = 'command'
	let redisValue = req.body.command

	client.hset(redisKey,redisField,redisValue, (err) => {
		if(err) {
			res.send("Failed to save new command")
		} else {
			res.send("Command saved")
		}
	})
})

app.get('/commands/:key', (req, res) => {
	client.hget(req.params['key'],'command',(err, result) => {
		res.json(result)
	})
})

app.post('/autodeploy', async (req,res) => {

	await client.hget(req.get('X-Gitlab-Token'),'command', (err, result) => {
		if(err) console.error('Asem tenan', err)
		let command = result
		
		cmd.get(command, (err, data, stderr) => {
			if(err) {
				res.send('Command ente is kliru gan...')
			} else {
				res.send(data)
			}
		})

	})

})

app.listen(1234,() => console.log('http://127.0.0.1:1234'))
