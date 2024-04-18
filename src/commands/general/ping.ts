import {Command} from "../../interfaces";

export = {
  data: {
    name: 'ping',
    description: 'Ping Pong!',
  },
  async execute(interaction) {
    await interaction.reply(`pong! The ping is ${interaction.client.ws.ping}ms!`);
  }
} as Command;