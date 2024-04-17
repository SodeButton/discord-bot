import Client from '../client';
import {CommandInteraction} from "discord.js";

export default (client: Client, interaction: CommandInteraction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    command.execute(interaction).then();
  } catch(e) {
    if (interaction.replied) {
      interaction.followUp({
        content: 'エラーが発生しました！',
        ephemeral: true
      }).then();
    } else {
      interaction.reply({
        content: 'エラーが発生しました！',
        ephemeral: true
      }).then();
    }
  }
}