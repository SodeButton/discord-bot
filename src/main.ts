//必要なパッケージをインポートする
import { GatewayIntentBits, Partials, Message } from 'discord.js';
import Client from './client';
import dotenv from 'dotenv';
import * as fs from "fs";
import express from 'express';

const app = express();
app.listen(3000, () => {
	console.log("Server is running!");
});

app.get("/", (req, res) => {
	res.send("Hello World!");
});

//.envファイルを読み込む
dotenv.config();

//Botで使うGatewayIntents、partials
const client = new Client({
	intents: [
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
	partials: [Partials.Message, Partials.Channel],
});

// Event handler
fs.readdirSync(`${__dirname}/events`).forEach(file => {
	client.on(file.split(".")[0], async (...args) => {
		await import(`./events/${file}`).then((event) => event.default(client, ...args));
	});
});

// Setting commands
fs.readdirSync( `${__dirname}/commands`).forEach(folder => {
	fs.readdirSync(`${__dirname}/commands/${folder}`).forEach(async file => {
		const command = await import(`./commands/${folder}/${file}`);
		if (!command?.default || !command?.default?.data?.name) return;
		client.commands.set(command.default.data.name, command.default);
		console.log(command);
	});
});

//!timeと入力すると現在時刻を返信するように
client.on('messageCreate', async (message: Message) => {
	if (message.author.bot) return;
	if (message.content === '!time') {
		const date1 = new Date();
		message.channel.send(date1.toLocaleString());
	}
});

//ボット作成時のトークンでDiscordと接続
client.login(process.env.TOKEN).then();