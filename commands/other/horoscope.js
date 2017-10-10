const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const snekfetch = require('snekfetch');
const { list } = require('../../structures/Util');
const signs = require('../../assets/json/horoscope');

module.exports = class HoroscopeCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'horoscope',
			group: 'other',
			memberName: 'horoscope',
			description: 'Responds with today\'s horoscope for a particular sign.',
			details: `**Signs**: ${signs.join(', ')}`,
			clientPermissions: ['EMBED_LINKS'],
			args: [
				{
					key: 'sign',
					prompt: `Which sign would you like to get the horoscope for? Either ${list(signs, 'or')}.`,
					type: 'string',
					validate: sign => {
						if (signs.includes(sign.toLowerCase())) return true;
						return `Invalid sign, please enter either ${list(signs, 'or')}.`;
					},
					parse: sign => sign.toLowerCase()
				}
			]
		});
	}

	async run(msg, { sign }) {
		try {
			const { text } = await snekfetch.get(`http://sandipbgt.com/theastrologer/api/horoscope/${sign}/today/`);
			const body = JSON.parse(text);
			const embed = new MessageEmbed()
				.setColor(0x9797FF)
				.setTitle(`Horoscope for ${body.sunsign}...`)
				.setURL('https://new.theastrologer.com/horoscopes/')
				.setTimestamp()
				.setDescription(body.horoscope)
				.addField('❯ Mood',
					body.meta.mood, true)
				.addField('❯ Intensity',
					body.meta.intensity, true)
				.addField('❯ Date',
					body.date, true);
			return msg.embed(embed);
		} catch (err) {
			return msg.say(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
		}
	}
};
