import { GatewayIntentBits, Partials, Message, Events } from 'discord.js';
import { REST, Routes } from "discord.js";
import Client from './client';
import dotenv from 'dotenv';
import * as fs from "fs";
import './webServer';
import { CustomCommand } from './interfaces';
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
const commands: any[] = [];
fs.readdirSync( `${__dirname}/commands`).forEach(folder => {
	fs.readdirSync(`${__dirname}/commands/${folder}`).forEach(async file => {
		const command = await import(`./commands/${folder}/${file}`);
		if (!command?.default || !command?.default?.data?.name) return;
		console.log(command);
		commands.push(command);
		// client.commands.set(command.default.data.name, command.default);
	});
});

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN as string);
(async () => {
	try {
		console.log('Started refreshing application (/) commands.');
		await rest.put(
			Routes.applicationCommands(process.env.CLIENT_ID ?? ''),
			{ body: commands },
		);
		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();

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