import {CustomCommand} from "../../interfaces";
import {EmbedBuilder, Message} from "discord.js";
import axios from "axios";
import util from "util";
import supportedLanguage from "../../supportedLanguage";

const wait = util.promisify(setTimeout);

export default {
  data: {
    name: 'compile',
    description: 'compiling program',
  },
  execute(message: Message) {
    const globalPattern = /```([\s\S]*?)\n([\s\S]*?)\n```/g;
    const localPattern = /```([\s\S]*?)\n([\s\S]*?)\n```/;

    const text = message.content.match(globalPattern);
    if (text === null) {
      message.channel.send('```Error: No code provided```');
      return;
    }

    const sourceCode = text[0].match(localPattern);

    if (sourceCode === null) {
      message.channel.send('```Error: No code provided```');
      return;
    }

    let inputText = '';
    if (text.length === 2) {
      const inputMatch = text[1].match(localPattern);
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
      while(!isCompleted) {
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
        console.log(response3.data);
        const dataURL = `https://api.paiza.io/runners/get_details?id=${response1.data.id}&api_key=guest`;
        // const buildTime = response3.data['build_time'];
        // const buildMemory = response3.data['build_memory'];
        const resultTime = response3.data['time'];
        const resultMemory = response3.data['memory'];

        if (response3.data['result'] === 'success') {

          const stdout= '```\n' + response3.data.stdout + '\n```';

          const embed = new EmbedBuilder()
            .setColor(0x1e90ff)
            .setTitle('Result')
            .setDescription(`Compiled by [api.paiza.io](https://paiza.io)\n[Compiled Data](${dataURL})`)
            .setTimestamp(new Date())
            .setThumbnail(supportedLanguage[sourceCode[1]].image)
            .setFooter({ text: supportedLanguage[sourceCode[1]].version, iconURL: supportedLanguage[sourceCode[1]].image})
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

          await message.channel.send({ embeds: [embed] });
        } else {
          if (response3.data['build_result'] == 'failure' || response3.data['result'] == 'failure') {
            const stderr = '```\n' + response3.data['build_stderr'] + '\n```';
            const embed = new EmbedBuilder()
              .setColor(0xdc143c)
              .setTitle('Error')
              .setDescription(`Compiled by [api.paiza.io](https://paiza.io)\n[Compiled Data](${dataURL})`)
              .setTimestamp(new Date())
              .setThumbnail(supportedLanguage[sourceCode[1]].image)
              .setFooter({ text: supportedLanguage[sourceCode[1]].version, iconURL: supportedLanguage[sourceCode[1]].image})
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
                  name: 'Error Message',
                  value: stderr,
                },
              ]);
            await message.channel.send({ embeds: [embed] });
          } else {
            await message.channel.send('Error.');
          }
        }
      });
    });
  }
} as CustomCommand;