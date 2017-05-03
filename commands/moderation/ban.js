const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');

module.exports = class BanCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'ban',
            aliases: [
                'banne'
            ],
            group: 'moderation',
            memberName: 'ban',
            description: 'Bans a user and logs the ban to the mod_logs.',
            guildOnly: true,
            args: [
                {
                    key: 'member',
                    prompt: 'What member do you want to ban?',
                    type: 'member'
                },
                {
                    key: 'reason',
                    prompt: 'What do you want to set the reason as?',
                    type: 'string',
                    validate: reason => {
                        if (reason.length < 140) {
                            return true;
                        }
                        return `Please keep your reason under 140 characters, you have ${reason.length}.`;
                    }
                }
            ]
        });
    }
    
    hasPermission(msg) {
        return msg.member.hasPermission('BAN_MEMBERS') || msg.member.roles.exists('name', msg.guild.settings.get('staffRole', 'Server Staff'));
    }

    async run(msg, args) {
        if (!msg.channel.permissionsFor(this.client.user).has('BAN_MEMBERS'))
            return msg.say('This Command requires the `Ban Members` Permission.');
        const modlogs = msg.guild.channels.find('name', msg.guild.settings.get('modLog', 'mod_logs'));
        if (!modlogs)
            return msg.say('This Command requires a channel named `mod_logs` or one custom set with the `modchannel` command.');
        if (!modlogs.permissionsFor(this.client.user).has('EMBED_LINKS'))
            return msg.say('This Command requires the `Embed Links` Permission.');
        const { member, reason } = args;
        if (!member.bannable)
            return msg.say('This member is not bannable. Perhaps they have a higher role than me?');
        try {
            try {
                await member.send(
                    `You were banned from ${msg.guild.name}!
                    Reason: ${reason}.`
                );
            } catch (err) {
                await msg.say('Failed to send DM to user.');
            }
            await member.ban({
                days: 7,
                reason
            });
            await msg.say(':ok_hand:');
            const embed = new RichEmbed()
                .setAuthor(msg.author.tag, msg.author.displayAvatarURL)
                .setColor(0xFF0000)
                .setTimestamp()
                .setDescription(
                    `**Member:** ${member.user.tag} (${member.id})
                    **Action:** Ban
                    **Reason:** ${reason}`
                );
            return modlogs.send({embed});
        } catch (err) {
            return msg.say('An Unknown Error Occurred.');
        }
    }
};
