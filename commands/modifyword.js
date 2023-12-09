const { SlashCommandBuilder } = require('discord.js');
const messageHandler = require('../message.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('modify')
		.setDescription('Modify a phrase!')
		.addStringOption(option =>
			option.setName('trigger')
				.setDescription('Existing triggers only please')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('reply')
				.setDescription('\"new witty remark\"')
				.setRequired(true)),
	async execute(interaction) {
		await messageHandler.modifyMessage(interaction)
	},
};
