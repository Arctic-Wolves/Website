const { Client } = require('discord.js');
const LeafDB = require('leaf-db').default;

const { zPad } = require('../../utils');

module.exports = class App {
  constructor(root, token, owner) {
    this.token = token;
    this.owner = owner;

    this.client = new Client();
    this.cache = { users: {} };
    this.db = {
      channels: new LeafDB('channels', { root }),
      users: new LeafDB('users', { root }),
      images: new LeafDB('images', { root })
    };

    this.handleMessage = this.handleMessage.bind(this);
    this.handleModerator = this.handleModerator.bind(this);
    this.handleMention = this.handleMention.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.handleReady = this.handleReady.bind(this);
    this.run = this.run.bind(this);

    this.client.on('message', this.handleMessage);
    this.client.on('ready', this.handleReady);
  }

  async handleMessage(message) {
    switch (true) {
      case message.mentions.has(this.client.user.id): {
        const reply = message.author.id === this.owner ?
          await this.handleModerator(message) :
          await this.handleMention(message);
        message.reply(reply);
        break;
      }
      case message.attachments.size > 0:
        this.handleUpload(message);
        break;
      default:
        break;
    }
  }

  async handleModerator(message) {
    const args = message.content.split(' ').slice(1);

    if (args.length > 0) {
      const channel = message.guild.channels.cache.get(args[1]);

      switch (args[0]) {
        case 'watch':
          if (!channel) return 'Sorry, but I couldn\'t find that channel';

          await this.db.channels.insert(
            { _id: args[1], name: channel.name },
            { persist: true }
          );

          return `Alright, I'll keep my eyes on #${channel.name}!`;
        case 'unwatch':
          if (!channel) return 'Sorry, but I couldn\'t find that channel';

          await this.db.channels.deleteById(args[1], { persist: true });

          return `Alright, I'll stop watching #${channel.name}!`;
        default:
          return 'Sorry, all I know is `watch` and `unwatch`';
      }
    }

    const reply = await this.handleMention(message);
    return reply;
  }

  async handleMention(message) {
    const keysDelete = ['remove', 'delete'];
    const users = await this.db.users.findById(message.author.id);

    // Unregistered
    if (users.length === 0) {
      // New user
      if (!this.cache.users[message.author.id]) {
        this.cache.users[message.author.id] = true;

        return 'Welcome to the Hard Place! Please tell me your name and I will add you to our guest list!';
      }

      const name = message.content.split(' ').slice(1).join(' ');
      if (!name) return 'Zhloe can\'t accept your works if you don\'t tell me your name...';

      await this.db.users.insert(
        { _id: message.author.id, name, images: [] },
        { persist: true }
      );
      this.cache.users[message.author.id] = false;

      return `${name}? Yes, a very good name! Almost as good as fresh pineapple pudding! The Hard Place thanks you for your future contributions to our gallery!`;
    }

    // Remove from database
    if (keysDelete.some(key => message.content.toLowerCase().includes(key))) {
      await this.db.users.deleteById(message.author.id, { persist: true });

      return `Alright, I removed you from our list. Thank you for your contributions ${users[0].name}!`;
    }

    return `Welcome ${users[0].name}! If you wish to remove yourself from our guest list, please type a message including the words ${keysDelete.map(key => `\`${key}\``).join(' or ')}`;
  }

  async handleUpload(message) {
    const users = await this.db.users.findById(message.author.id);

    if (users.length !== 0) {
      const docCollection = message.attachments
        .filter(attachtment => ['png', 'jpg', 'jpeg'].some(fileType => attachtment.name.includes(fileType)))
        .map(attachment => ({
          _id: attachment.name.split('.').slice(0, -1).join('.'),
          url: attachment.url,
          width: attachment.width,
          height: attachment.height
        }));

      for (let i = 0, docs = [...docCollection]; i < docs.length; i += 1) {
        const attachment = docs[i];

        try {
          await this.db.images.insert({
            ...attachment,
            date: new Date().toISOString()
          }, { persist: true });
          await this.db.users.updateById(
            message.author.id,
            { $push: { images: attachment._id } },
            { persist: true }
          );
        } catch (err) {
          console.warn(err);
        }
      }
    }
  }

  async handleReady() {
    const invite = await this.client.generateInvite({ permissions: ['SEND_MESSAGES'] });

    setInterval(async () => {
      const date = new Date();
      const hours = zPad(date.getUTCHours(), 2);
      const minutes = zPad(date.getUTCMinutes(), 2);

      await this.client.user.setActivity(`${hours}:${minutes} ST`);
    }, 1000);

    console.log(`The Hard Place is open for business! ${invite}`);
  }

  run() {
    this.client.login(this.token);
  }
};
