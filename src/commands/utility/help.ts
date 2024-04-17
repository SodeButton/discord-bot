import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import { Command } from '../../interfaces';
export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('ヘルプを表示します。'),
  execute: async(interaction: CommandInteraction)=> {
    await interaction.reply({
      embeds: [
        {
          color: 0xffd700,
          title: 'Help',
          description: `コマンド一覧`,
          fields: [
            {
              name: '!compile',
              value: `プログラムをコンパイルします！`,
            },
            {
              name: '使い方',
              value: `
							>>> !compile
							\\\`\\\`\\\`[lang]
							source code
							\\\`\\\`\\\`
							\\\`\\\`\\\`input
							input text
							\\\`\\\`\\\`
							`,
            },
            {
              name: '使用例',
              value: `
							>>> !compile
							\\\`\\\`\\\`cpp
							#include<iostream>
							#include<string>
							using namespace std;
							int main() {
								string name;
								cin >> name;
								cout << "Hello!, " << name << endl;
								return 0;
							}
							\\\`\\\`\\\`
							\\\`\\\`\\\`input
							BOTN
							\\\`\\\`\\\`
							`,
            },
          ],
        }
      ]
    });
  },
} as Command;