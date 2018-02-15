const express = require('express')
const cmd = require('node-cmd')
const redis = require('redis')

const app = express()
const client = redis.createClient()

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

app.post('/autodeploy', (req,res) => {
	
	let command = `
		pwd
		ls
	`
	
	cmd.get(command, (err, data, stderr) => {
		if(err) console.error('Waduh ', err)
		
		res.send(data)
	})

})

app.listen(1234,() => console.log('port 1234'))
