const { SlashCommandBuilder } = require('discord.js');
const messageHandler = require('../message.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('removebirthday')
		.setDescription('Remove a birthday!')
		.addStringOption(option =>
			option.setName('user')
				.setDescription('Pick 1')),
	async execute(interaction) {
		await messageHandler.removeBirthday(interaction)
	},
};
