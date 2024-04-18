import { GatewayIntentBits, Partials, Message, Events } from 'discord.js';
import Client from './client';
import dotenv from 'dotenv';
import * as fs from "fs";
import axios from 'axios';
import './webServer';
import { CustomCommand } from './interfaces';

const createPoint = 'https://api.paiza.io/runners/create';
const getStatusPoint = 'https://api.paiza.io/runners/get_status';
const getDetailsPoint = 'https://api.paiza.io/runners/get_details';

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
	});
});

fs.readdirSync(`${__dirname}/customCommands`).forEach(folder => {
	fs.readdirSync(`${__dirname}/customCommands/${folder}`).forEach(async file => {
		const commandDefault = await import(`./customCommands/${folder}/${file}`);
		const command = commandDefault.default as CustomCommand;

		if (!command || !command?.data?.name) return;
		client.on(Events.MessageCreate, async (message: Message) => {
			if (message.author.bot) return;
			if (message.content.startsWith(`!${command.data.name}`)) {
				command.execute(message);
			}
		});
	});
});

//!timeと入力すると現在時刻を返信するように
client.on('messageCreate', async (message: Message) => {
	if (message.author.bot) return;
});

//ボット作成時のトークンでDiscordと接続
client.login(process.env.TOKEN).then();