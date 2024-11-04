const { SlashCommandBuilder } = require('discord.js');
const messageHandler = require('../message.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('show')
		.setDescription('Show time!')
		.addStringOption(option =>
			option.setName('showtime')
				.setDescription('Pick your favorite')
				.setRequired(true)
				.addChoices(
					{ name: 'RemovedEntries', value: 'Remove list' },
					{ name: 'Words', value: 'User contributed words' },
					{ name: 'Phrases', value: 'User contributed phrases' },
					{ name: 'Birthday', value: '🎉 Birthdays 🎉' })).addIntegerOption(option =>
						option.setName('index')
							.setDescription('this is a number')),
	async execute(interaction) {
		await messageHandler.printFile(interaction)
	},
};
