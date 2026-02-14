import { SlashCommandBuilder, CommandInteraction, Message } from 'discord.js';
export interface Command {
  data: SlashCommandBuilder;
  execute(interaction: CommandInteraction): Promise<void>;
}

export interface CustomCommand {
  data: {
    name: string;
    description: string;
  }
  execute(message: Message): void;
}