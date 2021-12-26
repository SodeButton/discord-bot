require('dotenv').config()
const { Client } = require('discord.js')
const client = new Client({
	intents: ['GUILDS', 'GUILD_MESSAGES'],
})
const TOKEN = process.env.BOT_TOKEN

client.once('ready', async () => {
	console.log('Login.')
})

client.on('messageCreate', (message) => {
	if (message.content === '!ping') {
		message.channel.send({
			content: 'pong!'
		})
	}
})

client.login(TOKEN)
