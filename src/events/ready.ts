import Client from '../client';

export default (client: Client) => {
  console.log(`${client.user?.username} ログインしました！`);

  client.application?.commands.set(client.commands.map(v => v.data));

}