const { SlashCommandBuilder } = require('discord.js');
const messageHandler = require('../message.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remove')
		.setDescription('Remove a phrase!')
		.addStringOption(option =>
			option.setName('trigger')
				.setDescription('Get them good with it')
				.setRequired(true)),
	async execute(interaction) {
		await messageHandler.removeMessage(interaction)
	},
};
