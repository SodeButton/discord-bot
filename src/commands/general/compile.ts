import { Command } from "../../interfaces";
import { EmbedBuilder, MessageResolvable, SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import axios from "axios";
import supportedLanguage from "../../supportedLanguage";
import util from "util";
const wait = util.promisify(setTimeout);

export default {
  data: new SlashCommandBuilder()
    .setName('compile').setDescription('メッセージIDからコードをコンパイルします。')
    .addStringOption(option => option.setName('language').setDescription('コンパイルする言語').setRequired(true))
    .addStringOption(option => option.setName('message_id').setDescription('コンパイルするメッセージのID').setRequired(true)),
  async execute(interaction: ChatInputCommandInteraction) {

    const globalPattern = /```([\s\S]*?)\n([\s\S]*?)\n```/g;
    const localPattern = /```([\s\S]*?)\n([\s\S]*?)\n```/;

    const codeId = interaction.options.getString('message_id');
    let codeMessage = '';
    await interaction.channel?.messages.fetch(codeId as MessageResolvable).then(message => {
      codeMessage = message.content;
    }).catch(() => {
      interaction.reply('```Error: No code provided```');
      return;
    });

    const codeMatch = codeMessage.match(globalPattern);
    if (codeMatch === null) {
      await interaction.reply('```Error: No code provided```');
      return;
    }

    const sourceCode = codeMatch[0].match(localPattern);

    if (sourceCode === null) {
      await interaction.reply('```Error: No code provided```');
      return;
    }

    let inputText = '';
    if (codeMatch.length === 2) {
      const inputMatch = codeMatch[1].match(localPattern);
      if (inputMatch !== null) {
        inputText = inputMatch[2];
      }
    }

    const postData = {
      url: 'https://api.paiza.io/runners/create',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      json: {
        language: sourceCode[1],
        source_code: sourceCode[2],
        input: inputText,
        longpoll: true,
        longpoll_timeout: '',
        api_key: 'guest',
      }
    }

    axios.post(postData.url, postData.json, {
      headers: postData.headers
    }).then(async (response1) => {
      let isCompleted = false;
      while (!isCompleted) {
        axios.get("https://api.paiza.io/runners/get_status", {
          params: {
            id: response1.data.id,
            api_key: 'guest'
          }
        }).then((response2) => {
          if (response2.data.status === 'completed') {
            isCompleted = true;
          }
        });
        if (!isCompleted) await wait(10);
      }

      axios.get("https://api.paiza.io/runners/get_details", {
        params: {
          id: response1.data.id,
          api_key: 'guest'
        }
      }).then(async (response3) => {
        // console.log(response3.data);
        const dataURL = `https://api.paiza.io/runners/get_details?id=${response1.data.id}&api_key=guest`;
        // const buildTime = response3.data['build_time'];
        // const buildMemory = response3.data['build_memory'];
        const resultTime = response3.data['time'];
        const resultMemory = response3.data['memory'];

        if (response3.data['result'] === 'success') {

          const stdout = '```\n' + response3.data.stdout + '\n```';

          const embed = new EmbedBuilder()
            .setColor(0x1e90ff)
            .setTitle('Result')
            .setDescription(`Compiled by [api.paiza.io](https://paiza.io)\n[Compiled Data](${dataURL})`)
            .setTimestamp(new Date())
            .setThumbnail(supportedLanguage[sourceCode[1]].image)
            .setFooter({ text: supportedLanguage[sourceCode[1]].version, iconURL: supportedLanguage[sourceCode[1]].image })
            .setFields([
              {
                name: 'Language',
                value: '`' + supportedLanguage[sourceCode[1]].name + '`',
              },
              {
                name: 'Time',
                value: '`' + resultTime + ' s`',
                inline: true,
              },
              {
                name: 'Memory',
                value: '`' + Number(resultMemory) / 1000000 + ' MB`',
                inline: true,
              },
              {
                name: 'Output',
                value: stdout,
              },
            ]);

          await interaction.reply({ embeds: [embed] });
        } else {
          if (response3.data['build_result'] == 'failure' || response3.data['result'] == 'failure') {
            const stderr = '```\n' + response3.data['build_stderr'] + '\n```';
            const embed = new EmbedBuilder()
              .setColor(0xdc143c)
              .setTitle('Error')
              .setDescription(`Compiled by [api.paiza.io](https://paiza.io)\n[Compiled Data](${dataURL})`)
              .setTimestamp(new Date())
              .setThumbnail(supportedLanguage[sourceCode[1]].image)
              .setFooter({ text: supportedLanguage[sourceCode[1]].version, iconURL: supportedLanguage[sourceCode[1]].image })
              .setFields([
                {
                  name: 'Language',
                  value: '`' + supportedLanguage[sourceCode[1]].name + '`',
                },
                {
                  name: 'Error Message',
                  value: stderr,
                },
              ]);
            await interaction.reply({ embeds: [embed] });
          } else {
            await interaction.reply('Error.');
          }
        }
      });
    });
  }
} as Command;