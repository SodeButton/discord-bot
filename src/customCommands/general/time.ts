import {CustomCommand} from "../../interfaces";
import {Message} from "discord.js";

export default {
  data: {
    name: 'time',
    description: 'Return the current time',
  },
  execute(message: Message) {
    const date1 = new Date();
    message.channel.send("test -- "+date1.toLocaleString());
  }
} as CustomCommand;