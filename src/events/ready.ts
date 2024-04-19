import Client from '../client';
import { ActivityType } from "discord.js";

export default (client: Client) => {
  console.log(`${client.user?.username} ログインしました！`);

  client.application?.commands.set(client.commands.map(v => v.data));

  setInterval(() => {
    client.user?.setActivity({
      type: ActivityType.Custom,
      name: 'customStatus',
      state: 'ping: ' + client.ws.ping + 'ms',
    });
  }, 10000);
}